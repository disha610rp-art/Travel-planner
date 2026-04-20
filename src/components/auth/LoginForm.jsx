import { useState, useCallback } from 'react';
import { Mail, Lock } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * LoginForm — Email + password form with validation
 * @param {object} props
 * @param {Function} props.onSubmit - Called with { email, password }
 * @param {boolean} props.loading - Form submit loading state
 * @param {string} props.error - External error message
 */
const LoginForm = ({ onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  }, [formData, validate, onSubmit]);

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-error animate-fadeIn">
          {error}
        </div>
      )}

      <div className="auth-fields">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail size={18} />}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock size={18} />}
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Log In
      </Button>
    </form>
  );
};

export default LoginForm;
