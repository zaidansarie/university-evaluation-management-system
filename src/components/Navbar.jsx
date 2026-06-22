import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>UEMS</h2>
      </div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#roles">Roles</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="navbar-auth">
        <button className="login-btn">Login</button>
      </div>
    </nav>
  );
}

export default Navbar;
