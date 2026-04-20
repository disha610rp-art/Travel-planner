import { useState, useCallback } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import '../components/auth/AuthForm.css';

/**
 * LoginPage — Split screen login page with pastel gradient background
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError('');

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 500));

    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [login, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">✈️ WanderClub</h1>
            <p className="auth-subtitle">Welcome back! Log in to plan your next adventure.</p>
          </div>

          <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
