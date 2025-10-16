import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
    
    // In the future, this will make an API call
    console.log('User login attempt:', formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Welcome Back
            </h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
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
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200"
                >
                  Log In
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