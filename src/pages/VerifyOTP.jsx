import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the OTP.', 'error');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);

    if (otp === '123456') {
      showToast('OTP verified successfully.', 'success');
      navigate('/reset-password', { state: { email } });
    } else {
      showToast('Invalid OTP. Please try again.', 'error');
    }
  };

  const handleResend = async () => {
    showToast('Resending OTP...', 'info');
    await new Promise(resolve => setTimeout(resolve, 800));
    showToast('A new OTP has been sent to your email.', 'success');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2>Verify OTP</h2>
          <p>We've sent a 6-digit verification code to <strong>{email}</strong></p>
        </div>
        
        <form onSubmit={handleVerify} className="login-form">
          <div className="form-group" style={{ alignItems: 'center' }}>
            <label htmlFor="otp">Enter OTP</label>
            <input 
              type="text" 
              id="otp" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              placeholder="0 0 0 0 0 0"
              maxLength="6"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.2em', width: '200px' }}
              className="input-with-icon"
              required 
            />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '-10px' }}>
            <p style={{ margin: '4px 0' }}>Demo Project Note: Use OTP <strong>123456</strong></p>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>
            Didn't receive the code? <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '500', cursor: 'pointer', padding: 0 }}>Resend OTP</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="forgot-password-link">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyOTP;
