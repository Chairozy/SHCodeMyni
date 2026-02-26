import React from 'react';
import { IconCheck } from '@/components/GameIcons';
import KarelWorldPreview from '@/components/blockly1/KarelWorldPreview';
import ProgramPanel from '@/components/blockly1/ProgramPanel';
import { KarelWorldLevel, KWBallStack, KWPos } from '@/data/blocklyKarelWorldLevels';
import { KWCompileResult } from '@/utils/blocklyKarelWorld';

export default function SidePanel({
  level,
  robotPos,
  robotCarry,
  groundBalls,
  speed,
  setSpeed,
  isRunning,
  won,
  error,
  onReset,
  onRun,
  onContinue,
  compile,
}: {
  level: KarelWorldLevel;
  robotPos: KWPos;
  robotCarry: number;
  groundBalls: KWBallStack[];
  speed: 1 | 2;
  setSpeed: (s: 1 | 2) => void;
  isRunning: boolean;
  won: boolean;
  error: string | null;
  onReset: () => void;
  onRun: () => void;
  onContinue: () => void;
  compile: KWCompileResult;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-200 font-semibold">Tantangan</div>
          <div className="inline-flex rounded-md border border-slate-700 overflow-hidden">
            <button
              onClick={() => setSpeed(1)}
              disabled={isRunning}
              className={`px-3 py-1 text-sm ${speed === 1 ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'} disabled:opacity-60`}
            >
              Speed x1
            </button>
            <button
              onClick={() => setSpeed(2)}
              disabled={isRunning}
              className={`px-3 py-1 text-sm ${speed === 2 ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'} disabled:opacity-60`}
            >
              Speed x2
            </button>
          </div>
        </div>

        <div className="mt-3">
          <KarelWorldPreview level={level} robotPos={robotPos} groundBalls={groundBalls} />
        </div>

        <div className="mt-3 text-sm text-slate-300 space-y-1">
          <div>
            - Tujuan: sampai ke <span className="font-semibold">G</span>.
          </div>
          {level.requiredCarry > 0 ? (
            <div>
              - Bawa minimal <span className="font-semibold">{level.requiredCarry}</span> bola.
            </div>
          ) : null}
          {level.placeTargets.length ? (
            <div>
              - Isi target <span className="font-semibold">pad</span> dengan bola.
            </div>
          ) : null}
          <div>
            - Bola di tangan: <span className="font-semibold">{robotCarry}</span>
          </div>
        </div>

        {error ? <div className="mt-3 bg-red-900/30 border border-red-700 text-red-200 rounded p-3 text-sm">{error}</div> : null}
        {won ? (
          <div className="mt-3 bg-green-900/20 border border-green-700 text-green-200 rounded p-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <IconCheck className="text-green-300" size={18} />
              <span>Level selesai!</span>
            </span>
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            onClick={onReset}
            disabled={isRunning}
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-semibold disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={onRun}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          {won && level.id < 15 ? (
            <button
              onClick={onContinue}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold disabled:opacity-50"
            >
              Lanjutkan
            </button>
          ) : null}
        </div>
      </div>

      <ProgramPanel compile={compile} showRepeatHint={level.allowed.repeat} />
    </div>
  );
}
