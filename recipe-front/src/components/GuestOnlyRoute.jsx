import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/AuthStore';

/**
 * Component to protect routes that should only be accessible to guests (non-authenticated users)
 * Redirects to / (home) if user is already authenticated
 */
const GuestOnlyRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default GuestOnlyRoute;
