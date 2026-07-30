import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import '../AdminDashboard.css';
import '../faculty/FacultyProfile.css';

function SuperAdminProfile() {
  const { showToast } = useToast();
  
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Platform Owner',
    role: 'Super Admin',
    employee_id: 'SA-001',
    email: 'admin@platform.com',
    work_email: 'admin@platform.com',
    mobile: '+1 800 555 1234',
    gender: 'Male',
    dob: '1985-10-20',
    address: '123 Tech Avenue, Innovation Park',
    country: 'United States',
    timezone: 'UTC-8 (Pacific Time)',
    department: 'Platform Administration',
    organization: 'University Examination Management Platform',
    experience: '8 Years',
    office: 'Headquarters, Suite 500',
    status: 'Active',
    joined: 'January 2024',
    lastLogin: 'Today, 09:30 AM',
    photoUrl: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const stats = {
    universitiesManaged: 18,
    totalAdmins: 25,
    totalStudents: '12.5k',
    totalFaculty: 840,
    totalEvaluations: '45.2k',
    yearsAsOwner: 2,
    lastUpdate: '2 Days Ago',
    totalLogins: 450
  };

  const permissions = [
    { name: 'Full Platform Access', icon: '👑', status: 'Granted' },
    { name: 'University Management', icon: '🏛️', status: 'Granted' },
    { name: 'User Management', icon: '👥', status: 'Granted' },
    { name: 'Platform Configuration', icon: '⚙️', status: 'Granted' },
    { name: 'Security Management', icon: '🛡️', status: 'Granted' },
    { name: 'Notification Management', icon: '🔔', status: 'Granted' },
    { name: 'Audit Log Access', icon: '📋', status: 'Granted' },
    { name: 'Backup & Recovery', icon: '💾', status: 'Granted' }
  ];

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditing(false);
    showToast('Profile updated successfully.');
  };

  const cancelEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px 30px', height: 'auto' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Super Admin Profile</h2>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
          Manage your platform owner account and administrative settings.
        </p>
      </div>

      <div className="dashboard-content profile-container">
        
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-info">
            <div className="profile-photo">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <div className="profile-details">
              <h2>{profile.name}</h2>
              <div className="profile-meta">
                <span>👑 {profile.role}</span>
                <span>📧 {profile.email}</span>
                <span>🕑 Last Login: {profile.lastLogin}</span>
              </div>
              <div className="profile-meta">
                <span className="status-badge">{profile.status}</span>
                <span>Member Since: {profile.joined}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="secondary-btn">📷 Change Photo</button>
            </div>
            <button className="primary-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-grid">
          
          <div className="profile-main">
            {/* Personal Information */}
            <div className="profile-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{profile.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{profile.mobile}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value">{profile.dob}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{profile.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Time Zone</span>
                  <span className="info-value">{profile.timezone}</span>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">Address</span>
                  <span className="info-value">{profile.address}, {profile.country}</span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="profile-card">
              <h3>Professional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">👑 Role</span>
                  <span className="info-value">{profile.role}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🆔 Employee ID</span>
                  <span className="info-value">{profile.employee_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🏢 Department</span>
                  <span className="info-value">{profile.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🌐 Organization</span>
                  <span className="info-value">{profile.organization}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📧 Work Email</span>
                  <span className="info-value">{profile.work_email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">⏳ Years of Experience</span>
                  <span className="info-value">{profile.experience}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📍 Office Location</span>
                  <span className="info-value">{profile.office}</span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-card">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className="info-value" style={{ color: '#10b981', fontWeight: '500' }}>Active</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type</span>
                  <span className="info-value">Platform Owner</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Authentication Method</span>
                  <span className="info-value">Email & Password</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Two-Factor Authentication</span>
                  <span className="info-value" style={{ color: '#10b981' }}>Enabled</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Password Change</span>
                  <span className="info-value">45 Days Ago</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Session Status</span>
                  <span className="info-value">Secure</span>
                </div>
              </div>
            </div>

            {/* Platform Access & Permissions */}
            <div className="profile-card">
              <h3>Platform Access & Permissions</h3>
              <div className="subject-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {permissions.map((perm, idx) => (
                  <div key={idx} className="subject-item" style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="subject-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{perm.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{perm.name}</h4>
                    </div>
                    <span className="status-badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.75rem', padding: '4px 8px' }}>{perm.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            {/* Platform Statistics */}
            <div className="profile-card">
              <h3>Platform Statistics</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="count">{stats.universitiesManaged}</span>
                  <span className="label">Universities Managed</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.totalAdmins}</span>
                  <span className="label">Total Admins</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.totalStudents}</span>
                  <span className="label">Total Students</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.totalFaculty}</span>
                  <span className="label">Total Faculty</span>
                </div>
                <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
                  <span className="count" style={{ fontSize: '18px', color: '#3b82f6' }}>{stats.totalEvaluations}</span>
                  <span className="label">Total Evaluations</span>
                </div>
                <div className="stat-box">
                  <span className="count" style={{ fontSize: '1.2rem' }}>{stats.yearsAsOwner}</span>
                  <span className="label">Years as Owner</span>
                </div>
                <div className="stat-box">
                  <span className="count" style={{ fontSize: '1.2rem' }}>{stats.totalLogins}</span>
                  <span className="label">Total Logins</span>
                </div>
                <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
                  <span className="count" style={{ fontSize: '16px', color: '#8b5cf6' }}>{stats.lastUpdate}</span>
                  <span className="label">Last Platform Update</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={cancelEdit}>&times;</button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Profile Photo</label>
                      <input type="file" className="form-input" accept="image/*" />
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" name="name" className="form-input" value={editForm.name} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Employee ID (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.employee_id} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" className="form-input" value={editForm.email} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" name="mobile" className="form-input" value={editForm.mobile} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input type="text" name="address" className="form-input" value={editForm.address} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Time Zone</label>
                      <select name="timezone" className="form-input" value={editForm.timezone} onChange={handleEditChange}>
                        <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                        <option value="UTC+5:30 (IST)">UTC+5:30 (IST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={cancelEdit}>Cancel</button>
              <button className="primary-btn" type="button" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminProfile;
