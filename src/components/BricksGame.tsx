import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bricksLevels, BricksLevel } from '@/data/bricksLevels';
import LevelNavbar from '@/components/LevelNavbar';
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconBrick, IconCheck, IconRepeat } from '@/components/GameIcons';

type BlockType = 'Left' | 'Right' | 'Drop' | 'Repeat';

type ProgramItem =
  | { kind: 'action'; action: Exclude<BlockType, 'Repeat'> }
  | { kind: 'repeat'; times: 2 | 3 | 4 };

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const blockLabel = (t: BlockType) => {
  if (t === 'Left') return <IconArrowLeft className="text-slate-100" size={18} />;
  if (t === 'Right') return <IconArrowRight className="text-slate-100" size={18} />;
  if (t === 'Drop') {
    return (
      <span className="inline-flex items-center gap-1">
        <IconBrick className="text-slate-100" size={18} />
        <IconArrowDown className="text-slate-100" size={16} />
      </span>
    );
  }
  return <IconRepeat className="text-slate-100" size={18} />;
};

const computeTargetHeight = (lvl: BricksLevel) => Math.max(...lvl.initialHeights);

export default function BricksGame({
  initialLevel,
  onLevelComplete,
}: {
  initialLevel: number;
  onLevelComplete: (level: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsed = Number.parseInt(searchParams.get('lv') || '1', 10);
  const urlLv = Number.isFinite(parsed) ? parsed : 1;

  const maxAllowedLevel = initialLevel + 1;
  const targetLevelId = clamp(urlLv, 1, Math.min(maxAllowedLevel, 15));
  const safeIndex = clamp(targetLevelId - 1, 0, bricksLevels.length - 1);
  const level = bricksLevels[safeIndex];

  const targetHeight = useMemo(() => computeTargetHeight(level), [level]);

  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [heights, setHeights] = useState<number[]>([...level.initialHeights]);
  const [cursorX, setCursorX] = useState(level.startX);
  const [isRunning, setIsRunning] = useState(false);
  const [falling, setFalling] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const runIdRef = useRef(0);

  useEffect(() => {
    if (!searchParams.has('lv')) {
      setSearchParams(prev => {
        prev.set('lv', '1');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (urlLv !== targetLevelId) {
      setSearchParams(prev => {
        prev.set('lv', String(targetLevelId));
        return prev;
      }, { replace: true });
    }
  }, [urlLv, targetLevelId, setSearchParams]);

  useEffect(() => {
    setProgram([]);
    setHeights([...level.initialHeights]);
    setCursorX(level.startX);
    setIsRunning(false);
    setFalling(null);
    setError(null);
    setWon(false);
  }, [level.id, level.initialHeights, level.startX]);

  const addAction = (action: Exclude<BlockType, 'Repeat'>) => {
    if (isRunning) return;
    setProgram(prev => [...prev, { kind: 'action', action }]);
  };

  const addRepeat = () => {
    if (isRunning) return;
    setProgram(prev => [...prev, { kind: 'repeat', times: 2 }]);
  };

  const removeAt = (idx: number) => {
    if (isRunning) return;
    setProgram(prev => prev.filter((_, i) => i !== idx));
  };

  const cycleRepeatTimes = (idx: number) => {
    if (isRunning) return;
    setProgram(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      if (it.kind !== 'repeat') return it;
      const next = it.times === 2 ? 3 : it.times === 3 ? 4 : 2;
      return { ...it, times: next };
    }));
  };

  const reset = () => {
    if (isRunning) return;
    setHeights([...level.initialHeights]);
    setCursorX(level.startX);
    setFalling(null);
    setError(null);
    setWon(false);
  };

  const isSolved = (h: number[]) => h.every(v => v === targetHeight);

  const run = async () => {
    if (isRunning) return;
    const runId = ++runIdRef.current;

    setIsRunning(true);
    setError(null);
    setWon(false);
    setFalling(null);

    let x = level.startX;
    const h = [...level.initialHeights];
    let lastAction: Exclude<BlockType, 'Repeat'> | null = null;

    const expandProgram = (): Exclude<BlockType, 'Repeat'>[] => {
      const out: Exclude<BlockType, 'Repeat'>[] = [];
      for (const item of program) {
        if (item.kind === 'action') {
          out.push(item.action);
          lastAction = item.action;
          continue;
        }
        if (!lastAction) {
          throw new Error('Repeat butuh aksi sebelumnya.');
        }
        for (let t = 0; t < item.times; t++) {
          out.push(lastAction);
        }
      }
      return out;
    };

    let steps: Exclude<BlockType, 'Repeat'>[];
    try {
      steps = expandProgram();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Program tidak valid.');
      setIsRunning(false);
      return;
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const commit = () => {
      setCursorX(x);
      setHeights([...h]);
    };

    for (let i = 0; i < steps.length; i++) {
      if (runIdRef.current !== runId) return;

      const action = steps[i];
      if (action === 'Left') {
        x = Math.max(0, x - 1);
        commit();
        await sleep(180);
        continue;
      }
      if (action === 'Right') {
        x = Math.min(level.cols - 1, x + 1);
        commit();
        await sleep(180);
        continue;
      }
      if (action === 'Drop') {
        if (h[x] >= level.maxHeight) {
          setError('Kolom sudah penuh.');
          setIsRunning(false);
          return;
        }

        const startYTop = 0;
        const endYTop = level.maxHeight - 1 - h[x];
        for (let yTop = startYTop; yTop <= endYTop; yTop++) {
          if (runIdRef.current !== runId) return;
          setFalling({ x, y: yTop });
          await sleep(70);
        }
        setFalling(null);
        h[x] = h[x] + 1;
        commit();
        await sleep(120);
        continue;
      }
    }

    const solved = isSolved(h);
    setWon(solved);
    setIsRunning(false);

    if (solved) {
      onLevelComplete(level.id);
    } else {
      setError('Permukaan belum rata. Coba lagi.');
    }
  };

  const cell = 36;
  const gridW = level.cols * cell;
  const gridH = level.maxHeight * cell;

  const renderCell = (col: number, rowFromBottom: number) => {
    const filled = rowFromBottom < heights[col];
    const yTop = level.maxHeight - 1 - rowFromBottom;
    const isFalling = falling && falling.x === col && falling.y === yTop;
    const showTargetLine = rowFromBottom === targetHeight;

    return (
      <div
        key={`${col}-${rowFromBottom}`}
        className={`w-9 h-9 border border-slate-800 flex items-center justify-center ${
          filled ? 'bg-orange-600/80' : 'bg-slate-900'
        }`}
      >
        {showTargetLine ? <div className="w-full h-[2px] bg-blue-500/40" /> : null}
        {isFalling ? <IconBrick className="text-orange-300" size={18} /> : null}
      </div>
    );
  };

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
      <div className="flex-1 bg-slate-900 p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-5xl flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">Level {targetLevelId} / 15</div>
            <div className="text-slate-400 text-sm">{level.title}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-sm">Target: rata di tinggi {targetHeight}</div>
            <div className="text-slate-400 text-xs">Cursor: kolom {cursorX + 1}</div>
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-200 font-semibold mb-2">Tembok</div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 overflow-auto">
              <div className="relative" style={{ width: gridW, height: gridH }}>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${level.cols}, ${cell}px)`,
                    gridTemplateRows: `repeat(${level.maxHeight}, ${cell}px)`,
                  }}
                >
                  {Array.from({ length: level.maxHeight }).map((_, yTop) => {
                    const rowFromBottom = level.maxHeight - 1 - yTop;
                    return Array.from({ length: level.cols }).map((_, col) => renderCell(col, rowFromBottom));
                  })}
                </div>

                <div
                  className="absolute"
                  style={{
                    left: cursorX * cell,
                    top: 0,
                    width: cell,
                    height: gridH,
                  }}
                >
                  <div className="w-full h-full border-2 border-emerald-400/60" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 relative">
            <div className="text-slate-200 font-semibold mb-2">Status</div>
            <div className="text-sm text-slate-300">
              Goal: ratakan permukaan di tinggi <span className="font-semibold">{targetHeight}</span>.
            </div>

            {error ? (
              <div className="mt-4 bg-red-900/30 border border-red-700 text-red-200 rounded p-3 text-sm">
                {error}
              </div>
            ) : null}

            {won ? (
              <div className="mt-4 bg-green-900/20 border border-green-700 text-green-200 rounded p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <IconCheck className="text-green-300" size={18} />
                  <span>Level selesai!</span>
                </span>
              </div>
            ) : null}

            {won && targetLevelId < 15 ? (
              <button
                onClick={() => {
                  setSearchParams(prev => {
                    prev.set('lv', String(targetLevelId + 1));
                    return prev;
                  });
                }}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold"
              >
                Next Level
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
        <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addAction('Left')} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {blockLabel('Left')}
            </button>
            <button onClick={() => addAction('Right')} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {blockLabel('Right')}
            </button>
            <button onClick={() => addAction('Drop')} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {blockLabel('Drop')}
            </button>
            <button onClick={addRepeat} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {blockLabel('Repeat')}
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={reset} disabled={isRunning} className="px-4 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-50">
              Reset
            </button>
            <button onClick={run} disabled={isRunning} className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-medium disabled:opacity-50">
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-4 flex items-center gap-2">
          {program.length === 0 ? (
            <div className="text-slate-500 italic px-4">Susun blok di sini...</div>
          ) : null}

          {program.map((item, idx) => {
            if (item.kind === 'action') {
              return (
                <div
                  key={`b-${idx}`}
                  className="relative group shrink-0 w-14 h-12 flex items-center justify-center rounded border-2 text-sm bg-slate-900 cursor-pointer hover:border-red-500 transition-all border-slate-700 text-white"
                  onClick={() => removeAt(idx)}
                  title="Klik untuk hapus"
                >
                  <div className="text-lg">{blockLabel(item.action)}</div>
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] items-center justify-center text-white hidden group-hover:flex">×</div>
                </div>
              );
            }

            return (
              <div
                key={`b-${idx}`}
                className="relative group shrink-0 w-16 h-12 flex items-center justify-center rounded border-2 text-sm bg-slate-900 border-slate-700 text-white"
              >
                <button
                  onClick={() => cycleRepeatTimes(idx)}
                  disabled={isRunning}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600"
                >
                  <span className="inline-flex items-center gap-1">
                    <IconRepeat className="text-slate-100" size={18} />
                    <span>×{item.times}</span>
                  </span>
                </button>
                <button
                  onClick={() => removeAt(idx)}
                  disabled={isRunning}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] items-center justify-center text-white hidden group-hover:flex"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

