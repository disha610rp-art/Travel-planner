import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from '../common/Loader';

/**
 * ProtectedRoute — Wraps routes that require authentication
 * Redirects to login if not authenticated, shows loader while checking
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullPage text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
