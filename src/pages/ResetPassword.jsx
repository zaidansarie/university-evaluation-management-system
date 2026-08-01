import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Key, ShieldCheck } from 'lucide-react';
import PasswordInput from '../components/common/PasswordInput';
import PasswordChecklist from '../components/common/PasswordChecklist';
import { validatePassword } from '../utils/passwordPolicy';
import './Login.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(password).isValid) {
      showToast('Password does not meet the strict requirements.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);

    showToast('Password updated successfully.', 'success');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2>Reset Password</h2>
          <p>Create a new strong password for your account.</p>
        </div>
        
        <form onSubmit={handleReset} className="login-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new strong password"
              icon={Key}
            />
            {password && (
              <PasswordChecklist password={password} confirmPassword={confirmPassword} />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              icon={ShieldCheck}
            />
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isLoading || !validatePassword(password).isValid || password !== confirmPassword} 
            style={{ marginTop: '16px' }}
          >
            {isLoading ? <div className="spinner"></div> : 'Reset Password'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="forgot-password-link">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
