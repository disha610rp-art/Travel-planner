import { Heart } from 'lucide-react';
import './Footer.css';

/**
 * Footer — Minimal footer with credits
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          Made with <Heart size={14} className="footer-heart" /> by Wanderlust Team
        </p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Wanderlust Travel Planner
        </p>
      </div>
    </footer>
  );
};

export default Footer;
