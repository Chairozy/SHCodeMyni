export type TinyTankDir = 'N' | 'E' | 'S' | 'W';

export type TinyTankPos = { x: number; y: number };

export interface TinyTankLevel {
  id: number;
  title: string;
  cols: number;
  rows: number;
  startPos: TinyTankPos;
  startDir: TinyTankDir;
  walls: TinyTankPos[];
  monsters: TinyTankPos[];
}

const parseLevel = (spec: {
  id: number;
  title: string;
  startDir: TinyTankDir;
  map: string[];
}): TinyTankLevel => {
  const rows = spec.map.length;
  const cols = spec.map[0]?.length || 0;
  if (rows === 0 || cols === 0) {
    throw new Error(`Invalid map size for level ${spec.id}`);
  }
  if (!spec.map.every(r => r.length === cols)) {
    throw new Error(`Non-rectangular map for level ${spec.id}`);
  }

  let startPos: TinyTankPos | null = null;
  const walls: TinyTankPos[] = [];
  const monsters: TinyTankPos[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = spec.map[y][x];
      if (ch === '#') walls.push({ x, y });
      if (ch === 'M') monsters.push({ x, y });
      if (ch === 'T') {
        if (startPos) throw new Error(`Multiple tanks in level ${spec.id}`);
        startPos = { x, y };
      }
    }
  }
  if (!startPos) throw new Error(`Missing tank in level ${spec.id}`);
  if (monsters.length === 0) throw new Error(`Missing monsters in level ${spec.id}`);

  return {
    id: spec.id,
    title: spec.title,
    cols,
    rows,
    startPos,
    startDir: spec.startDir,
    walls,
    monsters,
  };
};

export const tinyTankLevels: TinyTankLevel[] = [
  parseLevel({
    id: 1,
    title: 'Satu tembakan',
    startDir: 'E',
    map: [
      '.........',
      '.........',
      '.........',
      '...T..M..',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 2,
    title: 'Tembok penghalang',
    startDir: 'E',
    map: [
      '.........',
      '.........',
      '...#.....',
      '...T#..M.',
      '...#.....',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 3,
    title: 'Belok lalu tembak',
    startDir: 'N',
    map: [
      '.........',
      '..M......',
      '..#......',
      '..#..T...',
      '..#......',
      '.........',
      '......#..',
      '......M..',
      '.........',
    ],
  }),
  parseLevel({
    id: 4,
    title: 'Dua monster sejajar',
    startDir: 'E',
    map: [
      '.........',
      '.........',
      '..M...M..',
      '...T.....',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 5,
    title: 'Koridor pendek',
    startDir: 'E',
    map: [
      '.........',
      '.#####...',
      '.#...#...',
      '.#T..#M..',
      '.#...#...',
      '.#####...',
      '.........',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 6,
    title: 'Zigzag',
    startDir: 'E',
    map: [
      '.........',
      '.###.....',
      '.#..M....',
      '.#..###..',
      '.#T.....M',
      '.#####...',
      '.........',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 7,
    title: 'Tiga titik',
    startDir: 'N',
    map: [
      '....M....',
      '.........',
      '..###....',
      '..#T#....',
      '..###....',
      '.........',
      '....M....',
      '.........',
      '...M.....',
    ],
  }),
  parseLevel({
    id: 8,
    title: 'Siku tembok',
    startDir: 'E',
    map: [
      '.........',
      '.....#...',
      '.....#M..',
      '...T.#...',
      '.....#...',
      '.....#...',
      '..M..#...',
      '.....#...',
      '.........',
    ],
  }),
  parseLevel({
    id: 9,
    title: 'Lorong panjang',
    startDir: 'E',
    map: [
      '.........',
      '.#######.',
      '.#.....#.',
      '.#..T..#.',
      '.#.....#.',
      '.#######.',
      '.....M...',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 10,
    title: 'Dua arena',
    startDir: 'S',
    map: [
      '...M.....',
      '..###....',
      '..#.#....',
      '..#.#....',
      '..#T#....',
      '..#.#....',
      '..#.#....',
      '..###..M.',
      '.........',
    ],
  }),
  parseLevel({
    id: 11,
    title: 'Pelindung tipis',
    startDir: 'E',
    map: [
      '.........',
      '.M.......',
      '.#.#.#...',
      '.#T#.#.M.',
      '.#.#.#...',
      '.........',
      '...M.....',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 12,
    title: 'Pagar setengah',
    startDir: 'N',
    map: [
      '.........',
      '..M......',
      '..#####..',
      '.....#...',
      '...T.#..M',
      '.....#...',
      '..#####..',
      '......M..',
      '.........',
    ],
  }),
  parseLevel({
    id: 13,
    title: 'Ruang sempit',
    startDir: 'E',
    map: [
      '.........',
      '.#####...',
      '.#...#...',
      '.#T#.#M..',
      '.#...#...',
      '.#####...',
      '....M....',
      '.........',
      '.........',
    ],
  }),
  parseLevel({
    id: 14,
    title: 'Empat penjuru',
    startDir: 'N',
    map: [
      'M.......M',
      '.#.....#.',
      '.#.....#.',
      '.#..T..#.',
      '.#.....#.',
      '.#.....#.',
      '.........',
      'M.......M',
      '.........',
    ],
  }),
  parseLevel({
    id: 15,
    title: 'Labirin mini',
    startDir: 'E',
    map: [
      '.........',
      '.#######.',
      '.#...M.#.',
      '.#.###.#.',
      '.#T#...#.',
      '.#.###.#.',
      '.#...M.#.',
      '.#######.',
      '.....M...',
    ],
  }),
];

