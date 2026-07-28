import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import '../AdminDashboard.css';
import './FacultyProfile.css';

function FacultyProfile() {
  const { showToast } = useToast();
  
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Connor',
    faculty_id: 'FAC-2023-042',
    email: 'sarah.connor@university.edu',
    mobile: '+1 987 654 3210',
    gender: 'Female',
    dob: '1980-05-15',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Artificial Intelligence, Machine Learning',
    experience: '12 Years',
    office: 'Block A, Room 304',
    status: 'Active',
    joined: 'August 2011',
    about: 'Associate Professor in the Department of Computer Science with over 12 years of academic and industry experience. Expertise in Artificial Intelligence, Machine Learning, and scalable data systems. Passionate about mentoring students, conducting impactful research, evaluating modern algorithms, and teaching the next generation of software engineers. Frequently collaborates on interdisciplinary tech projects.',
    photoUrl: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const assignedSubjects = [
    { code: 'CS301', name: 'Database Management Systems', semester: 'V', evaluations: 45 },
    { code: 'CS302', name: 'Operating Systems', semester: 'V', evaluations: 30 },
    { code: 'CS401', name: 'Artificial Intelligence', semester: 'VII', evaluations: 60 }
  ];

  const stats = {
    totalSubjects: 3,
    evaluationsCompleted: 120,
    pendingEvaluations: 15,
    avgEvalTime: '8 mins/paper',
    recheckingHandled: 12
  };

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
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Faculty Profile</h2>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
          Manage your personal and professional information.
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
                <span>🆔 {profile.faculty_id}</span>
                <span>🏢 {profile.department}</span>
                <span>🎓 {profile.designation}</span>
              </div>
              <div className="profile-meta">
                <span className="status-badge">{profile.status}</span>
                <span>Joined: {profile.joined}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>🛡️ Verified Faculty</span>
              <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>📅 Since 2011</span>
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
                  <span className="info-label">Faculty ID</span>
                  <span className="info-value">{profile.faculty_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value">{profile.mobile}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{profile.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value">{profile.dob}</span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="profile-card">
              <h3>Professional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">🏢 Department</span>
                  <span className="info-value">{profile.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🎓 Designation</span>
                  <span className="info-value">{profile.designation}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📜 Qualification</span>
                  <span className="info-value">{profile.qualification}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🔬 Specialization</span>
                  <span className="info-value">{profile.specialization}</span>
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

            {/* Assigned Subjects */}
            <div className="profile-card">
              <h3>Assigned Subjects</h3>
              <div className="subject-list">
                {assignedSubjects.map((sub, idx) => (
                  <div key={idx} className="subject-item">
                    <div className="subject-info">
                      <h4>{sub.name}</h4>
                      <p>{sub.code} • Semester {sub.semester} • Active</p>
                    </div>
                    <div className="subject-stats">
                      <span className="stat-value">{sub.evaluations}</span>
                      <span className="stat-label">Assigned Evaluations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            {/* About */}
            <div className="profile-card">
              <h3>About</h3>
              <p className="about-text">{profile.about}</p>
            </div>

            {/* Statistics */}
            <div className="profile-card">
              <h3>Faculty Statistics</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="count">{stats.totalSubjects}</span>
                  <span className="label">Total Subjects</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.pendingEvaluations}</span>
                  <span className="label">Pending Evals</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.evaluationsCompleted}</span>
                  <span className="label">Completed Evals</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.recheckingHandled}</span>
                  <span className="label">Rechecking Requests Handled</span>
                </div>
                <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
                  <span className="count" style={{ fontSize: '18px', color: '#10b981' }}>{stats.avgEvalTime}</span>
                  <span className="label">Average Evaluation Time</span>
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
                      <label>Faculty ID (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.faculty_id} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Email (Read Only)</label>
                      <input type="email" name="email" className="form-input" value={editForm.email} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="text" name="mobile" className="form-input" value={editForm.mobile} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Gender (Read Only)</label>
                      <select name="gender" className="form-input" value={editForm.gender} disabled style={{ background: '#f1f5f9' }}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date of Birth (Read Only)</label>
                      <input type="date" name="dob" className="form-input" value={editForm.dob} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Professional Information</h4>
                  <div className="info-grid">
                    <div className="form-group">
                      <label>Department (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.department} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Designation (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.designation} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Qualification</label>
                      <input type="text" name="qualification" className="form-input" value={editForm.qualification} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input type="text" name="specialization" className="form-input" value={editForm.specialization} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input type="text" name="experience" className="form-input" value={editForm.experience} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Office Location</label>
                      <input type="text" name="office" className="form-input" value={editForm.office} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>About</h4>
                  <div className="form-group full-width">
                    <label>Professional Biography</label>
                    <textarea name="about" className="form-input" value={editForm.about} onChange={handleEditChange}></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={cancelEdit}>Cancel</button>
              <button className="primary-btn" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FacultyProfile;
