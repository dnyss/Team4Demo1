import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Register from '../pages/Register';

// Mock apiClient
vi.mock('../api/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper component to wrap Register with Router
const RegisterWithRouter = () => (
  <BrowserRouter>
    <Register />
    <ToastContainer />
  </BrowserRouter>
);

describe('Register Component', () => {
  let apiClient;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // Import apiClient after mocking
    const module = await import('../api/apiClient');
    apiClient = module.default;
  });

  it('renders registration form with all fields', () => {
    render(<RegisterWithRouter />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    const user = userEvent.setup();
    render(<RegisterWithRouter />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'differentpassword');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Should not call API
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('successfully registers a user and shows success modal', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    apiClient.post.mockResolvedValueOnce({
      status: 201,
      data: {
        id: 1,
        name: 'testuser',
        email: 'test@example.com',
        registration_date: '2025-10-16T10:00:00Z'
      }
    });
    
    render(<RegisterWithRouter />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/users', {
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    // Verify success modal appears
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/your account has been created successfully/i)).toBeInTheDocument();
  });

  it('displays loading state during registration', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed API response
    apiClient.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ status: 201, data: {} }), 100))
    );
    
    render(<RegisterWithRouter />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check for loading spinner
    expect(screen.getByText(/creating.../i)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/creating.../i)).not.toBeInTheDocument();
    });
  });

  it('displays validation error from backend', async () => {
    const user = userEvent.setup();
    
    // Mock API error response
    apiClient.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'Email already exists'
        }
      }
    });
    
    render(<RegisterWithRouter />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('displays field-specific error for email validation', async () => {
    const user = userEvent.setup();
    
    // Mock API error response with email-specific error
    apiClient.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'Invalid email format'
        }
      }
    });
    
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'invalidemail');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock network error (no response)
    apiClient.post.mockRejectedValueOnce({
      request: {},
      message: 'Network Error'
    });
    
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('handles unexpected errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock unexpected error
    apiClient.post.mockRejectedValueOnce({
      message: 'Something went wrong'
    });
    
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  it('clears field-specific error when user types in that field', async () => {
    const user = userEvent.setup();
    
    // First submit with mismatched passwords
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'differentpassword');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Now type in the repeat password field
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i);
    await user.clear(repeatPasswordInput);
    await user.type(repeatPasswordInput, 'password123');
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  it('disables form fields while loading', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed API response
    apiClient.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ status: 201, data: {} }), 100))
    );
    
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    // Fields should be disabled during loading
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/repeat password/i)).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).not.toBeDisabled();
    });
  });

  it('navigates back when Go Back is clicked in success modal', async () => {
    const user = userEvent.setup();
    
    apiClient.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 1, name: 'testuser', email: 'test@example.com' }
    });
    
    render(<RegisterWithRouter />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/repeat password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create user/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
    
    // Click Go Back in the modal
    const goBackButton = screen.getAllByText(/go back/i).find(el => 
      el.closest('.fixed') // Find the one inside the modal
    );
    await user.click(goBackButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
