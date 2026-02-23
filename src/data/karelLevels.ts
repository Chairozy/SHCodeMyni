export type Direction = 'N' | 'E' | 'S' | 'W';

export interface GridPos {
  x: number;
  y: number;
}

export interface LevelConfig {
  id: number;
  gridSize: { rows: number; cols: number };
  startPos: GridPos;
  startDir: Direction;
  walls: GridPos[]; // Full block walls
  thinWalls: { pos: GridPos; side: 'N' | 'E' | 'S' | 'W' }[]; // Line walls
  balls: GridPos[]; // Balls to pick up
  goal: {
    pos: GridPos; // Must end here
    requiredBalls: number; // Must have this many balls in inventory (picked up)
    // Or maybe goal is to PUT balls? "ambil bola, taruh bola".
    // Let's assume standard karel: Task can be "pick all balls" or "move to X".
    // User said: "Tantanganya adalah robot karel...".
    // Let's define simple objectives: End at X,Y with N balls collected.
  };
  description: string;
}

// Helper to create simple levels
const createLevel = (id: number, desc: string, cols: number, rows: number, start: GridPos, goal: GridPos, walls: GridPos[] = [], balls: GridPos[] = []): LevelConfig => ({
  id,
  description: desc,
  gridSize: { rows, cols },
  startPos: start,
  startDir: 'E',
  walls,
  thinWalls: [],
  balls,
  goal: { pos: goal, requiredBalls: balls.length }
});

export const karelLevels: LevelConfig[] = [
  // Level 1: Just move
  createLevel(1, "Move to the goal", 5, 1, { x: 0, y: 0 }, { x: 4, y: 0 }),
  
  // Level 2: Jump over a block
  createLevel(2, "Jump over the wall", 5, 3, { x: 0, y: 0 }, { x: 4, y: 0 }, [{ x: 2, y: 0 }]),
  
  // Level 3: Pick up a ball
  createLevel(3, "Pick up the ball and finish", 5, 1, { x: 0, y: 0 }, { x: 4, y: 0 }, [], [{ x: 2, y: 0 }]),
  
  // Level 4: Zig Zag
  createLevel(4, "Zig Zag through walls", 5, 3, { x: 0, y: 0 }, { x: 4, y: 2 }, [{ x: 1, y: 0 }, { x: 3, y: 2 }]),
  
  // Level 5: Square path
  createLevel(5, "Walk in a square", 4, 4, { x: 0, y: 0 }, { x: 0, y: 1 }, [{ x: 1, y: 1 }, { x: 2, y: 2 }], [{ x: 3, y: 0 }]),
  
  // Level 6: Tunnel
  createLevel(6, "Navigate the tunnel", 6, 3, { x: 0, y: 1 }, { x: 5, y: 1 }, 
    [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},
     {x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2}]
  ),

  // Level 7: Staircase
  createLevel(7, "Climb the stairs", 5, 5, { x: 0, y: 0 }, { x: 4, y: 4 }, 
    [{x:1,y:0}, {x:2,y:0}, {x:2,y:1}, {x:3,y:0}, {x:3,y:1}, {x:3,y:2}, {x:4,y:0}, {x:4,y:1}, {x:4,y:2}, {x:4,y:3}]
  ),

  // Level 8: Maze 1
  createLevel(8, "Simple Maze", 5, 5, { x: 0, y: 0 }, { x: 4, y: 4 }, 
    [{x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}, {x:3,y:1}, {x:3,y:2}, {x:3,y:3}, {x:3,y:4}]
  ),

  // Level 9: Collect 3 balls
  createLevel(9, "Collect all balls", 5, 1, { x: 0, y: 0 }, { x: 4, y: 0 }, [], [{x:1,y:0}, {x:2,y:0}, {x:3,y:0}]),

  // Level 10: Spiral
  createLevel(10, "Inward Spiral", 5, 5, { x: 0, y: 0 }, { x: 2, y: 2 }, 
    [{x:1,y:1}, {x:2,y:1}, {x:3,y:1}, {x:3,y:2}, {x:3,y:3}, {x:2,y:3}, {x:1,y:3}, {x:1,y:2}]
  ),

  // Level 11: Hurdles
  createLevel(11, "Jump hurdles", 9, 2, { x: 0, y: 0 }, { x: 8, y: 0 }, 
    [{x:2,y:0}, {x:4,y:0}, {x:6,y:0}]
  ),

  // Level 12: The Box
  createLevel(12, "Get inside the box", 5, 5, { x: 0, y: 0 }, { x: 2, y: 2 }, 
    [{x:1,y:1}, {x:2,y:1}, {x:3,y:1}, {x:3,y:2}, {x:3,y:3}, {x:2,y:3}, {x:1,y:3}, {x:1,y:2}], 
    // Wait, Level 10 was spiral, let's make this one define a box with one entrance
    [{x:2,y:2}] // Ball inside
  ),

  // Level 13: Slalom
  createLevel(13, "Ski Slalom", 5, 6, { x: 2, y: 0 }, { x: 2, y: 5 }, 
    [{x:1,y:1}, {x:3,y:2}, {x:1,y:3}, {x:3,y:4}]
  ),

  // Level 14: Long Road
  createLevel(14, "Long winding road", 4, 6, { x: 0, y: 0 }, { x: 3, y: 0 },
    [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3},{x:1,y:4},
     {x:2,y:5},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:2,y:1}]
  ),

  // Level 15: Final Challenge
  createLevel(15, "The Final Exam", 7, 7, { x: 0, y: 0 }, { x: 6, y: 6 },
    // A complex pattern of walls
    [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:5,y:0},{x:5,y:1},{x:5,y:2},
     {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:4,y:4},{x:5,y:4},{x:6,y:4}],
    [{x:0,y:2}, {x:2,y:2}, {x:4,y:2}, {x:6,y:2}]
  )
];
