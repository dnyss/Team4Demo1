import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/AuthStore';

/**
 * Component to protect routes that require authentication
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
