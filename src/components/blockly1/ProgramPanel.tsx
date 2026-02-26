import React from 'react';
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconPick, IconPut, IconRepeat } from '@/components/GameIcons';
import { KWCompileResult, KWStep } from '@/utils/blocklyKarelWorld';

const stepLabel = (s: KWStep) => {
  if (s.type === 'move_up') return { text: 'Move Up', icon: <IconArrowUp className="text-slate-200" size={16} /> };
  if (s.type === 'move_right') return { text: 'Move Right', icon: <IconArrowRight className="text-slate-200" size={16} /> };
  if (s.type === 'move_down') return { text: 'Move Down', icon: <IconArrowDown className="text-slate-200" size={16} /> };
  if (s.type === 'move_left') return { text: 'Move Left', icon: <IconArrowLeft className="text-slate-200" size={16} /> };
  if (s.type === 'pick') return { text: 'Pick', icon: <IconPick className="text-slate-200" size={16} /> };
  return { text: 'Put', icon: <IconPut className="text-slate-200" size={16} /> };
};

export default function ProgramPanel({
  compile,
  showRepeatHint,
}: {
  compile: KWCompileResult;
  showRepeatHint: boolean;
}) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="text-slate-200 font-semibold">Program</div>
        {compile.ok ? <div className="text-slate-400 text-xs">{compile.steps.length} steps</div> : <div className="text-red-300 text-xs">error</div>}
      </div>

      {compile.ok && compile.warnings.length ? (
        <div className="px-4 pb-2">
          {compile.warnings.map((w, idx) => (
            <div key={`w-${idx}`} className="text-amber-200 text-xs bg-amber-900/20 border border-amber-700/50 rounded px-3 py-2">
              {w}
            </div>
          ))}
        </div>
      ) : null}

      {compile.ok === false ? (
        <div className="px-4 pb-4 text-sm text-red-200">{compile.error}</div>
      ) : (
        <div className="px-4 pb-4 overflow-auto">
          {compile.steps.length === 0 ? (
            <div className="text-slate-500 italic">Belum ada blok.</div>
          ) : (
            <div className="space-y-2">
              {compile.steps.slice(0, 120).map((s, idx) => {
                const l = stepLabel(s);
                return (
                  <div key={`s-${idx}`} className="flex items-center gap-2 text-sm text-slate-200">
                    <div className="w-5 h-5 flex items-center justify-center">{l.icon}</div>
                    <div className="text-slate-400 w-8 text-xs">{idx + 1}</div>
                    <div>{l.text}</div>
                  </div>
                );
              })}
              {compile.steps.length > 120 ? <div className="text-slate-500 text-xs pt-2">Program dipotong untuk tampilan.</div> : null}
              {showRepeatHint ? (
                <div className="pt-3 text-slate-500 text-xs flex items-center gap-2">
                  <IconRepeat className="text-slate-500" size={16} />
                  <span>Gunakan repeat untuk program lebih ringkas.</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
