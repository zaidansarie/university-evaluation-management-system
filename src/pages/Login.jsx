import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [university, setUniversity] = useState('');
  const [role, setRole] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // No backend connection needed yet
    console.log('Login attempt:', { university, role, loginId, password });
    alert('Login submitted! (Backend not connected yet)');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please select your university and login to continue.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="university">University</label>
            <select 
              id="university" 
              value={university} 
              onChange={(e) => setUniversity(e.target.value)}
              required
            >
              <option value="" disabled>Select your University</option>
              <option value="demo1">Demo University 1</option>
              <option value="demo2">Demo University 2</option>
              <option value="demo3">Demo University 3</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>Select your Role</option>
              <option value="admin">University Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="loginId">Login ID</label>
            <input 
              type="text" 
              id="loginId" 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Enter Email / University ID"
              required 
            />
            <small className="form-helper-text">Examples: Email, Roll Number, Enrollment Number, SAP ID, Registration Number</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
            <a href="#forgot-password" className="forgot-password-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-submit-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
