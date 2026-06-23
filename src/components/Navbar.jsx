import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>UEMS</h2>
        </Link>
      </div>
      <ul className="navbar-links">
        {location.pathname === '/' ? (
          <>
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#roles">Roles</a></li>
            <li><a href="#contact">Contact</a></li>
          </>
        ) : (
          <li><Link to="/">Back to Home</Link></li>
        )}
      </ul>
      <div className="navbar-auth">
        {location.pathname !== '/login' && (
          <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
