import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/AuthStore';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-orange-500">
          <Icon icon="material-symbols-light:chef-hat-rounded" width="24" height="24" className="text-orange-500" />
          <span>TasteCraft</span>
        </Link>
        
        {isAuthenticated ? (
          /* Authenticated User UI */
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:opacity-80 transition duration-200"
              aria-label="User menu"
            >
              {/* User Avatar Circle */}
              <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                {getInitials(username)}
              </div>
              <Icon 
                icon={showUserMenu ? "mdi:chevron-up" : "mdi:chevron-down"} 
                className="text-gray-600"
                width="20"
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">{username}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
                
                <Link
                  to="/user-recipes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                >
                  <Icon icon="mdi:book-open-variant" className="mr-2" width="18" />
                  My Recipes
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                >
                  <Icon icon="mdi:logout" className="mr-2" width="18" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest User UI */
          <div className="flex space-x-4">
            <Link
              to="/register"
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-200"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50 transition duration-200"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

