import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import apiClient from '../api/apiClient';
import useRecipesStore from '../store/recipesStore';
import Recipe from '../pages/Recipe';

// Mock apiClient
vi.mock('../api/apiClient');

// Helper component with router
const RecipeWithRouter = ({ initialRoute = '/recipe/1' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <Routes>
      <Route path="/recipe/:id" element={<Recipe />} />
    </Routes>
    <ToastContainer />
  </MemoryRouter>
);

describe('Recipe Component', () => {
  const mockRecipe = {
    id: 1,
    title: 'Chocolate Chip Cookies',
    dish_type: 'Dessert',
    ingredients: 'flour, sugar, chocolate chips, butter, eggs',
    instructions: 'Mix ingredients. Bake at 350°F for 12 minutes. Cool and serve.',
    preparation_time: '30 minutes',
    origin: 'USA',
    servings: 24,
    user_id: 1,
    creation_date: '2025-10-16T17:45:28Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset recipes store before each test
    useRecipesStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('extracts recipe ID from URL parameters', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter initialRoute="/recipe/123" />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/123');
    });
  });

  it('fetches recipe data on component mount', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/1');
    });
  });

  it('displays loading state while fetching recipe', async () => {
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/loading recipe details/i)).toBeInTheDocument();
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('displays recipe details after successful fetch', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Dessert')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument();
  });

  it('parses and displays ingredients correctly', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/flour/i)).toBeInTheDocument();
      expect(screen.getByText(/sugar/i)).toBeInTheDocument();
      expect(screen.getByText(/chocolate chips/i)).toBeInTheDocument();
    });
  });

  it('parses and displays instructions correctly', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/mix ingredients/i)).toBeInTheDocument();
      expect(screen.getByText(/bake at 350/i)).toBeInTheDocument();
    });
  });

  it('displays error message for non-existent recipe (404)', async () => {
    apiClient.get.mockRejectedValue({ 
      response: { 
        status: 404,
        data: { error: 'Recipe not found' } 
      } 
    });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/recipe not found/i)).toBeInTheDocument();
    });
    
    // Should show return to home button
    const returnButton = screen.getByRole('link', { name: /return to home/i });
    expect(returnButton).toBeInTheDocument();
    expect(returnButton).toHaveAttribute('href', '/');
  });

  it('displays error message for network errors', async () => {
    apiClient.get.mockRejectedValue({ 
      response: { 
        status: 500,
        data: { error: 'Server error' } 
      } 
    });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it('displays "Back to Recipes" link', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    const backLink = screen.getByRole('link', { name: /back to recipes/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('clears current recipe on unmount', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    const { unmount } = render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(useRecipesStore.getState().currentRecipe).toBeTruthy();
    });
    
    unmount();
    
    // After unmount, current recipe should be cleared
    await waitFor(() => {
      expect(useRecipesStore.getState().currentRecipe).toBeNull();
    });
  });

  it('handles different recipe IDs correctly', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { ...mockRecipe, id: 1, title: 'Recipe 1' } })
      .mockResolvedValueOnce({ data: { ...mockRecipe, id: 2, title: 'Recipe 2' } });
    
    const { rerender } = render(<RecipeWithRouter initialRoute="/recipe/1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });
    
    rerender(<RecipeWithRouter initialRoute="/recipe/2" />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/2');
    });
  });

  it('displays servings when available', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/servings/i)).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
    });
  });

  it('displays origin when available', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/origin/i)).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });
  });

  it('handles recipe with minimal data gracefully', async () => {
    const minimalRecipe = {
      id: 1,
      title: 'Simple Recipe',
      ingredients: 'water',
      instructions: 'Boil water',
      user_id: 1
    };
    
    apiClient.get.mockResolvedValue({ data: minimalRecipe });
    
    render(<RecipeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Simple Recipe')).toBeInTheDocument();
    });
    
    // Should not crash when optional fields are missing
    expect(screen.queryByText(/dessert/i)).not.toBeInTheDocument();
  });

  it('does not fetch recipe if ID is not provided', async () => {
    render(
      <MemoryRouter initialEntries={['/recipe']}>
        <Routes>
          <Route path="/recipe" element={<Recipe />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should not call API without an ID
    await waitFor(() => {
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  it('refetches recipe when ID parameter changes', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { ...mockRecipe, id: 1 } })
      .mockResolvedValueOnce({ data: { ...mockRecipe, id: 5 } });
    
    const { rerender } = render(<RecipeWithRouter initialRoute="/recipe/1" />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/1');
    });
    
    // Change to different recipe
    rerender(<RecipeWithRouter initialRoute="/recipe/5" />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/5');
    });
    
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});
