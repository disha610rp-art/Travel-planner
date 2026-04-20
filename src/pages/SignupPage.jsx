import { useState, useCallback } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import '../components/auth/AuthForm.css';

/**
 * SignupPage — Account creation page with validation
 */
const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 500));

    const result = signup(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [signup, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">✈️ Wanderlust</h1>
            <p className="auth-subtitle">Create your account and start planning!</p>
          </div>

          <SignupForm onSubmit={handleSubmit} loading={loading} error={error} />

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
