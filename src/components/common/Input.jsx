import { forwardRef } from 'react';
import './Input.css';

/**
 * Input — Controlled input component with label, error state, and icon support
 * @param {object} props
 * @param {string} props.label - Input label text
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.icon - Leading icon
 * @param {'text'|'email'|'password'|'number'|'date'|'textarea'} props.type
 */
const Input = forwardRef(({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isTextarea = type === 'textarea';

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        {isTextarea ? (
          <textarea
            ref={ref}
            id={inputId}
            className={`input-field input-textarea ${icon ? 'has-icon' : ''}`}
            rows={4}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`input-field ${icon ? 'has-icon' : ''}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
