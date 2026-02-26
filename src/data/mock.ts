import { MockDatabase, Role, User } from '../types';

const admins: User[] = [
  { uid: 'adminlord', name: 'admin', role: 'admin' }
];

const teachers: User[] = Array.from({ length: 10 }, (_, i) => ({
  uid: `teacher${i + 1}`,
  name: `Teacher ${i + 1}`,
  role: 'teacher' as Role
}));

const students = [
  { uid: 'murid1', classIds: ['kelas1', 'kelas2'] },
  { uid: 'murid20', classIds: ['kelas1'] },
  { uid: 'murid21', classIds: ['kelas1'] },
  { uid: 'murid34', classIds: ['kelas1'] },
];

const classes = [
  {
    uid: 'kelas1',
    teacherUids: ['teacher1', 'teacher7'],
    studentUids: ['murid20', 'murid21', 'murid34'],
    courseUids: ['kursus3', 'kursus99', 'blockly1']
  },
  {
    uid: 'kelas2',
    teacherUids: ['teacher2'],
    studentUids: ['murid1'],
    courseUids: ['kursus3', 'blockly1']
  }
];

const progress = [
  { id: 'murid1,kursus3', studentUid: 'murid1', courseUid: 'kursus3', level: 0 }
];

const courses = [
  {
    uid: 'kursus_quiz',
    title: 'Sequence Logic Quiz',
    description: 'Test your knowledge on sequence logic with this 5-question quiz. You must answer correctly to proceed.',
    modules: [
      {
        id: 'mod1',
        type: 'quiz' as const,
        title: 'Level 1: Basic Sequence',
        questions: [
          {
            id: 'q1',
            question: 'What comes next: 2, 4, 6, 8, ...?',
            options: [
              { id: 'a', text: '9', isCorrect: false },
              { id: 'b', text: '10', isCorrect: true },
              { id: 'c', text: '12', isCorrect: false }
            ],
            explanation: 'Even numbers sequence: adding 2 each time.'
          }
        ]
      },
      {
        id: 'mod2',
        type: 'quiz' as const,
        title: 'Level 2: Fibonacci',
        questions: [
          {
            id: 'q2',
            question: 'What comes next: 1, 1, 2, 3, 5, ...?',
            options: [
              { id: 'a', text: '8', isCorrect: true },
              { id: 'b', text: '7', isCorrect: false },
              { id: 'c', text: '10', isCorrect: false }
            ],
            explanation: 'Fibonacci sequence: each number is the sum of the two preceding ones (3+5=8).'
          }
        ]
      },
      {
        id: 'mod3',
        type: 'quiz' as const,
        title: 'Level 3: Letter Pattern',
        questions: [
          {
            id: 'q3',
            question: 'What comes next: A, C, E, G, ...?',
            options: [
              { id: 'a', text: 'H', isCorrect: false },
              { id: 'b', text: 'I', isCorrect: true },
              { id: 'c', text: 'J', isCorrect: false }
            ],
            explanation: 'Skip one letter: B, D, F, H are skipped. Next is I.'
          }
        ]
      },
      {
        id: 'mod4',
        type: 'quiz' as const,
        title: 'Level 4: Decreasing Sequence',
        questions: [
          {
            id: 'q4',
            question: 'What comes next: 10, 9, 7, 4, ...?',
            options: [
              { id: 'a', text: '1', isCorrect: false },
              { id: 'b', text: '0', isCorrect: true },
              { id: 'c', text: '2', isCorrect: false }
            ],
            explanation: 'Difference increases by 1: -1, -2, -3. Next is -4 (4 - 4 = 0).'
          }
        ]
      },
      {
        id: 'mod5',
        type: 'quiz' as const,
        title: 'Level 5: Squares',
        questions: [
          {
            id: 'q5',
            question: 'What comes next: 1, 4, 9, 16, ...?',
            options: [
              { id: 'a', text: '20', isCorrect: false },
              { id: 'b', text: '24', isCorrect: false },
              { id: 'c', text: '25', isCorrect: true }
            ],
            explanation: 'Squares of integers: 1^2, 2^2, 3^2, 4^2. Next is 5^2 = 25.'
          }
        ]
      }
    ],
    moduleLength: 5
  },
  {
    uid: 'kursus3',
    title: 'Bricks',
    description: 'Susun bata untuk meratakan permukaan tembok (15 level).',
    modules: [],
    moduleLength: 15
  },
  {
    uid: 'kursus99',
    title: 'Advanced Mathematics',
    description: 'Advanced topics for seniors.',
    modules: []
  },
  {
    uid: 'kursus1',
    title: 'Karel Logic',
    description: 'Learn programming logic by guiding Karel the Robot through 15 levels.',
    modules: [], // Modules are handled by the game engine
    moduleLength: 15
  },
  {
    uid: 'kursus2',
    title: 'Pencil',
    description: 'Latihan pola garis lurus dengan blok dan repeat (15 level).',
    modules: [],
    moduleLength: 15
  },
  {
    uid: 'kursus4',
    title: 'TinyTank',
    description: 'Gerakkan tank dan tembak monster di arena grid (15 level).',
    modules: [],
    moduleLength: 15
  },
  {
    uid: 'blockly1',
    title: 'Karel World',
    description: 'Karel World dengan Blockly: bergerak 4 arah, pick/put bola (15 level).',
    modules: [],
    moduleLength: 15
  }
];

export const mockDatabase: MockDatabase = {
  admins,
  teachers,
  students,
  classes,
  progress,
  courses
};
