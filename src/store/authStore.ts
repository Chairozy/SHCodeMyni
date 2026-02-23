import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User, Student } from '../types';

interface AuthState {
  user: User | Student | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (user: User | Student, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      login: (user, role) => set({ user, role, isAuthenticated: true }),
      logout: () => set({ user: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'codemyni-auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
