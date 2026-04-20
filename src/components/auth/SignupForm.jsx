import { useState, useCallback } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * SignupForm — Name + email + password + confirm password form
 * @param {object} props
 * @param {Function} props.onSubmit - Called with { name, email, password }
 * @param {boolean} props.loading - Form submit loading state
 * @param {string} props.error - External error message
 */
const SignupForm = ({ onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
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
          label="Full Name"
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<User size={18} />}
          autoComplete="name"
        />

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
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock size={18} />}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock size={18} />}
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Create Account
      </Button>
    </form>
  );
};

export default SignupForm;
