import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LevelNavbar from '@/components/LevelNavbar';
import SidePanel from '@/components/blockly1/SidePanel';
import { KarelWorldLevel, KWBallStack, KWPos, blockly1KarelWorldLevels } from '@/data/blocklyKarelWorldLevels';
import useBlocklyKarelWorldWorkspace from '@/hooks/useBlocklyKarelWorldWorkspace';
import { compileWorkspaceToSteps } from '@/utils/blocklyKarelWorld';

type Speed = 1 | 2;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const keyOf = (p: KWPos) => `${p.x},${p.y}`;

const inBounds = (p: KWPos, lvl: KarelWorldLevel) => p.x >= 0 && p.y >= 0 && p.x < lvl.cols && p.y < lvl.rows;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const storageKeyWorkspace = (levelId: number) => `codemyni_blockly1_workspace_lv_${levelId}`;

export default function Blockly1KarelWorld({
  initialLevel,
  onLevelComplete,
}: {
  initialLevel: number;
  onLevelComplete: (level: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = Number.parseInt(searchParams.get('lv') || '1', 10);
  const urlLv = Number.isFinite(parsed) ? parsed : 1;

  const [localCompletedLevel, setLocalCompletedLevel] = useState(0);
  const effectiveCompletedLevel = Math.max(initialLevel, localCompletedLevel);

  const maxAllowedLevel = effectiveCompletedLevel + 1;
  const targetLevelId = clamp(urlLv, 1, Math.min(maxAllowedLevel, 15));
  const safeIndex = clamp(targetLevelId - 1, 0, blockly1KarelWorldLevels.length - 1);
  const level = blockly1KarelWorldLevels[safeIndex];

  const wallSet = useMemo(() => new Set(level.walls.map(w => keyOf(w))), [level.walls]);

  const [robotPos, setRobotPos] = useState<KWPos>({ ...level.startPos });
  const [robotCarry, setRobotCarry] = useState(0);
  const [groundBalls, setGroundBalls] = useState<KWBallStack[]>([...level.balls]);

  const [speed, setSpeed] = useState<Speed>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { blocklyDivRef, workspaceRef, compile, setCompile: setHookCompile } = useBlocklyKarelWorldWorkspace({
    levelId: level.id,
    allowed: level.allowed,
    storageKey: storageKeyWorkspace,
  });
  const runIdRef = useRef(0);
  useEffect(() => {
    if (!searchParams.has('lv')) {
      setSearchParams(
        prev => {
          prev.set('lv', '1');
          return prev;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (urlLv !== targetLevelId) {
      setSearchParams(
        prev => {
          prev.set('lv', String(targetLevelId));
          return prev;
        },
        { replace: true },
      );
    }
  }, [urlLv, targetLevelId, setSearchParams]);

  useEffect(() => {
    runIdRef.current++;
    setIsRunning(false);
    setWon(false);
    setError(null);
    setRobotPos({ ...level.startPos });
    setRobotCarry(0);
    setGroundBalls([...level.balls]);

  }, [level]);

  useEffect(() => {
    setLocalCompletedLevel(0);
  }, [initialLevel]);

  const reset = () => {
    runIdRef.current++;
    setIsRunning(false);
    setWon(false);
    setError(null);
    setRobotPos({ ...level.startPos });
    setRobotCarry(0);
    setGroundBalls([...level.balls]);
  };

  const validateWin = (pos: KWPos, carry: number, balls: KWBallStack[]) => {
    if (pos.x !== level.goalPos.x || pos.y !== level.goalPos.y) return { ok: false, error: 'Belum sampai tujuan.' };
    if (carry < level.requiredCarry) return { ok: false, error: `Bola di tangan kurang (${carry}/${level.requiredCarry}).` };
    for (const t of level.placeTargets) {
      const b = balls.find(bb => bb.pos.x === t.pos.x && bb.pos.y === t.pos.y);
      const c = b ? b.count : 0;
      if (c < t.count) return { ok: false, error: `Target bola belum lengkap di (${t.pos.x},${t.pos.y}).` };
    }
    return { ok: true as const };
  };

  const run = async () => {
    if (isRunning) return;
    const ws = workspaceRef.current;
    if (!ws) return;

    const compiled = compileWorkspaceToSteps(ws);
    setHookCompile(compiled);
    if (compiled.ok === false) {
      setError(compiled.error);
      return;
    }

    const steps = compiled.steps;
    const runId = ++runIdRef.current;

    setIsRunning(true);
    setWon(false);
    setError(null);

    let pos: KWPos = { ...level.startPos };
    let carry = 0;
    let balls: KWBallStack[] = level.balls.map(b => ({ pos: { ...b.pos }, count: b.count }));

    const commit = () => {
      setRobotPos({ ...pos });
      setRobotCarry(carry);
      setGroundBalls(balls.map(b => ({ pos: { ...b.pos }, count: b.count })));
    };

    const getBallCountAt = (p: KWPos) => balls.find(b => b.pos.x === p.x && b.pos.y === p.y)?.count ?? 0;
    const setBallCountAt = (p: KWPos, count: number) => {
      const idx = balls.findIndex(b => b.pos.x === p.x && b.pos.y === p.y);
      if (idx >= 0) {
        if (count <= 0) balls = balls.filter((_, i) => i !== idx);
        else balls[idx] = { pos: balls[idx].pos, count };
      } else if (count > 0) {
        balls.push({ pos: { ...p }, count });
      }
    };

    const stepDelay = speed === 2 ? 140 : 280;

    for (let i = 0; i < steps.length; i++) {
      if (runIdRef.current !== runId) return;

      const s = steps[i];
      if (s.type.startsWith('move_')) {
        const delta: KWPos =
          s.type === 'move_up'
            ? { x: 0, y: -1 }
            : s.type === 'move_right'
              ? { x: 1, y: 0 }
              : s.type === 'move_down'
                ? { x: 0, y: 1 }
                : { x: -1, y: 0 };

        const next = { x: pos.x + delta.x, y: pos.y + delta.y };
        if (!inBounds(next, level)) {
          setError('Karel keluar arena.');
          setIsRunning(false);
          return;
        }
        if (wallSet.has(keyOf(next))) {
          setError('Karel menabrak tembok.');
          setIsRunning(false);
          return;
        }
        pos = next;
        commit();
        await sleep(stepDelay);
        continue;
      }

      if (s.type === 'pick') {
        const c = getBallCountAt(pos);
        if (c <= 0) {
          setError('Tidak ada bola untuk diambil.');
          setIsRunning(false);
          return;
        }
        setBallCountAt(pos, c - 1);
        carry++;
        commit();
        await sleep(stepDelay);
        continue;
      }

      if (s.type === 'put') {
        if (carry <= 0) {
          setError('Tidak ada bola untuk diletakkan.');
          setIsRunning(false);
          return;
        }
        const c = getBallCountAt(pos);
        setBallCountAt(pos, c + 1);
        carry--;
        commit();
        await sleep(stepDelay);
        continue;
      }
    }

    const res = validateWin(pos, carry, balls);
    setIsRunning(false);
    if (res.ok) {
      setWon(true);
      setLocalCompletedLevel(prev => Math.max(prev, level.id));
      onLevelComplete(level.id);
    } else {
      setError(res.error);
    }
  };



  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <LevelNavbar
        totalLevels={15}
        activeLevelId={targetLevelId}
        initialCompletedLevel={effectiveCompletedLevel}
        isRunning={isRunning}
        onSelectLevel={(id) => {
          setSearchParams(prev => {
            prev.set('lv', String(id));
            return prev;
          });
        }}
      />

      <div className="flex-1 bg-slate-950 p-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 h-full">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden min-h-[520px]">
            <div className="h-12 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">blockly1 — Karel World</div>
                <div className="text-slate-400 text-xs">Level {level.id}: {level.title}</div>
              </div>
              <div className="text-slate-300 text-sm">Bola di tangan: {robotCarry}</div>
            </div>
            <div className="h-[calc(100%-48px)]" ref={blocklyDivRef} />
          </div>

          <SidePanel
            level={level}
            robotPos={robotPos}
            robotCarry={robotCarry}
            groundBalls={groundBalls}
            speed={speed}
            setSpeed={setSpeed}
            isRunning={isRunning}
            won={won}
            error={error}
            onReset={reset}
            onRun={run}
            onContinue={() => {
              setSearchParams(prev => {
                prev.set('lv', String(Math.min(15, targetLevelId + 1)));
                return prev;
              });
            }}
            compile={compile}
          />
        </div>
      </div>
    </div>
  );
}
