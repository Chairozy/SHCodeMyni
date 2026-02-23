import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User, Student } from '../types';

interface StudentData {
  kelas_uids: string[];
  kursus_uids: string[];
  progress: Record<string, number>;
}

interface AuthState {
  user: User | Student | null;
  role: Role | null;
  isAuthenticated: boolean;
  studentData: StudentData | null; // Store student API response here
  login: (user: User | Student, role: Role, studentData?: StudentData) => void;
  logout: () => void;
  updateStudentProgress: (courseUid: string, level: number) => void; // Action to update local state
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      studentData: null,
      login: (user, role, studentData) => set({ 
        user, 
        role, 
        isAuthenticated: true, 
        studentData: studentData || null 
      }),
      logout: () => set({ user: null, role: null, isAuthenticated: false, studentData: null }),
      updateStudentProgress: (courseUid, level) => set((state) => {
        if (!state.studentData) return state;
        return {
          studentData: {
            ...state.studentData,
            progress: {
              ...state.studentData.progress,
              [courseUid]: level
            }
          }
        };
      })
    }),
    {
      name: 'codemyni-auth-storage',
    }
  )
);
