import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  admin_role: string;
}

interface AuthState {
  accessToken: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, admin: AdminUser) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (accessToken, admin) =>
        set({ accessToken, admin, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () =>
        set({ accessToken: null, admin: null, isAuthenticated: false }),
      hydrate: () => set({}),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
