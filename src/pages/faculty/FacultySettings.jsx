import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import PasswordInput from '../../components/common/PasswordInput';
import PasswordChecklist from '../../components/common/PasswordChecklist';
import { validatePassword } from '../../utils/passwordPolicy';
import '../AdminDashboard.css';

function FacultySettings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Notification State
  const [notifications, setNotifications] = useState({
    evaluationAssignments: true,
    recheckingRequests: true,
    submissionReminders: true,
    announcements: false
  });
  
  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    dataSharing: false
  });

  // Language State
  const [language, setLanguage] = useState('en');

  // Theme State
  const [theme, setTheme] = useState('system');

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
    if (!validatePassword(passwords.new).isValid) {
      setPasswordError('New password does not meet the strict requirements.');
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

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Settings</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Section 1: Appearance & Language */}
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
              Appearance & Language
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Customize the look and feel of the portal.</p>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '13px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ede9fe', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Theme support coming soon.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', opacity: 0.7, marginBottom: '24px' }}>
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

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#334155', fontWeight: '500', marginBottom: '8px' }}>Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: '100%', maxWidth: '300px', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            >
              <option value="en">English (US)</option>
              <option value="es">Spanish (ES)</option>
              <option value="fr">French (FR)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Notification Preferences */}
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
              { id: 'evaluationAssignments', label: 'Evaluation Assignments', desc: 'Get notified when new answer sheets are assigned for evaluation.' },
              { id: 'recheckingRequests', label: 'Rechecking Requests', desc: 'Updates on student rechecking requests assigned to you.' },
              { id: 'submissionReminders', label: 'Result Submission Reminders', desc: 'Reminders for upcoming result submission deadlines.' },
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

        {/* Section 3: Privacy */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Privacy
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Control your data sharing and visibility.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'profileVisibility', label: 'Profile Visibility', desc: 'Allow other faculty members to see your contact information.' },
              { id: 'dataSharing', label: 'Data Sharing', desc: 'Share anonymous usage data to help us improve the system.' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: item.id !== 'dataSharing' ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</div>
                </div>
                <div 
                  onClick={() => togglePrivacy(item.id)}
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: privacy[item.id] ? '#3b82f6' : '#cbd5e1',
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
                    left: privacy[item.id] ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Security */}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Security
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Update your password and manage sessions.</p>
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            {passwordError && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecaca' }}>
                {passwordError}
              </div>
            )}
            <form onSubmit={submitPasswordChange}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>Current Password *</label>
                  <PasswordInput 
                    id="current"
                    value={passwords.current}
                    onChange={(e) => handlePasswordChange({ target: { name: 'current', value: e.target.value } })}
                    placeholder="Enter current password"
                    icon={Lock}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>New Password *</label>
                    <PasswordInput 
                      id="new"
                      value={passwords.new}
                      onChange={(e) => handlePasswordChange({ target: { name: 'new', value: e.target.value } })}
                      placeholder="Min. 8 characters"
                      icon={Key}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>Confirm Password *</label>
                    <PasswordInput 
                      id="confirm"
                      value={passwords.confirm}
                      onChange={(e) => handlePasswordChange({ target: { name: 'confirm', value: e.target.value } })}
                      placeholder="Repeat new password"
                      icon={ShieldCheck}
                    />
                  </div>
                </div>

                {passwords.new && (
                  <PasswordChecklist password={passwords.new} confirmPassword={passwords.confirm} />
                )}
                
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
                    disabled={!passwords.current || !validatePassword(passwords.new).isValid || passwords.new !== passwords.confirm}
                    style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: (!passwords.current || !validatePassword(passwords.new).isValid || passwords.new !== passwords.confirm) ? 0.6 : 1 }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Add an extra layer of security to your account.</div>
            </div>
            <button style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
              Enable 2FA
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Last Login</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>18 Jul 2026 • Windows • Chrome</div>
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

export default FacultySettings;
