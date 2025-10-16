import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      userId: null,
      username: null,

      // Computed value - check if user is authenticated
      isAuthenticated: () => {
        const state = get();
        return state.token !== null && state.userId !== null;
      },

      // Actions
      login: (token, userId, username) => {
        set({
          token,
          userId,
          username,
        });
      },

      logout: () => {
        set({
          token: null,
          userId: null,
          username: null,
        });
      },

      // Helper to get auth header
      getAuthHeader: () => {
        const state = get();
        if (state.token) {
          return { Authorization: `Bearer ${state.token}` };
        }
        return {};
      },
    }),
    {
      name: 'auth-storage', // Key in localStorage
      // Only persist these fields
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        username: state.username,
      }),
    }
  )
);

export default useAuthStore;
