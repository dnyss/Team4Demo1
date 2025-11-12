import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFormValidation from '../hooks/useFormValidation';
import { registerSchema } from '../utils/validators';
import apiClient from '../api/apiClient';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validate,
    setFieldError
  } = useFormValidation(registerSchema, {
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = await validate();
    if (!isValid) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    setLoading(true);
    
    try {
      // Make API call to backend - note: backend expects 'name' not 'username'
      const response = await apiClient.post('/users', {
        name: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Success case
      if (response.status === 201) {
        toast.success('Account created successfully!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 'Registration failed';
        
        // Parse error message to set field-specific errors
        if (errorMessage.includes('email')) {
          setFieldError('email', errorMessage);
        } else if (errorMessage.includes('username') || errorMessage.includes('name')) {
          setFieldError('username', errorMessage);
        } else if (errorMessage.includes('password')) {
          setFieldError('password', errorMessage);
        } else {
          // General error
          setFieldError('general', errorMessage);
        }
        
        toast.error(errorMessage);
      } else if (error.request) {
        // Request made but no response received
        const networkError = 'Network error. Please check your connection and try again.';
        setFieldError('general', networkError);
        toast.error(networkError);
      } else {
        // Something else happened
        const unknownError = 'An unexpected error occurred. Please try again.';
        setFieldError('general', unknownError);
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
              Create Your Account
            </h2>
            
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                  disabled={loading}
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
                {errors.username && (
                  <p id="username-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.username}
                  </p>
                )}
              </div>

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
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={loading}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
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
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Repeat Password Field */}
              <div>
                <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Password
                </label>
                <input
                  type="password"
                  id="repeatPassword"
                  name="repeatPassword"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.repeatPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Repeat your password"
                  disabled={loading}
                  aria-invalid={errors.repeatPassword ? 'true' : 'false'}
                  aria-describedby={errors.repeatPassword ? 'repeatPassword-error' : undefined}
                />
                {errors.repeatPassword && (
                  <p id="repeatPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.repeatPassword}
                  </p>
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
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Log In here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You can now log in with your credentials.
              </p>
              
              {/* Modal Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Go Back
                </button>
                <Link
                  to="/login"
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 text-center"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
