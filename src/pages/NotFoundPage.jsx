import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

/**
 * NotFoundPage — 404 page
 */
const NotFoundPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        <div className="auth-card">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 800,
            marginBottom: '8px',
          }}>
            404
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 600,
            marginBottom: '16px',
            color: 'var(--text-secondary)',
          }}>
            Page Not Found
          </h2>
          <p style={{
            color: 'var(--text-tertiary)',
            marginBottom: '24px',
          }}>
            Looks like you've wandered off the map. Let's get you back on track!
          </p>
          <Link to="/">
            <Button variant="primary" size="lg" icon={<ArrowLeft size={18} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
