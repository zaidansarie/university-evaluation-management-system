import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmailForReset } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email.', 'error');
      return;
    }
    
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);

    if (verifyEmailForReset(email)) {
      showToast('OTP sent to your email.', 'success');
      navigate('/verify-otp', { state: { email } });
    } else {
      showToast('Email not found in the system.', 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2>Forgot Password</h2>
          <p>Enter your registered email to receive an OTP.</p>
        </div>
        
        <form onSubmit={handleContinue} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your university email"
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Continue'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="forgot-password-link">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
