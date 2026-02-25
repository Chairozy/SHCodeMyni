import React from 'react';

type IconProps = {
  className?: string;
  size?: number;
};

const s = (size?: number) => ({ width: size ?? 20, height: size ?? 20 });

export function IconArrowUp({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 4l6 6h-4v10H10V10H6l6-6z" fill="currentColor" />
    </svg>
  );
}

export function IconArrowRight({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M20 12l-6 6v-4H4V10h10V6l6 6z" fill="currentColor" />
    </svg>
  );
}

export function IconArrowDown({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 20l-6-6h4V4h4v10h4l-6 6z" fill="currentColor" />
    </svg>
  );
}

export function IconArrowLeft({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 12l6-6v4h10v4H10v4l-6-6z" fill="currentColor" />
    </svg>
  );
}

export function IconTurnLeft({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9 7H4l5-5v5zm0 0h7a5 5 0 015 5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTurnRight({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M15 7h5l-5-5v5zm0 0H8a5 5 0 00-5 5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRepeat({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 7h11l-2-2m2 2l-2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 17H6l2 2m-2-2l2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBall({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="currentColor" />
      <path d="M7 12a5 5 0 0010 0" stroke="#0b1220" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4a8 8 0 010 16" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
    </svg>
  );
}

export function IconPick({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="14" r="5" fill="currentColor" opacity="0.95" />
      <path d="M16 6v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 6l-2 2m2-2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPut({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.95" />
      <path d="M16 18v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRobot({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="6" y="7" width="12" height="12" rx="3" fill="currentColor" />
      <rect x="10.5" y="4" width="3" height="3" rx="1" fill="currentColor" opacity="0.9" />
      <circle cx="10" cy="13" r="1.2" fill="#0b1220" />
      <circle cx="14" cy="13" r="1.2" fill="#0b1220" />
      <path d="M10 16h4" stroke="#0b1220" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBrick({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="10" rx="2" fill="currentColor" />
      <path d="M4 12h16" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
      <path d="M10 7v5" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
      <path d="M14 12v5" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
    </svg>
  );
}

export function IconTank({ className, size, dir }: IconProps & { dir: 'N' | 'E' | 'S' | 'W' }) {
  const rot = dir === 'N' ? 0 : dir === 'E' ? 90 : dir === 'S' ? 180 : 270;
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true" style={{ transform: `rotate(${rot}deg)` }}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="10" y="4" width="4" height="6" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="6" y="17" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function IconWall({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" />
      <path d="M4 12h16" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
      <path d="M9 6v6" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
      <path d="M15 12v6" stroke="#0b1220" strokeWidth="2" opacity="0.25" />
    </svg>
  );
}

export function IconMonster({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 10a5 5 0 0110 0v7a2 2 0 01-2 2H9a2 2 0 01-2-2v-7z" fill="currentColor" />
      <circle cx="10" cy="13" r="1.2" fill="#0b1220" />
      <circle cx="14" cy="13" r="1.2" fill="#0b1220" />
      <path d="M9 9l-2-2M15 9l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBullet({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 12h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 12l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShoot({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 13h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M13 8h4l3 4-3 4h-4z" fill="currentColor" opacity="0.9" />
      <path d="M8 9l2 3-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className, size }: IconProps) {
  return (
    <svg {...s(size)} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M20 7l-11 11-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

