import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useRecipesStore = create((set, get) => ({
  // State for recipe list (public recipes)
  recipes: [],
  searchQuery: '',
  loading: false,
  error: null,

  // State for recipe detail
  currentRecipe: null,
  currentRecipeLoading: false,
  currentRecipeError: null,

  // State for user's recipes (authenticated user only)
  userRecipes: [],
  userRecipesLoading: false,
  userRecipesError: null,
  userSearchQuery: '',

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

  // Actions for user's recipes (authenticated user)
  fetchUserRecipes: async () => {
    set({ userRecipesLoading: true, userRecipesError: null, userSearchQuery: '' });
    try {
      const response = await apiClient.get('/users/recipes');
      set({ userRecipes: response.data, userRecipesLoading: false });
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      set({ 
        userRecipesError: error.response?.data?.error || 'Failed to fetch your recipes', 
        userRecipesLoading: false,
        userRecipes: []
      });
    }
  },

  searchUserRecipes: async (query) => {
    if (!query || query.trim() === '') {
      set({ userSearchQuery: '' });
      await get().fetchUserRecipes();
      return;
    }

    set({ userRecipesLoading: true, userRecipesError: null, userSearchQuery: query });
    try {
      const response = await apiClient.get(`/users/recipes/search?q=${encodeURIComponent(query)}`);
      set({ userRecipes: response.data, userRecipesLoading: false });
    } catch (error) {
      console.error('Error searching user recipes:', error);
      set({ 
        userRecipesError: error.response?.data?.error || 'Failed to search your recipes', 
        userRecipesLoading: false,
        userRecipes: []
      });
    }
  },

  clearUserSearch: async () => {
    set({ userSearchQuery: '', userRecipesError: null });
    await get().fetchUserRecipes();
  },

  createRecipe: async (recipeData) => {
    set({ userRecipesLoading: true, userRecipesError: null });
    try {
      const response = await apiClient.post('/recipes', recipeData);
      // Refresh user recipes to include the new recipe
      await get().fetchUserRecipes();
      return response.data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create recipe';
      set({ 
        userRecipesError: errorMessage, 
        userRecipesLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  updateRecipe: async (id, recipeData) => {
    set({ userRecipesLoading: true, userRecipesError: null });
    try {
      const response = await apiClient.put(`/recipes/${id}`, recipeData);
      // Refresh user recipes to show updated data
      await get().fetchUserRecipes();
      return response.data;
    } catch (error) {
      console.error('Error updating recipe:', error);
      const errorMessage = error.response?.status === 403
        ? 'You do not have permission to edit this recipe'
        : error.response?.status === 404
        ? 'Recipe not found'
        : error.response?.data?.error || 'Failed to update recipe';
      set({ 
        userRecipesError: errorMessage, 
        userRecipesLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  deleteRecipe: async (id) => {
    set({ userRecipesLoading: true, userRecipesError: null });
    try {
      await apiClient.delete(`/recipes/${id}`);
      // Remove the recipe from the local state
      set(state => ({
        userRecipes: state.userRecipes.filter(recipe => recipe.id !== id),
        userRecipesLoading: false
      }));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      const errorMessage = error.response?.status === 403
        ? 'You do not have permission to delete this recipe'
        : error.response?.status === 404
        ? 'Recipe not found'
        : error.response?.data?.error || 'Failed to delete recipe';
      set({ 
        userRecipesError: errorMessage, 
        userRecipesLoading: false 
      });
      throw new Error(errorMessage);
    }
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
      currentRecipeError: null,
      userRecipes: [],
      userRecipesLoading: false,
      userRecipesError: null,
      userSearchQuery: ''
    });
  }
}));

export default useRecipesStore;
