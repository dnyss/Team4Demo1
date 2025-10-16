import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useRecipesStore = create((set) => ({
  // State for recipe list
  recipes: [],
  searchQuery: '',
  loading: false,
  error: null,

  // State for recipe detail
  currentRecipe: null,
  currentRecipeLoading: false,
  currentRecipeError: null,

  // Actions for recipe list
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

  // Actions for recipe detail
  fetchRecipeById: async (id) => {
    set({ currentRecipeLoading: true, currentRecipeError: null, currentRecipe: null });
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      set({ currentRecipe: response.data, currentRecipeLoading: false });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      const errorMessage = error.response?.status === 404 
        ? 'Recipe not found' 
        : error.response?.data?.error || 'Failed to fetch recipe details';
      set({ 
        currentRecipeError: errorMessage, 
        currentRecipeLoading: false,
        currentRecipe: null
      });
    }
  },

  clearCurrentRecipe: () => {
    set({ currentRecipe: null, currentRecipeError: null, currentRecipeLoading: false });
  },

  // Reset all state
  reset: () => {
    set({ 
      recipes: [], 
      searchQuery: '', 
      loading: false, 
      error: null,
      currentRecipe: null,
      currentRecipeLoading: false,
      currentRecipeError: null
    });
  }
}));

export default useRecipesStore;
