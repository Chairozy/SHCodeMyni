import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pencilLevels, PencilDir, PencilLevel } from '@/data/pencilLevels';
import LevelNavbar from '@/components/LevelNavbar';
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconCheck, IconRepeat } from '@/components/GameIcons';

type LineLen = 2 | 4;

type ProgramLine = {
  kind: 'line';
  dir: PencilDir;
  len: LineLen;
};

type ProgramRepeat = {
  kind: 'repeat';
  times: 2 | 3 | 4;
};

type ProgramItem = ProgramLine | ProgramRepeat;

type Point = { x: number; y: number };

const DIR_VECTORS: Record<PencilDir, Point> = {
  U: { x: 0, y: -1 },
  R: { x: 1, y: 0 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
};

const lineKey = (a: Point, b: Point) => {
  const aKey = `${a.x},${a.y}`;
  const bKey = `${b.x},${b.y}`;
  return aKey < bKey ? `${aKey}-${bKey}` : `${bKey}-${aKey}`;
};

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const dirLabel = (dir: PencilDir, len: LineLen) => {
  const arrow =
    dir === 'U' ? (
      <IconArrowUp className="text-slate-100" size={18} />
    ) : dir === 'R' ? (
      <IconArrowRight className="text-slate-100" size={18} />
    ) : dir === 'D' ? (
      <IconArrowDown className="text-slate-100" size={18} />
    ) : (
      <IconArrowLeft className="text-slate-100" size={18} />
    );

  return (
    <span className="inline-flex items-center gap-1">
      {arrow}
      {len === 4 ? arrow : null}
    </span>
  );
};

const computeTargetEdges = (level: PencilLevel) => {
  const edges = new Set<string>();
  let cur: Point = { x: level.start.x, y: level.start.y };

  for (const step of level.targetProgram) {
    const v = DIR_VECTORS[step.dir];
    for (let i = 0; i < step.len; i++) {
      const next = { x: cur.x + v.x, y: cur.y + v.y };
      edges.add(lineKey(cur, next));
      cur = next;
    }
  }

  return edges;
};

type RunResult = { ok: true; edges: Set<string> } | { ok: false; error: string };

const runProgram = (level: PencilLevel, program: ProgramItem[]): RunResult => {
  const edges = new Set<string>();
  let cur: Point = { x: level.start.x, y: level.start.y };
  let lastLine: ProgramLine | null = null;

  const inBounds = (p: Point) => p.x >= 0 && p.y >= 0 && p.x < level.gridPoints.cols && p.y < level.gridPoints.rows;

  const execLine = (line: ProgramLine): string | null => {
    const v = DIR_VECTORS[line.dir];
    for (let i = 0; i < line.len; i++) {
      const next = { x: cur.x + v.x, y: cur.y + v.y };
      if (!inBounds(next)) {
        return 'Keluar dari batas canvas.';
      }
      edges.add(lineKey(cur, next));
      cur = next;
    }
    return null;
  };

  for (const item of program) {
    if (item.kind === 'line') {
      const err = execLine(item);
      if (err) return { ok: false as const, error: err };
      lastLine = item;
      continue;
    }

    if (!lastLine) {
      return { ok: false as const, error: 'Repeat butuh blok garis sebelumnya.' };
    }

    for (let t = 0; t < item.times; t++) {
      const err = execLine(lastLine);
      if (err) return { ok: false as const, error: err };
    }
  }

  return { ok: true as const, edges };
};

export default function PencilGame({
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
  const safeIndex = clamp(targetLevelId - 1, 0, pencilLevels.length - 1);
  const level = pencilLevels[safeIndex];

  const targetEdges = useMemo(() => computeTargetEdges(level), [level]);

  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [resultEdges, setResultEdges] = useState<Set<string> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

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
    setResultEdges(null);
    setIsRunning(false);
    setError(null);
    setScore(null);
    setWon(false);
  }, [level.id]);

  const cell = 36;
  const w = (level.gridPoints.cols - 1) * cell;
  const h = (level.gridPoints.rows - 1) * cell;

  const addLine = (dir: PencilDir, len: LineLen) => {
    if (isRunning) return;
    setProgram(prev => [...prev, { kind: 'line', dir, len }]);
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
    setResultEdges(null);
    setError(null);
    setScore(null);
    setWon(false);
  };

  const run = () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    setWon(false);
    setScore(null);

    const r = runProgram(level, program);
    if (r.ok === false) {
      setResultEdges(null);
      setError(r.error);
      setIsRunning(false);
      return;
    }

    const myEdges = r.edges;
    setResultEdges(myEdges);

    const union = new Set<string>([...targetEdges, ...myEdges]);
    let inter = 0;
    for (const k of myEdges) {
      if (targetEdges.has(k)) inter++;
    }
    const s = union.size === 0 ? 0 : inter / union.size;
    const pct = Math.round(s * 100);
    setScore(pct);
    const passed = s >= level.passThreshold;
    setWon(passed);
    setIsRunning(false);

    if (passed) {
      onLevelComplete(level.id);
    }
  };

  const toPoint = (x: number, y: number) => ({ cx: x * cell, cy: y * cell });

  const renderEdges = (edges: Set<string>, color: string, width: number, opacity = 1) => {
    const lines: React.ReactNode[] = [];
    for (const k of edges) {
      const [a, b] = k.split('-');
      const [ax, ay] = a.split(',').map(Number);
      const [bx, by] = b.split(',').map(Number);
      const p1 = toPoint(ax, ay);
      const p2 = toPoint(bx, by);
      lines.push(
        <line
          key={k}
          x1={p1.cx}
          y1={p1.cy}
          x2={p2.cx}
          y2={p2.cy}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    }
    return lines;
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
            <div className="text-slate-300 text-sm">Target mirip ≥ {Math.round(level.passThreshold * 100)}%</div>
            <div className="text-slate-400 text-xs">Skor: {score === null ? '-' : `${score}%`}</div>
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-200 font-semibold mb-2">Target</div>
            <div className="bg-slate-900 rounded border border-slate-700 p-3 overflow-auto">
              <svg width={w + 12} height={h + 12} viewBox={`${-6} ${-6} ${w + 12} ${h + 12}`}>
                <g opacity={0.35}>
                  {Array.from({ length: level.gridPoints.cols }).map((_, x) => (
                    <line key={`vx-${x}`} x1={x * cell} y1={0} x2={x * cell} y2={h} stroke="#334155" strokeWidth={1} />
                  ))}
                  {Array.from({ length: level.gridPoints.rows }).map((_, y) => (
                    <line key={`hy-${y}`} x1={0} y1={y * cell} x2={w} y2={y * cell} stroke="#334155" strokeWidth={1} />
                  ))}
                </g>
                {renderEdges(targetEdges, '#60a5fa', 6, 0.9)}
                <circle cx={level.start.x * cell} cy={level.start.y * cell} r={7} fill="#22c55e" opacity={0.9} />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 relative">
            <div className="text-slate-200 font-semibold mb-2">Gambarmu</div>
            <div className="bg-slate-900 rounded border border-slate-700 p-3 overflow-auto relative">
              <svg ref={svgRef} width={w + 12} height={h + 12} viewBox={`${-6} ${-6} ${w + 12} ${h + 12}`}>
                <g opacity={0.35}>
                  {Array.from({ length: level.gridPoints.cols }).map((_, x) => (
                    <line key={`mvx-${x}`} x1={x * cell} y1={0} x2={x * cell} y2={h} stroke="#334155" strokeWidth={1} />
                  ))}
                  {Array.from({ length: level.gridPoints.rows }).map((_, y) => (
                    <line key={`mhy-${y}`} x1={0} y1={y * cell} x2={w} y2={y * cell} stroke="#334155" strokeWidth={1} />
                  ))}
                </g>
                {resultEdges ? renderEdges(resultEdges, '#f97316', 6, 0.95) : null}
                <circle cx={level.start.x * cell} cy={level.start.y * cell} r={7} fill="#22c55e" opacity={0.9} />
              </svg>
            </div>

            {won && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <IconCheck className="text-green-400" size={44} />
                  </div>
                  <div className="text-green-400 font-bold text-xl mt-2">Level Selesai</div>
                  {targetLevelId < 15 && (
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
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="w-full max-w-5xl bg-red-900/30 border border-red-700 text-red-200 rounded p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
        <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addLine('U', 4)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('U', 4)}
            </button>
            <button onClick={() => addLine('R', 4)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('R', 4)}
            </button>
            <button onClick={() => addLine('D', 4)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('D', 4)}
            </button>
            <button onClick={() => addLine('L', 4)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('L', 4)}
            </button>

            <button onClick={() => addLine('U', 2)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('U', 2)}
            </button>
            <button onClick={() => addLine('R', 2)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('R', 2)}
            </button>
            <button onClick={() => addLine('D', 2)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('D', 2)}
            </button>
            <button onClick={() => addLine('L', 2)} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              {dirLabel('L', 2)}
            </button>

            <button onClick={addRepeat} disabled={isRunning} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50">
              <IconRepeat className="text-slate-100" size={18} />
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
            if (item.kind === 'line') {
              return (
                <div
                  key={`p-${idx}`}
                  className="relative group shrink-0 w-16 h-12 flex items-center justify-center rounded border-2 text-sm bg-slate-900 cursor-pointer hover:border-red-500 transition-all border-slate-700 text-white"
                  onClick={() => removeAt(idx)}
                  title="Klik untuk hapus"
                >
                  <div className="font-bold">{dirLabel(item.dir, item.len)}</div>
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] items-center justify-center text-white hidden group-hover:flex">×</div>
                </div>
              );
            }

            return (
              <div
                key={`p-${idx}`}
                className="relative group shrink-0 w-16 h-12 flex items-center justify-center rounded border-2 text-sm bg-slate-900 border-slate-700 text-white"
                title="Klik untuk ubah x2/x3/x4"
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

