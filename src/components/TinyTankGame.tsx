import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TinyTankDir, TinyTankLevel, TinyTankPos, tinyTankLevels } from '@/data/tinyTankLevels';
import {
  IconArrowUp,
  IconBullet,
  IconMonster,
  IconShoot,
  IconTank,
  IconTurnLeft,
  IconTurnRight,
  IconWall,
} from '@/components/GameIcons';

type BlockType = 'Forward' | 'TurnLeft' | 'TurnRight' | 'Shoot';

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const DIRS: TinyTankDir[] = ['N', 'E', 'S', 'W'];
const VEC: Record<TinyTankDir, TinyTankPos> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

const blockLabel = (b: BlockType) => {
  if (b === 'Forward') return <IconArrowUp className="text-slate-100" size={18} />;
  if (b === 'TurnLeft') return <IconTurnLeft className="text-slate-100" size={18} />;
  if (b === 'TurnRight') return <IconTurnRight className="text-slate-100" size={18} />;
  return <IconShoot className="text-slate-100" size={18} />;
};

const keyOf = (p: TinyTankPos) => `${p.x},${p.y}`;

const inBounds = (p: TinyTankPos, lvl: TinyTankLevel) => p.x >= 0 && p.y >= 0 && p.x < lvl.cols && p.y < lvl.rows;

export default function TinyTankGame({
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
  const safeIndex = clamp(targetLevelId - 1, 0, tinyTankLevels.length - 1);
  const level = tinyTankLevels[safeIndex];

  const wallSet = useMemo(() => new Set(level.walls.map(keyOf)), [level.walls]);

  const [program, setProgram] = useState<BlockType[]>([]);
  const [tankPos, setTankPos] = useState<TinyTankPos>({ ...level.startPos });
  const [tankDir, setTankDir] = useState<TinyTankDir>(level.startDir);
  const [monsters, setMonsters] = useState<TinyTankPos[]>([...level.monsters]);
  const [bullet, setBullet] = useState<TinyTankPos | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setProgram([]);
    setTankPos({ ...level.startPos });
    setTankDir(level.startDir);
    setMonsters([...level.monsters]);
    setBullet(null);
    setIsRunning(false);
    setActiveStep(null);
    setWon(false);
    setError(null);
  }, [level]);

  const stop = () => {
    runIdRef.current++;
    setIsRunning(false);
    setActiveStep(null);
    setBullet(null);
  };

  const reset = () => {
    if (isRunning) return;
    setTankPos({ ...level.startPos });
    setTankDir(level.startDir);
    setMonsters([...level.monsters]);
    setBullet(null);
    setWon(false);
    setError(null);
    setActiveStep(null);
  };

  const addBlock = (b: BlockType) => {
    if (isRunning) return;
    setProgram(prev => [...prev, b]);
  };

  const removeAt = (idx: number) => {
    if (isRunning) return;
    setProgram(prev => prev.filter((_, i) => i !== idx));
  };

  const clearProgram = () => {
    if (isRunning) return;
    setProgram([]);
  };

  const run = async () => {
    if (isRunning) return;
    const runId = ++runIdRef.current;
    setIsRunning(true);
    setActiveStep(null);
    setWon(false);
    setError(null);
    setBullet(null);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let pos: TinyTankPos = { ...level.startPos };
    let dir: TinyTankDir = level.startDir;
    let ms: TinyTankPos[] = [...level.monsters];

    const monsterKeySet = () => new Set(ms.map(keyOf));
    const commit = () => {
      setTankPos({ ...pos });
      setTankDir(dir);
      setMonsters([...ms]);
    };

    commit();

    const stopWithError = (msg: string) => {
      setError(msg);
      setIsRunning(false);
      setActiveStep(null);
      setBullet(null);
    };

    const rotate = (delta: -1 | 1) => {
      const idx = DIRS.indexOf(dir);
      dir = DIRS[(idx + delta + 4) % 4];
    };

    for (let i = 0; i < program.length; i++) {
      if (runIdRef.current !== runId) return;

      setActiveStep(i);
      const step = program[i];

      if (step === 'Forward') {
        const next = { x: pos.x + VEC[dir].x, y: pos.y + VEC[dir].y };
        if (!inBounds(next, level)) {
          stopWithError('Tank keluar arena.');
          return;
        }
        if (wallSet.has(keyOf(next))) {
          stopWithError('Nabrak tembok.');
          return;
        }
        if (monsterKeySet().has(keyOf(next))) {
          stopWithError('Nabrak monster.');
          return;
        }
        pos = next;
        commit();
        await sleep(180);
        continue;
      }

      if (step === 'TurnLeft') {
        rotate(-1);
        commit();
        await sleep(140);
        continue;
      }

      if (step === 'TurnRight') {
        rotate(1);
        commit();
        await sleep(140);
        continue;
      }

      if (step === 'Shoot') {
        let bulletPos = { x: pos.x + VEC[dir].x, y: pos.y + VEC[dir].y };
        while (inBounds(bulletPos, level) && !wallSet.has(keyOf(bulletPos))) {
          if (runIdRef.current !== runId) return;
          setBullet({ ...bulletPos });
          await sleep(70);

          const hitKey = keyOf(bulletPos);
          const hitIdx = ms.findIndex(m => keyOf(m) === hitKey);
          if (hitIdx >= 0) {
            ms = ms.filter((_, idx) => idx !== hitIdx);
            setBullet(null);
            commit();
            await sleep(120);
            break;
          }

          bulletPos = { x: bulletPos.x + VEC[dir].x, y: bulletPos.y + VEC[dir].y };
        }
        setBullet(null);
        commit();
        await sleep(120);
        continue;
      }
    }

    setActiveStep(null);
    const solved = ms.length === 0;
    setWon(solved);
    setIsRunning(false);
    if (solved) {
      onLevelComplete(level.id);
    } else {
      setError('Masih ada monster tersisa.');
    }
  };

  const cell = 38;
  const gridW = level.cols * cell;
  const gridH = level.rows * cell;
  const monsterSet = useMemo(() => new Set(monsters.map(keyOf)), [monsters]);

  const showLevelBtn = (id: number) => {
    const locked = id > maxAllowedLevel;
    const completed = id <= initialLevel;
    const active = id === targetLevelId;
    return {
      locked,
      completed,
      active,
      cls: active
        ? 'bg-blue-600 text-white border-blue-400'
        : locked
          ? 'bg-slate-900 text-slate-600 border-slate-800'
          : completed
            ? 'bg-emerald-900/30 text-emerald-200 border-emerald-700'
            : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-blue-500',
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="h-12 border-b border-slate-800 bg-slate-900 sticky top-16 z-10">
        <div className="h-full px-3 flex items-center gap-2 overflow-x-auto">
          {Array.from({ length: 15 }).map((_, idx) => {
            const id = idx + 1;
            const s = showLevelBtn(id);
            return (
              <button
                key={`lv-${id}`}
                disabled={s.locked || isRunning}
                onClick={() => {
                  setSearchParams(prev => {
                    prev.set('lv', String(id));
                    return prev;
                  });
                }}
                className={`shrink-0 px-3 py-1 rounded-full border text-sm font-semibold transition-colors disabled:opacity-60 ${s.cls}`}
                title={s.locked ? 'Level terkunci' : s.completed ? 'Level selesai' : 'Level tersedia'}
              >
                {id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-slate-950 p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-5xl flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">Level {targetLevelId} / 15</div>
            <div className="text-slate-400 text-sm">{level.title}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-sm">Monster tersisa: {monsters.length}</div>
            <div className="text-slate-400 text-xs">Arah: {tankDir}</div>
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-200 font-semibold mb-2">Arena</div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 overflow-auto">
              <div className="relative" style={{ width: gridW, height: gridH }}>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${level.cols}, ${cell}px)`,
                    gridTemplateRows: `repeat(${level.rows}, ${cell}px)`,
                  }}
                >
                  {Array.from({ length: level.rows }).map((_, y) =>
                    Array.from({ length: level.cols }).map((__, x) => {
                      const k = `${x},${y}`;
                      const isWall = wallSet.has(k);
                      const isMonster = monsterSet.has(k);
                      const isTank = tankPos.x === x && tankPos.y === y;
                      const isBullet = bullet && bullet.x === x && bullet.y === y;

                      return (
                        <div
                          key={k}
                          className={`w-[38px] h-[38px] border border-slate-800 flex items-center justify-center ${
                            isWall ? 'bg-slate-700/80' : 'bg-slate-900'
                          }`}
                        >
                          {isWall ? <IconWall className="text-slate-300" size={18} /> : null}
                          {!isWall && isMonster ? <IconMonster className="text-purple-300" size={18} /> : null}
                          {!isWall && isBullet ? <IconBullet className="text-slate-200" size={18} /> : null}
                          {!isWall && isTank ? <IconTank className="text-emerald-300" size={18} dir={tankDir} /> : null}
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative">
            <div className="text-slate-200 font-semibold mb-2">Status</div>
            <div className="text-sm text-slate-300">Goal: habiskan semua monster.</div>

            {error ? (
              <div className="mt-4 bg-red-900/30 border border-red-700 text-red-200 rounded p-3 text-sm">{error}</div>
            ) : null}

            {won ? (
              <div className="mt-4 bg-green-900/20 border border-green-700 text-green-200 rounded p-3 text-sm">Level selesai!</div>
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
            <button
              onClick={() => addBlock('Forward')}
              disabled={isRunning}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50"
            >
              {blockLabel('Forward')}
            </button>
            <button
              onClick={() => addBlock('TurnLeft')}
              disabled={isRunning}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50"
            >
              {blockLabel('TurnLeft')}
            </button>
            <button
              onClick={() => addBlock('TurnRight')}
              disabled={isRunning}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50"
            >
              {blockLabel('TurnRight')}
            </button>
            <button
              onClick={() => addBlock('Shoot')}
              disabled={isRunning}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white disabled:opacity-50"
            >
              {blockLabel('Shoot')}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearProgram}
              disabled={isRunning}
              className="px-4 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={reset}
              disabled={isRunning}
              className="px-4 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-50"
            >
              Reset
            </button>
            {isRunning ? (
              <button onClick={stop} className="px-4 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium">
                Stop
              </button>
            ) : (
              <button onClick={run} className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-medium">
                Run
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-4 flex items-center gap-2">
          {program.length === 0 ? <div className="text-slate-500 italic px-4">Susun blok di sini...</div> : null}

          {program.map((b, idx) => (
            <div
              key={`p-${idx}`}
              className={`relative group shrink-0 w-14 h-12 flex items-center justify-center rounded border-2 text-sm bg-slate-900 cursor-pointer transition-all border-slate-700 text-white ${
                activeStep === idx ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.25)]' : 'hover:border-red-500'
              }`}
              onClick={() => removeAt(idx)}
              title="Klik untuk hapus"
            >
              <div className="text-lg">{blockLabel(b)}</div>
              <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] items-center justify-center text-white hidden group-hover:flex">
                ×
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
