import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/AuthStore';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setLoading(true);
    
    try {
      // Make API call to login endpoint
      const response = await apiClient.post('/users/login', {
        email: formData.email,
        password: formData.password
      });
      
      // Success - extract data from response
      const { token, user_id, username } = response.data;
      
      // Update Zustand store
      login(token, user_id, username);
      
      // Show success notification
      toast.success(`Welcome back, ${username}!`);
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 'Login failed';
        
        // Set field-specific errors if possible
        if (error.response.status === 401) {
          // Invalid credentials
          setErrors({ 
            general: 'Invalid email or password. Please try again.' 
          });
          toast.error('Invalid email or password');
        } else if (errorMessage.includes('email')) {
          setErrors({ email: errorMessage });
          toast.error(errorMessage);
        } else if (errorMessage.includes('password')) {
          setErrors({ password: errorMessage });
          toast.error(errorMessage);
        } else {
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Request made but no response received
        const networkError = 'Network error. Please check your connection and try again.';
        setErrors({ general: networkError });
        toast.error(networkError);
      } else {
        // Something else happened
        const unknownError = 'An unexpected error occurred. Please try again.';
        setErrors({ general: unknownError });
        toast.error(unknownError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Welcome Back
            </h2>
            
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg text-center hover:bg-gray-600 transition duration-200"
                >
                  Go Back
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 flex items-center justify-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
