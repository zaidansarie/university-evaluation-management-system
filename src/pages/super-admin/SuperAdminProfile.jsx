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
    email: 'admin@platform.com',
    mobile: '+1 800 555 1234',
    status: 'Active',
    joined: 'January 2024',
    lastLogin: 'Today, 09:30 AM',
    photoUrl: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

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
          Manage your platform owner account details.
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
                <span>📱 {profile.mobile}</span>
              </div>
              <div className="profile-meta">
                <span className="status-badge">{profile.status}</span>
                <span>Member Since: {profile.joined}</span>
                <span style={{ marginLeft: '10px' }}>🕑 Last Login: {profile.lastLogin}</span>
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

        <div className="profile-grid" style={{ display: 'block', maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="profile-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic Information */}
            <div className="profile-card">
              <h3>Basic Information</h3>
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
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-card">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className="info-value" style={{ color: '#10b981', fontWeight: '500' }}>{profile.status}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{profile.role}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{profile.joined}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Login</span>
                  <span className="info-value">{profile.lastLogin}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content large" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={cancelEdit}>&times;</button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-section">
                  <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="form-group">
                      <label>Profile Photo</label>
                      <input type="file" className="form-input" accept="image/*" />
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" name="name" className="form-input" value={editForm.name} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Email (Read Only)</label>
                      <input type="email" name="email" className="form-input" value={editForm.email} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" name="mobile" className="form-input" value={editForm.mobile} onChange={handleEditChange} />
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
