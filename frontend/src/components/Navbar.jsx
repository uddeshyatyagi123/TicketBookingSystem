import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🎟️</span>
          <span className="brand-text">BookMyTicket</span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              🏠 Home
            </Link>
            {user && (
              <Link to="/my-bookings" className="nav-link" onClick={closeMenu}>
                🎫 My Bookings
              </Link>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                  📊 Dashboard
                </Link>
                <Link to="/admin/events" className="nav-link" onClick={closeMenu}>
                  🎬 Manage Events
                </Link>
              </>
            )}
          </div>

          <div className="navbar-auth">
            {user ? (
              <>
                <Link to="/profile" className="nav-user-greeting" onClick={closeMenu}>
                  👋 Hey, {user.name}
                </Link>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
