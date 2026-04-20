import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Convenience hook to access AuthContext
 * @returns {{ user, loading, isAuthenticated, login, signup, logout }}
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
