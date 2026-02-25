import React, { useCallback, useEffect, useRef, useState } from 'react';
import { karelLevels, GridPos, Direction } from '@/data/karelLevels';
import { useSearchParams } from 'react-router-dom';
import LevelNavbar from '@/components/LevelNavbar';
import {
  IconArrowUp,
  IconBall,
  IconCheck,
  IconPick,
  IconPut,
  IconRobot,
  IconTurnLeft,
  IconTurnRight,
} from '@/components/GameIcons';

type BlockType = 'Move' | 'TurnLeft' | 'TurnRight' | 'Pick' | 'Put';

const BLOCKS: { type: BlockType; label: React.ReactNode }[] = [
  { type: 'Move', label: <IconArrowUp className="text-slate-100" size={22} /> },
  { type: 'TurnLeft', label: <IconTurnLeft className="text-slate-100" size={22} /> },
  { type: 'TurnRight', label: <IconTurnRight className="text-slate-100" size={22} /> },
  { type: 'Pick', label: <IconPick className="text-slate-100" size={22} /> },
  { type: 'Put', label: <IconPut className="text-slate-100" size={22} /> },
];

interface RobotState {
  pos: GridPos;
  dir: Direction;
  balls: number; // Balls held by robot
}

// Direction helpers
const DIRS: Direction[] = ['N', 'E', 'S', 'W'];
const DIR_VECTORS: Record<Direction, GridPos> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export default function KarelGame({
  initialLevel,
  onLevelComplete,
}: {
  initialLevel: number;
  onLevelComplete: (level: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL level param logic
  const parsed = Number.parseInt(searchParams.get('lv') || '1', 10);
  const urlLv = Number.isFinite(parsed) ? parsed : 1;
  // Ensure we don't go beyond unlocked level (initialLevel + 1 roughly corresponds to next available)
  // Actually initialLevel passed prop is "current max completed level" or "current level"?
  // Let's assume initialLevel is the MAX UNLOCKED level index (0-based) or count?
  // Let's assume prop `initialLevel` is the highest COMPLETED level. So `initialLevel + 1` is current playable.
  // Actually, Course.tsx passes `currentLevel` which is usually the index of the next module.
  // For the game, let's treat `initialLevel` as the index of the level we are allowed to play (0..14).
  
  // We need to clamp urlLv (1-based) to be <= initialLevel + 1
  const maxAllowedLevel = initialLevel + 1;
  const targetLevelId = Math.min(Math.max(1, urlLv), Math.min(maxAllowedLevel, 15));
  
  const levelIndex = targetLevelId - 1;
  // Ensure levelIndex is valid, fallback to 0 if out of bounds (though clamping above should prevent this)
  const safeLevelIndex = Math.max(0, Math.min(levelIndex, karelLevels.length - 1));
  const levelConfig = karelLevels[safeLevelIndex];

  // Game State
  const [code, setCode] = useState<BlockType[]>([]);
  const [robot, setRobot] = useState<RobotState>({ pos: { x: 0, y: 0 }, dir: 'E', balls: 0 });
  const [gridBalls, setGridBalls] = useState<GridPos[]>([]); // Balls on grid
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchParams.has('lv')) {
      setSearchParams(prev => {
        prev.set('lv', '1');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sync URL if needed
  useEffect(() => {
    if (urlLv !== targetLevelId) {
      setSearchParams(prev => {
        prev.set('lv', targetLevelId.toString());
        return prev;
      }, { replace: true });
    }
  }, [urlLv, targetLevelId, setSearchParams]);

  const resetLevel = useCallback(() => {
    if (!levelConfig) return;
    setRobot({ 
      pos: { ...levelConfig.startPos }, 
      dir: levelConfig.startDir, 
      balls: 0 
    });
    setGridBalls([...levelConfig.balls]);
    setIsRunning(false);
    setIsWon(false);
    setErrorMsg(null);
    setActiveLine(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [levelConfig]);

  // Reset level when config changes
  useEffect(() => {
    resetLevel();
  }, [resetLevel]);

  const addBlock = (type: BlockType) => {
    if (isRunning) return;
    setCode(prev => [...prev, type]);
  };

  const removeBlock = (index: number) => {
    if (isRunning) return;
    setCode(prev => prev.filter((_, i) => i !== index));
  };

  

  // --- Robust Simulation Engine ---
  // We'll actually simulate the whole thing step-by-step using a Ref to hold state during run
  // and sync to React state for rendering.
  const simState = useRef<{ robot: RobotState; gridBalls: GridPos[] }>({ 
    robot: { pos: { x: 0, y: 0 }, dir: 'E', balls: 0 }, 
    gridBalls: [] 
  });

  const runSimulation = () => {
    if (isRunning) return;
    
    // Init sim state
    simState.current = {
      robot: { pos: { ...levelConfig.startPos }, dir: levelConfig.startDir, balls: 0 },
      gridBalls: [...levelConfig.balls]
    };
    
    // Sync UI
    setRobot(simState.current.robot);
    setGridBalls(simState.current.gridBalls);
    setErrorMsg(null);
    setIsWon(false);
    setIsRunning(true);

    let step = 0;

    const tick = () => {
      if (step >= code.length) {
        checkWin(simState.current);
        setIsRunning(false);
        setActiveLine(null);
        return;
      }

      setActiveLine(step);
      const block = code[step];
      const state = simState.current;
      let error = null;

      if (block === 'TurnLeft') {
        const idx = DIRS.indexOf(state.robot.dir);
        state.robot.dir = DIRS[(idx + 3) % 4];
      } else if (block === 'TurnRight') {
        const idx = DIRS.indexOf(state.robot.dir);
        state.robot.dir = DIRS[(idx + 1) % 4];
      } else if (block === 'Move') {
        const vec = DIR_VECTORS[state.robot.dir];
        const nextPos = { x: state.robot.pos.x + vec.x, y: state.robot.pos.y + vec.y };
        
        // Bounds
        if (nextPos.x < 0 || nextPos.x >= levelConfig.gridSize.cols ||
            nextPos.y < 0 || nextPos.y >= levelConfig.gridSize.rows) {
          error = "Crashed into world edge!";
        }
        // Walls
        else if (levelConfig.walls.some(w => w.x === nextPos.x && w.y === nextPos.y)) {
          error = "Crashed into wall!";
        } 
        else {
          state.robot.pos = nextPos;
        }
      } else if (block === 'Pick') {
        const ballIdx = state.gridBalls.findIndex(b => b.x === state.robot.pos.x && b.y === state.robot.pos.y);
        if (ballIdx !== -1) {
          state.robot.balls++;
          state.gridBalls.splice(ballIdx, 1); // Remove ball
        } else {
          error = "No ball here!";
        }
      } else if (block === 'Put') {
        if (state.robot.balls > 0) {
          state.robot.balls--;
          state.gridBalls.push({ ...state.robot.pos });
        } else {
          error = "No balls to put!";
        }
      }

      // Sync UI
      setRobot({ ...state.robot });
      setGridBalls([...state.gridBalls]);

      if (error) {
        setErrorMsg(error);
        setIsRunning(false);
        setActiveLine(null);
      } else {
        step++;
        timeoutRef.current = setTimeout(tick, 500); // 500ms delay
      }
    };

    tick();
  };

  const checkWin = (finalState: { robot: RobotState; gridBalls: GridPos[] }) => {
    const { pos } = finalState.robot;
    const { goal } = levelConfig;
    
    // Check position
    if (pos.x !== goal.pos.x || pos.y !== goal.pos.y) {
      setErrorMsg("Did not reach the goal!");
      return;
    }

    // Check balls collected (assuming we need to pick them all up, or specific objective)
    // Based on level config, `requiredBalls` is essentially "all balls on map should be picked" 
    // OR "robot should have X balls".
    // If we assume "Pick up all balls" means gridBalls should be empty? 
    // Or robot.balls == requiredBalls.
    // Let's go with: Robot must have collected `requiredBalls` (which matches balls.length in config).
    if (finalState.robot.balls !== goal.requiredBalls) {
      setErrorMsg(`Collected ${finalState.robot.balls}/${goal.requiredBalls} balls.`);
      return;
    }

    setIsWon(true);
    // Trigger progress update
    onLevelComplete(targetLevelId);
  };

  if (!levelConfig) return <div>Level not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <LevelNavbar
        totalLevels={15}
        activeLevelId={targetLevelId}
        initialCompletedLevel={initialLevel}
        isRunning={isRunning}
        onSelectLevel={(id) => {
          setSearchParams(prev => {
            prev.set('lv', String(id));
            return prev;
          });
        }}
      />
      {/* Top: Game Area */}
      <div className="flex-1 bg-slate-900 p-4 flex items-center justify-center relative">
        <div className="relative bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl p-4">
          {/* Level Info */}
          <div className="absolute -top-12 left-0 text-white font-bold text-lg">
            Level {targetLevelId}: {levelConfig.description}
          </div>
          {isWon && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center animate-bounce">
                <div className="flex items-center justify-center">
                  <IconCheck className="text-green-400" size={56} />
                </div>
                <h2 className="text-2xl font-bold text-green-400 mt-2">Level Complete!</h2>
                {targetLevelId < 15 && (
                  <button 
                    onClick={() => {
                      setSearchParams(prev => {
                        prev.set('lv', String(targetLevelId + 1));
                        return prev;
                      });
                      setCode([]);
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold"
                  >
                    Next Level
                  </button>
                )}
              </div>
            </div>
          )}
          {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-red-600/90 text-white px-4 py-2 rounded shadow-lg">
              {errorMsg}
            </div>
          )}

          {/* Grid Render */}
          <div 
            className="grid gap-1 bg-slate-700 p-1 rounded"
            style={{ 
              gridTemplateColumns: `repeat(${levelConfig.gridSize.cols}, 64px)`,
              gridTemplateRows: `repeat(${levelConfig.gridSize.rows}, 64px)`
            }}
          >
            {Array.from({ length: levelConfig.gridSize.rows * levelConfig.gridSize.cols }).map((_, idx) => {
              const x = idx % levelConfig.gridSize.cols;
              const y = Math.floor(idx / levelConfig.gridSize.cols);
              
              const isWall = levelConfig.walls.some(w => w.x === x && w.y === y);
              const isBall = gridBalls.some(b => b.x === x && b.y === y);
              const isRobot = robot.pos.x === x && robot.pos.y === y;
              const isGoal = levelConfig.goal.pos.x === x && levelConfig.goal.pos.y === y;

              return (
                <div key={idx} className={`w-16 h-16 relative flex items-center justify-center rounded-sm ${isWall ? 'bg-slate-600 border-4 border-slate-500' : 'bg-slate-800 border border-slate-700'}`}>
                  {isGoal && !isWall && <div className="absolute inset-2 border-4 border-green-500/30 rounded-full animate-pulse" />}
                  {isBall ? <IconBall className="text-amber-300 z-10" size={26} /> : null}
                  {isRobot ? (
                    <div
                      className="z-20 transition-all duration-300"
                      style={{
                        transform: `rotate(${robot.dir === 'E' ? 0 : robot.dir === 'S' ? 90 : robot.dir === 'W' ? 180 : -90}deg)`,
                      }}
                    >
                      <IconRobot className="text-sky-300" size={34} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Code Editor */}
      <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900">
          <div className="flex gap-2">
            {BLOCKS.map(b => (
              <button
                key={b.type}
                onClick={() => addBlock(b.type)}
                disabled={isRunning}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xl transition-colors disabled:opacity-50"
                title={b.type}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetLevel}
              disabled={isRunning}
              className="px-4 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-medium disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        {/* Code Slots Timeline */}
        <div className="flex-1 overflow-x-auto p-4 flex items-center gap-2">
          {code.length === 0 && <div className="text-slate-500 italic px-4">Add blocks to start coding...</div>}
          
          {code.map((block, i) => (
            <div 
              key={i} 
              className={`relative group shrink-0 w-12 h-12 flex items-center justify-center rounded border-2 text-2xl bg-slate-800 cursor-pointer hover:border-red-500 transition-all ${
                activeLine === i ? 'border-yellow-400 bg-slate-700 scale-110 shadow-lg shadow-yellow-500/20' : 'border-slate-600'
              }`}
              onClick={() => removeBlock(i)}
            >
              {BLOCKS.find(b => b.type === block)?.label}
              <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] items-center justify-center text-white hidden group-hover:flex">×</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
