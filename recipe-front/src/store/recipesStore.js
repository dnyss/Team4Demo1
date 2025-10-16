import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useRecipesStore = create((set) => ({
  // State
  recipes: [],
  searchQuery: '',
  loading: false,
  error: null,

  // Actions
  fetchAllRecipes: async () => {
    set({ loading: true, error: null, searchQuery: '' });
    try {
      const response = await apiClient.get('/recipes');
      set({ recipes: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to fetch recipes', 
        loading: false,
        recipes: []
      });
    }
  },

  searchRecipes: async (query) => {
    if (!query || query.trim() === '') {
      // If empty query, fetch all recipes
      set({ searchQuery: '' });
      await useRecipesStore.getState().fetchAllRecipes();
      return;
    }

    set({ loading: true, error: null, searchQuery: query });
    try {
      const response = await apiClient.get(`/recipes/search?q=${encodeURIComponent(query)}`);
      set({ recipes: response.data, loading: false });
    } catch (error) {
      console.error('Error searching recipes:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to search recipes', 
        loading: false,
        recipes: []
      });
    }
  },

  clearSearch: async () => {
    set({ searchQuery: '', error: null });
    await useRecipesStore.getState().fetchAllRecipes();
  },

  // Reset state (useful for cleanup)
  reset: () => {
    set({ recipes: [], searchQuery: '', loading: false, error: null });
  }
}));

export default useRecipesStore;
