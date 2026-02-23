export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  uid: string;
  name: string;
  role: Role;
  // Additional fields for student/teacher
  classIds?: string[];
}

export interface Class {
  uid: string; // e.g. 'kelas1'
  teacherUids: string[]; // e.g. ['teacher1', 'teacher7']
  studentUids: string[]; // e.g. ['murid20', 'murid21']
  courseUids: string[]; // e.g. ['kursus3', 'kursus99']
}

export interface Student {
  uid: string; // 'murid1'
  classIds: string[]; // ['kelas1', 'kelas2']
}

export interface Progress {
  id: string; // composite key or unique id
  studentUid: string;
  courseUid: string;
  level: number; // e.g. 0
}

export interface Course {
  uid: string;
  title: string;
  description: string;
  modules: Module[];
  moduleLength?: number; // Optional
}

export interface Module {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  content?: string; // For lesson (markdown or html string)
  questions?: QuizQuestion[]; // For quiz
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

// Airtable-like mock database structure
export interface MockDatabase {
  admins: User[];
  teachers: User[];
  students: Student[]; // In Airtable 'murid' table
  classes: Class[];
  progress: Progress[];
  courses: Course[];
}
