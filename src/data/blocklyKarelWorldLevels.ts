export type KWPos = { x: number; y: number };

export type KWWallVariant = 'stone' | 'wood' | 'ice' | 'circuit';

export type KWAllowedBlocks = {
  moveUp: boolean;
  moveRight: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  pick: boolean;
  put: boolean;
  repeat: boolean;
};

export type KWBallStack = { pos: KWPos; count: number };

export type KWPlaceTarget = { pos: KWPos; count: number };

export interface KarelWorldLevel {
  id: number;
  title: string;
  cols: number;
  rows: number;
  startPos: KWPos;
  goalPos: KWPos;
  walls: Array<KWPos & { variant: KWWallVariant }>;
  balls: KWBallStack[];
  placeTargets: KWPlaceTarget[];
  requiredCarry: number;
  allowed: KWAllowedBlocks;
}

const keyOf = (p: KWPos) => `${p.x},${p.y}`;

const parseLevel = (spec: {
  id: number;
  title: string;
  allowed: KWAllowedBlocks;
  requiredCarry?: number;
  map: string[];
}): KarelWorldLevel => {
  const rows = spec.map.length;
  const cols = spec.map[0]?.length || 0;
  if (rows === 0 || cols === 0) throw new Error(`Invalid map size for level ${spec.id}`);
  if (!spec.map.every(r => r.length === cols)) throw new Error(`Non-rectangular map for level ${spec.id}`);

  let startPos: KWPos | null = null;
  let goalPos: KWPos | null = null;

  const walls: Array<KWPos & { variant: KWWallVariant }> = [];
  const balls: KWBallStack[] = [];
  const placeTargets: KWPlaceTarget[] = [];

  const addBall = (p: KWPos, count: number) => {
    const k = keyOf(p);
    const idx = balls.findIndex(b => keyOf(b.pos) === k);
    if (idx >= 0) balls[idx] = { pos: balls[idx].pos, count: balls[idx].count + count };
    else balls.push({ pos: p, count });
  };

  const addTarget = (p: KWPos, count: number) => {
    const k = keyOf(p);
    const idx = placeTargets.findIndex(t => keyOf(t.pos) === k);
    if (idx >= 0) placeTargets[idx] = { pos: placeTargets[idx].pos, count: placeTargets[idx].count + count };
    else placeTargets.push({ pos: p, count });
  };

  const wallVariant = (ch: string): KWWallVariant => {
    if (ch === '1') return 'stone';
    if (ch === '2') return 'wood';
    if (ch === '3') return 'ice';
    return 'circuit';
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = spec.map[y][x];
      const p = { x, y };

      if (ch === 'A') {
        if (startPos) throw new Error(`Multiple starts in level ${spec.id}`);
        startPos = p;
      }
      if (ch === 'G') {
        if (goalPos) throw new Error(`Multiple goals in level ${spec.id}`);
        goalPos = p;
      }
      if (ch === '1' || ch === '2' || ch === '3' || ch === '4') walls.push({ ...p, variant: wallVariant(ch) });
      if (ch === 'b') addBall(p, 1);
      if (ch === 'B') addBall(p, 2);
      if (ch === 'p') addTarget(p, 1);
      if (ch === 'P') addTarget(p, 1);
    }
  }

  if (!startPos) throw new Error(`Missing start in level ${spec.id}`);
  if (!goalPos) throw new Error(`Missing goal in level ${spec.id}`);

  return {
    id: spec.id,
    title: spec.title,
    cols,
    rows,
    startPos,
    goalPos,
    walls,
    balls,
    placeTargets,
    requiredCarry: spec.requiredCarry ?? 0,
    allowed: spec.allowed,
  };
};

const A = {
  moveUp: true,
  moveRight: true,
  moveDown: true,
  moveLeft: true,
  pick: true,
  put: true,
  repeat: true,
} satisfies KWAllowedBlocks;

export const blockly1KarelWorldLevels: KarelWorldLevel[] = [
  parseLevel({
    id: 1,
    title: 'Langkah pertama',
    allowed: { ...A, moveUp: false, moveDown: false, moveLeft: false, pick: false, put: false, repeat: false },
    map: ['A....G'],
  }),
  parseLevel({
    id: 2,
    title: 'Belok sederhana',
    allowed: { ...A, pick: false, put: false, repeat: false },
    map: [
      'A..1..',
      '...1..',
      '...1G.',
      '......',
      '......',
    ],
  }),
  parseLevel({
    id: 3,
    title: 'Ambil 1 bola',
    allowed: { ...A, put: false, repeat: false },
    requiredCarry: 1,
    map: [
      'A.....',
      '..b...',
      '...1..',
      '...1G.',
      '......',
    ],
  }),
  parseLevel({
    id: 4,
    title: 'Letakkan di target',
    allowed: { ...A, repeat: false },
    map: [
      'A.....',
      '..b...',
      '..111.',
      '..p.G.',
      '......',
    ],
  }),
  parseLevel({
    id: 5,
    title: 'Dua bola, satu tujuan',
    allowed: { ...A, put: false, repeat: false },
    requiredCarry: 2,
    map: [
      'A..b..',
      '.111..',
      '...b..',
      '..1...',
      '..1..G',
    ],
  }),
  parseLevel({
    id: 6,
    title: 'Dua target',
    allowed: { ...A, repeat: false },
    map: [
      'A.....G',
      '.1111..',
      '.b..2..',
      '.b..2..',
      '..p.P..',
    ],
  }),
  parseLevel({
    id: 7,
    title: 'Lorong kayu',
    allowed: { ...A, repeat: true },
    map: [
      'A.22222G',
      '..2....2',
      'b.2.11.2',
      '..2....2',
      '..222222',
      '..p.....',
    ],
  }),
  parseLevel({
    id: 8,
    title: 'Ambil dan kembali',
    allowed: { ...A, repeat: true },
    requiredCarry: 2,
    map: [
      'A..111..',
      '...1b1..',
      '...1b1G.',
      '...111..',
      '........',
    ],
  }),
  parseLevel({
    id: 9,
    title: 'Tiga arah',
    allowed: { ...A, repeat: true },
    map: [
      'A....3..',
      '.333.3..',
      '.b..p3..',
      '.3..333.',
      '.3....G.',
      '.333333.',
    ],
  }),
  parseLevel({
    id: 10,
    title: 'Sirkuit kecil',
    allowed: { ...A, repeat: true },
    map: [
      'A..444..G',
      '..4...4..',
      'b.4.p.4.b',
      '..4...4..',
      '..44444..',
    ],
  }),
  parseLevel({
    id: 11,
    title: 'Tiga target, satu stok',
    allowed: { ...A, repeat: true },
    map: [
      'A..B....G',
      '.111.111.',
      '.p...p..P',
      '.111.111.',
      '....b....',
    ],
  }),
  parseLevel({
    id: 12,
    title: 'Labirin es',
    allowed: { ...A, repeat: true },
    map: [
      'A.333333.',
      '..3...3..',
      'b.3.3.3G.',
      '..3.p.3..',
      '..3...3..',
      '..33333..',
    ],
  }),
  parseLevel({
    id: 13,
    title: 'Koridor campuran',
    allowed: { ...A, repeat: true },
    map: [
      'A..1..2..G',
      '.11.22.33.',
      '.b..p..b..',
      '.33.22.11.',
      '.P..2..1..',
    ],
  }),
  parseLevel({
    id: 14,
    title: 'Distribusi tiga bola',
    allowed: { ...A, repeat: true },
    map: [
      'A...B..111G',
      '.111b..1..1',
      '.p..4..1p.1',
      '.1..4..1..1',
      '.1..4441..1',
      '.1......P.1',
      '.111111111.',
    ],
  }),
  parseLevel({
    id: 15,
    title: 'Final: rute ganda',
    allowed: { ...A, repeat: true },
    requiredCarry: 1,
    map: [
      'A..2222..G',
      '.2..b.2.1.',
      '.2.11.2.1.',
      'b2.p..2.P.',
      '.2.11.2.1.',
      '.2....2.1b',
      '..2222..1.',
    ],
  }),
];
