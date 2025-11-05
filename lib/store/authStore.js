import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Login
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      // Logout
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },

      // Update user profile
      updateUser: (updates) => {
        const currentUser = get().user;
        set({ user: { ...currentUser, ...updates } });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updates }));
        }
      },

      // Initialize from localStorage
      initAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          if (token && user) {
            set({
              token,
              user: JSON.parse(user),
              isAuthenticated: true
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
