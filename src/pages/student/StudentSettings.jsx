import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import '../AdminDashboard.css';

function StudentSettings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Profile Data State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Notification State
  const [notifications, setNotifications] = useState({
    results: true,
    rechecking: true,
    announcements: false
  });
  
  // Theme State
  const [theme, setTheme] = useState('system');
  
  // Mock student ID (consistent with StudentProfile)
  const studentId = 1;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!passwords.current) {
      setPasswordError('Current password is required.');
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New password and confirm password must match.');
      return;
    }
    
    // Mock API Call
    setTimeout(() => {
      showToast('Password updated successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    }, 500);
  };
  
  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    // Basic logout handling - redirect to login
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Settings</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Section 1: Account Information */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Account Information
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Basic account details and academic information.</p>
            </div>
          </div>
          
          {loading ? (
            <div style={{ color: '#64748b', fontSize: '14px' }}>Loading...</div>
          ) : profile ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Student Name</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.name || 'Not Available'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Enrollment Number</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.enrollment_number || profile.candidate_code || 'Not Available'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Email Address</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.email || 'Not Available'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Mobile Number</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.phone_number || 'Not Available'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Programme</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.course || 'Not Available'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Course / Branch</label>
                <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>{profile.program || 'Not Available'}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#ef4444', fontSize: '14px' }}>Failed to load profile data.</div>
          )}
        </div>

        {/* Section 2: Change Password */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Change Password
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Update your password to secure your account.</p>
          </div>
          
          {passwordError && (
            <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecaca' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={submitPasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>Current Password *</label>
                <input 
                  type="password" 
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  placeholder="Enter current password"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>New Password *</label>
                  <input 
                    type="password" 
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>Confirm Password *</label>
                  <input 
                    type="password" 
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setPasswords({ current: '', new: '', confirm: '' });
                    setPasswordError('');
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Section 3: Notification Preferences */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Notification Preferences
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Choose which notifications you want to receive.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'results', label: 'Result Notifications', desc: 'Get notified when new exam results are published.' },
              { id: 'rechecking', label: 'Rechecking Notifications', desc: 'Updates on your rechecking request status.' },
              { id: 'announcements', label: 'General Announcements', desc: 'Important university notices and schedule changes.' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: item.id !== 'announcements' ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</div>
                </div>
                <div 
                  onClick={() => toggleNotification(item.id)}
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: notifications[item.id] ? '#3b82f6' : '#cbd5e1',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: notifications[item.id] ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Appearance */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>
              Appearance
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Customize the look and feel of the portal.</p>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '13px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ede9fe', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Theme support coming soon.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', opacity: 0.7 }}>
            {[
              { id: 'light', label: 'Light', icon: <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></> },
              { id: 'dark', label: 'Dark', icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path> },
              { id: 'system', label: 'System Default', icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></> }
            ].map(opt => (
              <button 
                key={opt.id}
                disabled
                onClick={() => setTheme(opt.id)}
                className="theme-button"
                style={{
                  padding: '12px',
                  border: `2px solid ${theme === opt.id ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme === opt.id ? '#eff6ff' : '#fff',
                  transition: 'all 0.2s',
                  position: 'relative',
                  width: '100%',
                  outline: 'none'
                }}
              >
                {theme === opt.id && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#3b82f6' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === opt.id ? '#3b82f6' : '#64748b' }}>
                  {opt.icon}
                </svg>
                <span style={{ fontSize: '13px', fontWeight: '500', color: theme === opt.id ? '#1e3a8a' : '#475569' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Security */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px',
          marginBottom: '40px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Security
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Manage your sessions and secure your account.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Last Login</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>18 Jul 2026 • Windows • Chrome</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Last Password Changed</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>2 months ago</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fff',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
            
            <div style={{ position: 'relative', display: 'inline-block' }} className="tooltip-container">
              <button 
                disabled
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#94a3b8',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                Logout from All Devices
              </button>
              <span className="tooltip-text" style={{
                visibility: 'hidden',
                backgroundColor: '#334155',
                color: '#fff',
                textAlign: 'center',
                borderRadius: '4px',
                padding: '4px 8px',
                position: 'absolute',
                zIndex: 1,
                bottom: '125%',
                left: '50%',
                marginLeft: '-50px',
                opacity: 0,
                transition: 'opacity 0.3s',
                fontSize: '12px',
                width: '100px'
              }}>Coming Soon</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .tooltip-container:hover .tooltip-text {
          visibility: visible !important;
          opacity: 1 !important;
        }
        @media (max-width: 640px) {
          form > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentSettings;
