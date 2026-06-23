import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>University Evaluation Management System</h1>
        <p>A digital platform designed to simplify examination management, evaluation, and result processing for universities.</p>
        <button className="hero-btn" onClick={() => document.getElementById('features').scrollIntoView()}>Explore Features</button>
      </div>
    </section>
  );
}

export default Hero;
