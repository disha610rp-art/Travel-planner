import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Button — Reusable button component with variants, sizes, and loading state
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.fullWidth
 * @param {React.ReactNode} props.icon
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : 18} />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
