import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function Login() {
  const [universityCode, setUniversityCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuperAdminLogin, setIsSuperAdminLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!isSuperAdminLogin && !universityCode) {
      setAuthError('University Code is required.');
      return;
    }
    if (!email) {
      setAuthError('Username is required.');
      return;
    }
    if (!password) {
      setAuthError('Password is required.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, universityCode, isSuperAdminLogin, rememberMe);
    
    if (result.success) {
      if (result.requiresPasswordChange) {
        navigate('/change-password', { replace: true });
        return;
      }
      
      // Small artificial delay to show spinner processing
      await new Promise(res => setTimeout(res, 500));
      setIsLoading(false);
      showToast('Login successful.', 'success');
      
      const from = location.state?.from?.pathname || `/${result.role}`;
      navigate(from, { replace: true });
    } else {
      setIsLoading(false);
      setAuthError(result.error || 'Invalid email or password. Please try again.');
    }
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <h2>UEMS Portal</h2>
          <p>Sign in to access your dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {!isSuperAdminLogin && (
            <div className="form-group">
              <label htmlFor="universityCode">University Code</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <input 
                  type="text" 
                  id="universityCode" 
                  value={universityCode} 
                  onChange={(e) => setUniversityCode(e.target.value)}
                  placeholder="Enter university code (e.g. UPES)"
                  required={!isSuperAdminLogin} 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Username</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <input 
                type="text" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter username"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required 
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {authError && <div className="login-error-message" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>{authError}</div>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="forgot-password-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>

        <div className="login-footer-links" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => {
              setIsSuperAdminLogin(!isSuperAdminLogin);
              setAuthError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSuperAdminLogin ? 'Return to University Login' : 'Login as Platform Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
