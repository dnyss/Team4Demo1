import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import apiClient from '../api/apiClient';
import useRecipesStore from '../store/recipesStore';
import Home from '../pages/Home';

// Mock apiClient
vi.mock('../api/apiClient');

// Helper component
const HomeWithRouter = () => (
  <BrowserRouter>
    <Home />
    <ToastContainer />
  </BrowserRouter>
);

describe('Home Component', () => {
  const mockRecipes = [
    {
      id: 1,
      title: 'Chocolate Chip Cookies',
      dish_type: 'Dessert',
      ingredients: 'flour, sugar, chocolate chips',
      instructions: 'Mix and bake',
      preparation_time: '30 minutes',
      origin: 'USA',
      servings: 24,
      user_id: 1,
      creation_date: '2025-10-16T17:45:28Z'
    },
    {
      id: 2,
      title: 'Vegetable Stir Fry',
      dish_type: 'Main Course',
      ingredients: 'vegetables, soy sauce',
      instructions: 'Stir fry',
      preparation_time: '20 minutes',
      origin: 'China',
      servings: 4,
      user_id: 1,
      creation_date: '2025-10-16T17:45:28Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset recipes store before each test
    useRecipesStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Home page with search bar and title', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText(/discover amazing recipes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for recipes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('fetches and displays recipes on mount', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    // Should show loading state initially
    expect(screen.getByText(/search/i)).toBeInTheDocument();
    
    // Wait for recipes to load
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
      expect(screen.getByText('Vegetable Stir Fry')).toBeInTheDocument();
    });
  });

  it('displays loading spinner while fetching recipes', async () => {
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch recipes';
    apiClient.get.mockRejectedValue({ 
      response: { data: { error: errorMessage } } 
    });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    // Error should be stored in state
    await waitFor(() => {
      const state = useRecipesStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  it('displays empty state when no recipes exist', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText(/no recipes available yet/i)).toBeInTheDocument();
    });
  });

  it('displays recipe details correctly', async () => {
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      const recipe = mockRecipes[0];
      expect(screen.getByText(recipe.title)).toBeInTheDocument();
      expect(screen.getByText(recipe.dish_type)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(recipe.servings))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(recipe.preparation_time))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(recipe.origin))).toBeInTheDocument();
    });
  });

  it('searches recipes when user types in search bar with debounce', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    
    // Type search query
    await user.type(searchInput, 'chocolate');
    
    // Should debounce - not call immediately
    expect(apiClient.get).not.toHaveBeenCalledWith('/recipes/search?q=chocolate');
    
    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/search?q=chocolate');
    }, { timeout: 400 });
  });

  it('displays search results correctly', async () => {
    const user = userEvent.setup();
    const searchResults = [mockRecipes[0]]; // Only chocolate cookies
    
    apiClient.get
      .mockResolvedValueOnce({ data: mockRecipes }) // Initial load
      .mockResolvedValueOnce({ data: searchResults }); // Search results
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
      expect(screen.getByText('Vegetable Stir Fry')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    await user.type(searchInput, 'chocolate');
    
    await waitFor(() => {
      expect(screen.getByText(/showing results for/i)).toBeInTheDocument();
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
      expect(screen.queryByText('Vegetable Stir Fry')).not.toBeInTheDocument();
    });
  });

  it('shows clear button when search query is active', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    });
    
    // No clear button initially
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    await user.type(searchInput, 'chocolate');
    
    // Wait for search to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    }, { timeout: 400 });
  });

  it('clears search and fetches all recipes when clear button is clicked', async () => {
    const user = userEvent.setup();
    const searchResults = [mockRecipes[0]];
    
    apiClient.get
      .mockResolvedValueOnce({ data: mockRecipes }) // Initial load
      .mockResolvedValueOnce({ data: searchResults }) // Search results
      .mockResolvedValueOnce({ data: mockRecipes }); // After clear
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Vegetable Stir Fry')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    await user.type(searchInput, 'chocolate');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    }, { timeout: 400 });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);
    
    // Should fetch all recipes again
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith('/recipes');
    });
    
    // Search input should be cleared
    expect(searchInput).toHaveValue('');
  });

  it('displays empty search results message when no matches found', async () => {
    const user = userEvent.setup();
    
    apiClient.get
      .mockResolvedValueOnce({ data: mockRecipes }) // Initial load
      .mockResolvedValueOnce({ data: [] }); // Empty search results
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    await user.type(searchInput, 'pizza');
    
    await waitFor(() => {
      expect(screen.getByText(/no recipes found for "pizza"/i)).toBeInTheDocument();
    }, { timeout: 400 });
  });

  it('submits search when search button is clicked', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'chocolate');
    
    // Click search button before debounce completes
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/search?q=chocolate');
    });
  });

  it('submits search when Enter key is pressed', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    
    await user.type(searchInput, 'chocolate{Enter}');
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/search?q=chocolate');
    });
  });

  it('shows toast notification when View Recipe button is clicked', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByRole('button', { name: /view recipe/i });
    await user.click(viewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/clicked recipe with id: 1/i)).toBeInTheDocument();
    });
  });

  it('disables search input and button while loading', async () => {
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search for recipes/i);
      const searchButton = screen.getByRole('button', { name: /searching/i });
      
      expect(searchInput).toBeDisabled();
      expect(searchButton).toBeDisabled();
    });
  });

  it('clears search when empty string is typed', async () => {
    const user = userEvent.setup();
    const searchResults = [mockRecipes[0]];
    
    apiClient.get
      .mockResolvedValueOnce({ data: mockRecipes }) // Initial load
      .mockResolvedValueOnce({ data: searchResults }) // Search results
      .mockResolvedValueOnce({ data: mockRecipes }); // After clearing search
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(screen.getByText('Vegetable Stir Fry')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    
    // Type search
    await user.type(searchInput, 'chocolate');
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/search?q=chocolate');
    }, { timeout: 400 });
    
    // Clear search by deleting text
    await user.clear(searchInput);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith('/recipes');
    }, { timeout: 400 });
  });

  it('handles multiple rapid search queries correctly with debounce', async () => {
    const user = userEvent.setup();
    apiClient.get.mockResolvedValue({ data: mockRecipes });
    
    render(<HomeWithRouter />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes');
    });
    
    const searchInput = screen.getByPlaceholderText(/search for recipes/i);
    
    // Type rapidly
    await user.type(searchInput, 'c');
    await user.type(searchInput, 'h');
    await user.type(searchInput, 'o');
    
    // Should only call search once after debounce
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/recipes/search?q=cho');
    }, { timeout: 400 });
    
    // Should not have been called for intermediate values
    expect(apiClient.get).not.toHaveBeenCalledWith('/recipes/search?q=c');
    expect(apiClient.get).not.toHaveBeenCalledWith('/recipes/search?q=ch');
  });
});
