import { Link } from 'react-router-dom';
import { MapPin, Calendar, Wallet, FileText, Sparkles, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import './LandingPage.css';

/**
 * LandingPage — Hero page shown to unauthenticated users
 */
const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Sparkles size={28} />,
      title: 'AI-Powered Suggestions',
      description: 'Get personalized hotel, restaurant, and attraction recommendations powered by AI.',
      accent: 'purple',
    },
    {
      icon: <Calendar size={28} />,
      title: 'Smart Itineraries',
      description: 'Auto-generated day-by-day plans that you can customize to your liking.',
      accent: 'blue',
    },
    {
      icon: <Wallet size={28} />,
      title: 'Budget Breakdown',
      description: 'See exactly where your money goes with detailed expense categories.',
      accent: 'pink',
    },
    {
      icon: <FileText size={28} />,
      title: 'Notes & Documents',
      description: 'Store allergies, preferences, and important documents all in one place.',
      accent: 'mint',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
          <div className="hero-blob hero-blob-3"></div>
        </div>

        <div className="hero-content animate-fadeInUp">
          <div className="hero-badge">
            <Sparkles size={14} />
            AI-Powered Travel Planning
          </div>

          <h1 className="hero-title">
            Plan Your Dream
            <span className="text-gradient"> Adventure</span>
          </h1>

          <p className="hero-description">
            Wanderlust helps you plan the perfect trip with AI-powered suggestions,
            smart budgeting, and a beautiful itinerary — all in one place.
          </p>

          <div className="hero-actions">
            <Link to={isAuthenticated ? '/dashboard' : '/signup'}>
              <Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            )}
          </div>

          {/* Floating cards decoration */}
          <div className="hero-cards">
            <div className="hero-float-card hero-float-1 animate-float">
              <MapPin size={20} />
              <span>Paris, France</span>
            </div>
            <div className="hero-float-card hero-float-2 animate-float" style={{ animationDelay: '0.5s' }}>
              <Calendar size={20} />
              <span>7 Days</span>
            </div>
            <div className="hero-float-card hero-float-3 animate-float" style={{ animationDelay: '1s' }}>
              <Wallet size={20} />
              <span>$2,500</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="features-header animate-fadeInUp">
          <h2 className="section-title">
            Everything You Need for the <span className="text-gradient">Perfect Trip</span>
          </h2>
          <p className="section-subtitle">
            From AI suggestions to budget tracking, we've got every aspect of your journey covered.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              accent={feature.accent}
              hoverable
              className="feature-card animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`feature-icon feature-icon-${feature.accent}`}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section">
        <div className="cta-card glass animate-fadeInUp">
          <h2 className="cta-title">
            Ready to Start Planning?
          </h2>
          <p className="cta-description">
            Join thousands of travelers who use Wanderlust to plan unforgettable trips.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/signup'}>
            <Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
