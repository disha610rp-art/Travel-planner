import './Loader.css';

/**
 * Loader — Animated pastel loading spinner
 * @param {object} props
 * @param {'sm'|'md'|'lg'} props.size
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullPage - Whether to center on full page
 */
const Loader = ({ size = 'md', text, fullPage = false }) => {
  return (
    <div className={`loader-container ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className={`loader loader-${size}`}>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
