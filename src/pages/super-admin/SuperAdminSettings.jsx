import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import PasswordInput from '../../components/common/PasswordInput';
import PasswordChecklist from '../../components/common/PasswordChecklist';
import { validatePassword } from '../../utils/passwordPolicy';
import '../AdminDashboard.css';

function SuperAdminSettings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Settings State
  const [general, setGeneral] = useState({
    platformName: 'University Evaluation Management Platform',
    organizationName: 'EduTech Systems',
    academicYear: '2024-2025',
    timeZone: 'UTC-8 (Pacific Time)',
    language: 'English'
  });

  const [branding, setBranding] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    platformAlerts: true,
    securityAlerts: true,
    systemMaintenance: false,
    universityRegistration: true
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '30',
    loginAlerts: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    refreshInterval: '5'
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneral(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
    if (!validatePassword(passwords.new).isValid) {
      setPasswordError('New password does not meet the strict requirements.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New password and confirm password must match.');
      return;
    }
    
    showToast('Password updated successfully.');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleSaveAll = () => {
    showToast('Platform settings saved successfully.');
  };

  const handleReset = () => {
    showToast('Settings reset to default configuration.');
  };

  const CardHeader = ({ icon, title, description }) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        {title}
      </h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{description}</p>
    </div>
  );

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: '24px'
  };

  const labelStyle = { display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '500' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' };

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Platform Settings</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Section 1: General Settings */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
            title="General Settings"
            description="Configure basic platform-wide details and localization."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Platform Name</label>
              <input type="text" name="platformName" value={general.platformName} onChange={handleGeneralChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Organization Name</label>
              <input type="text" name="organizationName" value={general.organizationName} onChange={handleGeneralChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Default Academic Year</label>
              <input type="text" name="academicYear" value={general.academicYear} onChange={handleGeneralChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Default Language</label>
              <select name="language" value={general.language} onChange={handleGeneralChange} style={inputStyle}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Default Time Zone</label>
              <select name="timeZone" value={general.timeZone} onChange={handleGeneralChange} style={inputStyle}>
                <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                <option value="UTC+5:30 (IST)">UTC+5:30 (IST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Branding */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>}
            title="Platform Branding"
            description="Upload logos and customize primary brand colors."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Platform Logo</label>
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '24px' }}>🏛️</span>
                <p style={{ margin: '8px 0', fontSize: '13px', color: '#64748b' }}>Click to upload logo</p>
                <button style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Choose File</button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Favicon</label>
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '24px' }}>🌐</span>
                <p style={{ margin: '8px 0', fontSize: '13px', color: '#64748b' }}>Click to upload favicon</p>
                <button style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Choose File</button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Primary Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="color" value={branding.primaryColor} onChange={(e) => setBranding({...branding, primaryColor: e.target.value})} style={{ width: '40px', height: '38px', padding: '0', border: 'none', borderRadius: '4px' }} />
                <input type="text" value={branding.primaryColor} readOnly style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Secondary Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="color" value={branding.secondaryColor} onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})} style={{ width: '40px', height: '38px', padding: '0', border: 'none', borderRadius: '4px' }} />
                <input type="text" value={branding.secondaryColor} readOnly style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>}
            title="Notification Preferences"
            description="Manage global alerts and system notifications."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily digests and critical alerts via email.' },
              { id: 'platformAlerts', label: 'Platform Alerts', desc: 'In-app notifications for general platform activity.' },
              { id: 'securityAlerts', label: 'Security Alerts', desc: 'Immediate alerts for suspicious logins or role changes.' },
              { id: 'systemMaintenance', label: 'System Maintenance', desc: 'Notices regarding scheduled downtime or updates.' },
              { id: 'universityRegistration', label: 'University Registration', desc: 'Alerts when new universities register or require verification.' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: item.id !== 'universityRegistration' ? '1px solid #f1f5f9' : 'none' }}>
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

        {/* Section 4: Security Settings */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
            title="Security Settings"
            description="Manage authentication, sessions, and super admin access."
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Change Password</h4>
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

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Session Timeout (Minutes)</label>
                <select name="sessionTimeout" value={security.sessionTimeout} onChange={handleSecurityChange} style={inputStyle}>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Two-Factor Authentication</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '10px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: security.twoFactor ? '#dcfce7' : '#fee2e2', color: security.twoFactor ? '#166534' : '#991b1b', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>
                    {security.twoFactor ? 'Enabled' : 'Disabled'}
                  </span>
                  <button type="button" onClick={() => setSecurity(prev => ({...prev, twoFactor: !prev.twoFactor}))} style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                    Toggle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Platform Preferences */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>}
            title="Platform Preferences"
            description="Customize platform formatting and appearance."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { id: 'light', label: 'Light', icon: <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></> },
                  { id: 'dark', label: 'Dark', icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path> },
                  { id: 'system', label: 'System', icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></> }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setPreferences(prev => ({...prev, theme: opt.id}))}
                    style={{
                      padding: '12px',
                      border: `2px solid ${preferences.theme === opt.id ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: preferences.theme === opt.id ? '#eff6ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: preferences.theme === opt.id ? '#3b82f6' : '#64748b' }}>
                      {opt.icon}
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: preferences.theme === opt.id ? '#1e3a8a' : '#475569' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Date Format</label>
              <select name="dateFormat" value={preferences.dateFormat} onChange={handlePreferencesChange} style={inputStyle}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Time Format</label>
              <select name="timeFormat" value={preferences.timeFormat} onChange={handlePreferencesChange} style={inputStyle}>
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Dashboard Refresh Interval</label>
              <select name="refreshInterval" value={preferences.refreshInterval} onChange={handlePreferencesChange} style={inputStyle}>
                <option value="1">1 Minute</option>
                <option value="5">5 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="never">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 6: Backup & Recovery */}
        <div style={cardStyle}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>}
            title="Backup & Recovery"
            description="Manage automated database backups and data retention."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Last Backup</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>Today, 02:00 AM</p>
              <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', padding: '2px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '10px' }}>Successful</span>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Backup Frequency</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>Daily (Automated)</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }} onClick={() => showToast('Backup initiated.')}>
              Initiate Manual Backup
            </button>
            <button style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              View Backup History
            </button>
          </div>
        </div>

        {/* Section 7: System Maintenance */}
        <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
          <CardHeader 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e0b' }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>}
            title="System Maintenance"
            description="Perform critical platform administration tasks."
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#b45309', fontSize: '15px' }}>Maintenance Mode</h4>
              <p style={{ margin: 0, color: '#92400e', fontSize: '13px' }}>Temporarily disable platform access for updates.</p>
            </div>
            <div 
              onClick={() => {
                if(window.confirm(`Are you sure you want to ${maintenanceMode ? 'disable' : 'enable'} Maintenance Mode?`)) {
                  setMaintenanceMode(!maintenanceMode);
                  showToast(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`);
                }
              }}
              style={{
                width: '44px', height: '24px', backgroundColor: maintenanceMode ? '#f59e0b' : '#cbd5e1', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
              }}
            >
              <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: maintenanceMode ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <button style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { if(window.confirm('Clear system cache?')) showToast('Cache cleared.'); }}>
              🧹 Clear Cache
            </button>
            <button style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { if(window.confirm('Restart background services?')) showToast('Services restarted.'); }}>
              🔄 Restart Services
            </button>
            <button style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => showToast('Running health check...')}>
              🏥 Health Check
            </button>
          </div>
        </div>

        {/* Section 8: Save Changes */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px', marginBottom: '40px' }}>
          <button onClick={handleReset} style={{ padding: '10px 24px', backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
            Reset to Default
          </button>
          <button onClick={handleSaveAll} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)' }}>
            Save All Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default SuperAdminSettings;
