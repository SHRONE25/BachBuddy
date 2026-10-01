import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroMode = isHome && !scrolled;

  const links = [
    ...BASE_LINKS,
    ...(user ? [{ to: '/saved', label: 'Saved' }, { to: '/messages', label: 'Messages' }] : []),
    ...(user?.role === 'owner' ? [{ to: '/owner/dashboard', label: 'Owner' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin' }] : []),
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className={`navbar-float ${heroMode ? 'hero-mode' : 'solid-mode'}`}>
      <Link to="/" className="navbar-logo">BachBuddy</Link>

      <nav className="navbar-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="navbar-actions">
        {!user && (
          <>
            <Link to="/login" className="navbar-login-link">Log in</Link>
            <Link to="/register" className="btn btn-accent">Sign Up</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/profile" className="navbar-login-link">{user.name}</Link>
            <button className="btn btn-accent" onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;