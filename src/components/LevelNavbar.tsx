import React from 'react';

type LevelNavbarProps = {
  totalLevels: number;
  activeLevelId: number;
  initialCompletedLevel: number;
  isRunning?: boolean;
  stickyTopClassName?: string;
  onSelectLevel: (levelId: number) => void;
};

export default function LevelNavbar({
  totalLevels,
  activeLevelId,
  initialCompletedLevel,
  isRunning,
  stickyTopClassName,
  onSelectLevel,
}: LevelNavbarProps) {
  const maxAllowedLevel = initialCompletedLevel + 1;

  const showLevelBtn = (id: number) => {
    const locked = id > maxAllowedLevel;
    const completed = id <= initialCompletedLevel;
    const active = id === activeLevelId;

    const cls = active
      ? 'bg-blue-600 text-white border-blue-400'
      : locked
        ? 'bg-slate-950 text-slate-700 border-slate-900'
        : completed
          ? 'bg-emerald-900/30 text-emerald-200 border-emerald-700'
          : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-blue-500';

    return { locked, completed, active, cls };
  };

  return (
    <div className={`h-12 border-b border-slate-800 bg-slate-900 sticky z-10 ${stickyTopClassName ?? 'top-16'}`}>
      <div className="h-full px-3 flex items-center gap-2 overflow-x-auto">
        {Array.from({ length: totalLevels }).map((_, idx) => {
          const id = idx + 1;
          const s = showLevelBtn(id);
          return (
            <button
              key={`lv-${id}`}
              disabled={s.locked || Boolean(isRunning)}
              onClick={() => onSelectLevel(id)}
              className={`shrink-0 px-3 py-1 rounded-full border text-sm font-semibold transition-colors disabled:opacity-60 ${s.cls}`}
              title={s.locked ? 'Level terkunci' : s.completed ? 'Level selesai' : 'Level tersedia'}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

