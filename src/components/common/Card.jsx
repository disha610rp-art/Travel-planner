import './Card.css';

/**
 * Card — Glassmorphism card with hover animation
 * @param {object} props
 * @param {boolean} props.hoverable - Whether card lifts on hover
 * @param {'default'|'pink'|'blue'|'purple'|'mint'|'peach'} props.accent
 * @param {string} props.className
 * @param {Function} props.onClick
 */
const Card = ({
  children,
  hoverable = false,
  accent = 'default',
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div
      className={`card card-${accent} ${hoverable ? 'card-hoverable' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
