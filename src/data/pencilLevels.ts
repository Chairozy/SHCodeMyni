export type PencilDir = 'U' | 'R' | 'D' | 'L';

export interface PencilProgramLine {
  kind: 'line';
  dir: PencilDir;
  len: number;
}

export interface PencilProgramRepeat {
  kind: 'repeat';
  times: number;
}

export type PencilProgramItem = PencilProgramLine | PencilProgramRepeat;

export interface PencilLevel {
  id: number;
  title: string;
  gridPoints: { cols: number; rows: number };
  start: { x: number; y: number };
  targetProgram: PencilProgramLine[];
  passThreshold: number;
}

const gp = { cols: 11, rows: 11 };

export const pencilLevels: PencilLevel[] = [
  {
    id: 1,
    title: 'Garis Panjang →',
    gridPoints: gp,
    start: { x: 2, y: 5 },
    targetProgram: [{ kind: 'line', dir: 'R', len: 4 }],
    passThreshold: 1,
  },
  {
    id: 2,
    title: 'Garis Panjang ↑',
    gridPoints: gp,
    start: { x: 5, y: 8 },
    targetProgram: [{ kind: 'line', dir: 'U', len: 4 }],
    passThreshold: 1,
  },
  {
    id: 3,
    title: 'Bentuk L',
    gridPoints: gp,
    start: { x: 2, y: 8 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'U', len: 2 },
    ],
    passThreshold: 1,
  },
  {
    id: 4,
    title: 'Kotak 4×4',
    gridPoints: gp,
    start: { x: 3, y: 7 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'U', len: 4 },
      { kind: 'line', dir: 'L', len: 4 },
      { kind: 'line', dir: 'D', len: 4 },
    ],
    passThreshold: 1,
  },
  {
    id: 5,
    title: 'Tangga',
    gridPoints: gp,
    start: { x: 2, y: 8 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
    ],
    passThreshold: 1,
  },
  {
    id: 6,
    title: 'Tanda +',
    gridPoints: gp,
    start: { x: 5, y: 5 },
    targetProgram: [
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'D', len: 4 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'L', len: 2 },
      { kind: 'line', dir: 'R', len: 4 },
    ],
    passThreshold: 0.95,
  },
  {
    id: 7,
    title: 'Huruf T',
    gridPoints: gp,
    start: { x: 5, y: 2 },
    targetProgram: [
      { kind: 'line', dir: 'D', len: 6 },
      { kind: 'line', dir: 'U', len: 6 },
      { kind: 'line', dir: 'L', len: 3 },
      { kind: 'line', dir: 'R', len: 6 },
    ],
    passThreshold: 0.95,
  },
  {
    id: 8,
    title: 'Bentuk U',
    gridPoints: gp,
    start: { x: 3, y: 2 },
    targetProgram: [
      { kind: 'line', dir: 'D', len: 6 },
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'U', len: 6 },
    ],
    passThreshold: 1,
  },
  {
    id: 9,
    title: 'Dua Garis',
    gridPoints: gp,
    start: { x: 2, y: 3 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 6 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'L', len: 6 },
    ],
    passThreshold: 0.95,
  },
  {
    id: 10,
    title: 'Bentuk Z',
    gridPoints: gp,
    start: { x: 2, y: 3 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 6 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'L', len: 6 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'R', len: 6 },
    ],
    passThreshold: 0.9,
  },
  {
    id: 11,
    title: 'Bingkai',
    gridPoints: gp,
    start: { x: 2, y: 8 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 6 },
      { kind: 'line', dir: 'U', len: 6 },
      { kind: 'line', dir: 'L', len: 6 },
      { kind: 'line', dir: 'D', len: 6 },
    ],
    passThreshold: 1,
  },
  {
    id: 12,
    title: 'Rumah',
    gridPoints: gp,
    start: { x: 3, y: 8 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'U', len: 4 },
      { kind: 'line', dir: 'L', len: 4 },
      { kind: 'line', dir: 'D', len: 4 },
      { kind: 'line', dir: 'U', len: 4 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'L', len: 4 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
    ],
    passThreshold: 0.85,
  },
  {
    id: 13,
    title: 'Jembatan',
    gridPoints: gp,
    start: { x: 2, y: 6 },
    targetProgram: [
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 6 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'L', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'D', len: 2 },
    ],
    passThreshold: 0.9,
  },
  {
    id: 14,
    title: 'Gelombang',
    gridPoints: gp,
    start: { x: 2, y: 5 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
    ],
    passThreshold: 0.9,
  },
  {
    id: 15,
    title: 'Final: Pola Kompleks',
    gridPoints: gp,
    start: { x: 3, y: 8 },
    targetProgram: [
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'L', len: 2 },
      { kind: 'line', dir: 'U', len: 2 },
      { kind: 'line', dir: 'R', len: 4 },
      { kind: 'line', dir: 'D', len: 4 },
      { kind: 'line', dir: 'L', len: 4 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'R', len: 2 },
      { kind: 'line', dir: 'D', len: 2 },
      { kind: 'line', dir: 'L', len: 4 },
    ],
    passThreshold: 0.85,
  },
];

