import React, { useMemo } from 'react';
import { IconBall, IconRobot } from '@/components/GameIcons';
import { KarelWorldLevel, KWBallStack, KWPos, KWWallVariant } from '@/data/blocklyKarelWorldLevels';

const keyOf = (p: KWPos) => `${p.x},${p.y}`;

const wallBg = (variant: KWWallVariant) => {
  if (variant === 'stone') return 'bg-slate-700/80';
  if (variant === 'wood') return 'bg-amber-900/25';
  if (variant === 'ice') return 'bg-cyan-900/20';
  return 'bg-emerald-900/20';
};

function WallTile({ variant }: { variant: KWWallVariant }) {
  const stroke = variant === 'wood' ? '#f59e0b' : variant === 'ice' ? '#38bdf8' : variant === 'circuit' ? '#34d399' : '#94a3b8';
  const fill = '#0b1220';

  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="2" opacity="0.95" />
      {variant === 'stone' ? (
        <>
          <path d="M4 12h16" stroke={stroke} strokeWidth="2" opacity="0.25" />
          <path d="M10 6v6" stroke={stroke} strokeWidth="2" opacity="0.25" />
          <path d="M15 12v6" stroke={stroke} strokeWidth="2" opacity="0.25" />
        </>
      ) : null}
      {variant === 'wood' ? (
        <>
          <path d="M7 7v10" stroke={stroke} strokeWidth="2" opacity="0.35" />
          <path d="M12 7v10" stroke={stroke} strokeWidth="2" opacity="0.35" />
          <path d="M17 7v10" stroke={stroke} strokeWidth="2" opacity="0.35" />
        </>
      ) : null}
      {variant === 'ice' ? (
        <>
          <path d="M7 9l4 3-4 3" stroke={stroke} strokeWidth="2" opacity="0.35" strokeLinejoin="round" />
          <path d="M17 9l-4 3 4 3" stroke={stroke} strokeWidth="2" opacity="0.35" strokeLinejoin="round" />
        </>
      ) : null}
      {variant === 'circuit' ? (
        <>
          <path d="M7 9h6" stroke={stroke} strokeWidth="2" opacity="0.35" strokeLinecap="round" />
          <path d="M13 9v6" stroke={stroke} strokeWidth="2" opacity="0.35" strokeLinecap="round" />
          <circle cx="7" cy="15" r="1.2" fill={stroke} opacity="0.6" />
          <circle cx="17" cy="9" r="1.2" fill={stroke} opacity="0.6" />
        </>
      ) : null}
    </svg>
  );
}

function GoalRing() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="#60a5fa" strokeWidth="2" opacity="0.85" />
      <circle cx="12" cy="12" r="3" stroke="#60a5fa" strokeWidth="2" opacity="0.55" />
    </svg>
  );
}

function PadRing() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="3" stroke="#a78bfa" strokeWidth="2" opacity="0.8" />
      <path d="M9 12h6" stroke="#a78bfa" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

export default function KarelWorldPreview({
  level,
  robotPos,
  groundBalls,
}: {
  level: KarelWorldLevel;
  robotPos: KWPos;
  groundBalls: KWBallStack[];
}) {
  const cell = 34;
  const gridW = level.cols * cell;
  const gridH = level.rows * cell;

  const padTargetMap = useMemo(() => new Map(level.placeTargets.map(t => [keyOf(t.pos), t.count])), [level.placeTargets]);
  const ballMap = useMemo(() => new Map(groundBalls.map(b => [keyOf(b.pos), b.count])), [groundBalls]);

  return (
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
              const wall = level.walls.find(w => w.x === x && w.y === y);
              const isWall = Boolean(wall);
              const isRobot = robotPos.x === x && robotPos.y === y;
              const isGoal = level.goalPos.x === x && level.goalPos.y === y;
              const isPad = padTargetMap.has(k);
              const ballCount = ballMap.get(k) ?? 0;

              return (
                <div
                  key={k}
                  className={`w-[34px] h-[34px] border border-slate-800 flex items-center justify-center ${
                    isWall ? wallBg(wall!.variant) : 'bg-slate-900'
                  }`}
                >
                  {isGoal && !isWall ? <GoalRing /> : null}
                  {isPad && !isWall ? <PadRing /> : null}
                  {isWall ? <WallTile variant={wall!.variant} /> : null}
                  {!isWall && ballCount > 0 ? (
                    <div className="relative">
                      <IconBall className="text-amber-300" size={18} />
                      {ballCount > 1 ? (
                        <div className="absolute -right-2 -bottom-2 bg-slate-950 border border-slate-700 rounded-full w-4 h-4 text-[10px] text-slate-100 flex items-center justify-center">
                          {ballCount}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {!isWall && isRobot ? <IconRobot className="text-sky-300" size={20} /> : null}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

