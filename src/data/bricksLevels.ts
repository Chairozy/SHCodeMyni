export interface BricksLevel {
  id: number;
  title: string;
  cols: number;
  maxHeight: number;
  startX: number;
  initialHeights: number[];
}

const L = (
  id: number,
  title: string,
  cols: number,
  maxHeight: number,
  startX: number,
  initialHeights: number[]
): BricksLevel => ({
  id,
  title,
  cols,
  maxHeight,
  startX,
  initialHeights,
});

export const bricksLevels: BricksLevel[] = [
  L(1, 'Ratakan 1 Lubang', 7, 8, 3, [5, 5, 5, 4, 5, 5, 5]),
  L(2, 'Ratakan 2 Lubang', 7, 8, 3, [5, 4, 5, 4, 5, 5, 5]),
  L(3, 'Ratakan Tangga', 7, 8, 0, [2, 3, 4, 5, 5, 5, 5]),
  L(4, 'Ratakan Lembah', 7, 8, 3, [6, 6, 5, 4, 5, 6, 6]),
  L(5, 'Ratakan Punggung', 7, 8, 3, [5, 6, 6, 6, 6, 6, 5]),
  L(6, 'Ratakan 3 Kolom', 7, 9, 1, [6, 5, 5, 6, 6, 6, 6]),
  L(7, 'Ratakan 3 Lubang', 7, 9, 2, [7, 6, 7, 6, 7, 6, 7]),
  L(8, 'Ratakan Pola W', 7, 9, 3, [7, 6, 7, 6, 7, 6, 7]),
  L(9, 'Ratakan Lembah Lebar', 9, 10, 4, [8, 8, 7, 6, 6, 6, 7, 8, 8]),
  L(10, 'Ratakan 4 Lubang', 9, 10, 4, [8, 7, 8, 7, 8, 7, 8, 8, 8]),
  L(11, 'Ratakan Gelombang', 9, 10, 0, [6, 7, 8, 7, 6, 7, 8, 7, 6]),
  L(12, 'Ratakan Dua Zona', 9, 10, 4, [9, 9, 8, 8, 7, 8, 8, 9, 9]),
  L(13, 'Ratakan Puncak', 9, 11, 4, [10, 10, 10, 9, 8, 9, 10, 10, 10]),
  L(14, 'Ratakan Miring', 9, 11, 8, [6, 7, 8, 9, 10, 10, 10, 10, 10]),
  L(15, 'Final: Banyak Lubang', 11, 12, 5, [11, 11, 10, 9, 11, 8, 11, 9, 10, 11, 11]),
];

