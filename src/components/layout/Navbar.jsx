import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Menu, X, LogOut, User, Plus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

/**
 * Navbar — Top navigation bar with responsive hamburger menu
 */
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  }, [logout, navigate]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass-strong">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo" onClick={closeMenu}>
          <Map size={24} className="navbar-logo-icon" />
          <span className="navbar-logo-text">Wanderlust</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="navbar-links">
            <Link
              to="/dashboard"
              className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/trip/new"
              className={`navbar-link ${isActive('/trip/new') ? 'active' : ''}`}
            >
              <Plus size={16} />
              New Trip
            </Link>
          </div>
        )}

        {/* Right section */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <div className="navbar-user">
                <div className="navbar-avatar">{user?.avatar}</div>
                <span className="navbar-username">{user?.name}</span>
              </div>
              <button
                className="navbar-logout"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && menuOpen && (
        <div className="navbar-mobile-menu animate-fadeInDown">
          <Link
            to="/dashboard"
            className={`navbar-mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <User size={18} />
            Dashboard
          </Link>
          <Link
            to="/trip/new"
            className={`navbar-mobile-link ${isActive('/trip/new') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Plus size={18} />
            New Trip
          </Link>
          <button className="navbar-mobile-link navbar-mobile-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
