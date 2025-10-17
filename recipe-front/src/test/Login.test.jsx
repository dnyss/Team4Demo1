import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/AuthStore';
import Login from '../pages/Login';

// Mock apiClient
vi.mock('../api/apiClient');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper component
const LoginWithRouter = () => (
  <BrowserRouter>
    <Login />
    <ToastContainer />
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear auth store before each test
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    render(<LoginWithRouter />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    const user = userEvent.setup();
    render(<LoginWithRouter />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('successfully logs in and updates Zustand store', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    apiClient.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user_id: 1,
        username: 'testuser'
      }
    });
    
    render(<LoginWithRouter />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify API was called
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/users/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    // Verify Zustand store was updated
    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.token).toBe('fake-jwt-token');
      expect(state.userId).toBe(1);
      expect(state.username).toBe('testuser');
      expect(state.isAuthenticated()).toBe(true);
    });
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays loading state during login', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed API response
    apiClient.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { token: 'token', user_id: 1, username: 'user' }
      }), 100))
    );
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check for loading spinner
    expect(screen.getByText(/logging in.../i)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/logging in.../i)).not.toBeInTheDocument();
    });
  });

  it('displays error for invalid credentials (401)', async () => {
    const user = userEvent.setup();
    
    // Mock 401 error response
    apiClient.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          error: 'Invalid email or password'
        }
      }
    });
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
    
    // Verify store was NOT updated
    const state = useAuthStore.getState();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('handles network error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock network error (no response)
    apiClient.post.mockRejectedValueOnce({
      request: {},
      message: 'Network Error'
    });
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('disables form fields while loading', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed API response
    apiClient.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { token: 'token', user_id: 1, username: 'user' }
      }), 100))
    );
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    // Fields should be disabled during loading
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
    });
  });
});

describe('Zustand Auth Store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('initializes with empty state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.username).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('updates state on login', () => {
    const { login } = useAuthStore.getState();
    
    login('test-token', 123, 'testuser');
    
    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token');
    expect(state.userId).toBe(123);
    expect(state.username).toBe('testuser');
    expect(state.isAuthenticated()).toBe(true);
  });

  it('clears state on logout', () => {
    const { login, logout } = useAuthStore.getState();
    
    // Login first
    login('test-token', 123, 'testuser');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    
    // Then logout
    logout();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.username).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('generates correct auth header', () => {
    const { login, getAuthHeader } = useAuthStore.getState();
    
    // Without token
    expect(getAuthHeader()).toEqual({});
    
    // With token
    login('test-token', 123, 'testuser');
    expect(getAuthHeader()).toEqual({
      Authorization: 'Bearer test-token'
    });
  });

  it('persists state to localStorage', () => {
    const { login } = useAuthStore.getState();
    
    login('persistent-token', 456, 'persistentuser');
    
    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('auth-storage'));
    expect(stored.state.token).toBe('persistent-token');
    expect(stored.state.userId).toBe(456);
    expect(stored.state.username).toBe('persistentuser');
  });
});
