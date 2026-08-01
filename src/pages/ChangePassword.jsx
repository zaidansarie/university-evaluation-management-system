import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchWithHandling } from '../utils/api';
import './Login.css'; // Reusing Login styles for consistent full-page centered form

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // If not logged in, go to login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (newPassword !== confirmPassword) {
      setAuthError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await fetchWithHandling('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          newPassword
        })
      });
      
      showToast('Password changed successfully!', 'success');
      
      // Update local context to reflect change
      setUser({ ...user, first_login: false });
      
      // Navigate to dashboard based on role
      navigate(`/${user.role}`, { replace: true });
      
    } catch (err) {
      setAuthError(err.message || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2>Update Password</h2>
          <p>Please change your temporary password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                id="oldPassword" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current temporary password"
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                id="newPassword" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new strong password"
                required 
              />
            </div>
            {authError && <div className="login-error-message" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>{authError}</div>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show Passwords
            </label>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
