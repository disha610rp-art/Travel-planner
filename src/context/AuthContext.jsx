import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

/**
 * AuthProvider — Manages authentication state globally
 * Hydrates from localStorage on mount, provides login/signup/logout
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const result = authService.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback((name, email, password) => {
    const result = authService.signup(name, email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  }), [user, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
