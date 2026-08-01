import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import '../AdminDashboard.css';
import './StudentProfile.css'; // Uses the same structure as FacultyProfile.css

function StudentProfile() {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    roll_number: '',
    enrollment: '',
    email: user?.email || '',
    mobile: '',
    gender: 'Male',
    dob: '',
    programme: '',
    course: '',
    semester: '',
    section: '',
    status: 'Active',
    admission_year: '',
    expected_graduation: '',
    batch: '',
    mentor: '',
    department: '',
    university: user?.universityName || '',
    photoUrl: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const enrolledSubjects = [];

  const stats = {
    subjectsEnrolled: 0,
    currentSemester: '',
    cgpa: '0.00',
    resultsPublished: 0,
    recheckingRequests: 0,
    creditsEarned: 0
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
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Student Profile</h2>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
          Manage your personal and academic information.
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
                <span>🆔 {profile.roll_number}</span>
                <span>🏢 {profile.course}</span>
                <span>🎓 {profile.programme}</span>
              </div>
              <div className="profile-meta">
                <span className="status-badge">🛡️ Active Student</span>
                <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>📅 Batch of {profile.admission_year}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
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
                  <span className="info-label">Roll Number</span>
                  <span className="info-value">{profile.roll_number}</span>
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

            {/* Academic Information */}
            <div className="profile-card">
              <h3>Academic Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">🎓 Programme</span>
                  <span className="info-value">{profile.programme}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🏢 Course / Branch</span>
                  <span className="info-value">{profile.course}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📅 Semester</span>
                  <span className="info-value">{profile.semester}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📌 Section</span>
                  <span className="info-value">{profile.section}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🆔 Enrollment Number</span>
                  <span className="info-value">{profile.enrollment}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">⏳ Expected Graduation</span>
                  <span className="info-value">{profile.expected_graduation}</span>
                </div>
              </div>
            </div>

            {/* Enrolled Subjects */}
            <div className="profile-card">
              <h3>Enrolled Subjects</h3>
              <div className="subject-list">
                {enrolledSubjects.map((sub, idx) => (
                  <div key={idx} className="subject-item">
                    <div className="subject-info">
                      <h4>{sub.name}</h4>
                      <p>{sub.code} • Semester {sub.semester}</p>
                      <p style={{ marginTop: '4px', fontSize: '12px' }}>Faculty: {sub.faculty}</p>
                    </div>
                    <div className="subject-stats">
                      <span className="status-badge" style={{ padding: '6px 12px', fontSize: '12px' }}>{sub.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            {/* Academic Status */}
            <div className="profile-card">
              <h3>Academic Status</h3>
              <div className="subject-list">
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Academic Status</span>
                  <span className="info-value status-badge" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '13px' }}>Active</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Batch</span>
                  <span className="info-value">{profile.batch}</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Admission Year</span>
                  <span className="info-value">{profile.admission_year}</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Expected Graduation</span>
                  <span className="info-value">{profile.expected_graduation}</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Class Advisor / Mentor</span>
                  <span className="info-value">{profile.mentor}</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">Department</span>
                  <span className="info-value">{profile.department}</span>
                </div>
                <div className="info-item" style={{ marginBottom: '10px' }}>
                  <span className="info-label">University Name</span>
                  <span className="info-value">{profile.university}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="profile-card">
              <h3>Student Statistics</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="count">{stats.subjectsEnrolled}</span>
                  <span className="label">Subjects Enrolled</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.currentSemester}</span>
                  <span className="label">Current Semester</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.resultsPublished}</span>
                  <span className="label">Results Published</span>
                </div>
                <div className="stat-box">
                  <span className="count">{stats.recheckingRequests}</span>
                  <span className="label">Rechecking Requests</span>
                </div>
                <div className="stat-box" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="count" style={{ fontSize: '18px', color: '#10b981' }}>{stats.cgpa}</span>
                    <span className="label">Cumulative GPA</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className="count" style={{ fontSize: '18px', color: '#3b82f6' }}>{stats.creditsEarned}</span>
                    <span className="label">Credits Earned</span>
                  </div>
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
                      <label>Roll Number (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.roll_number} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" name="email" className="form-input" value={editForm.email} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="text" name="mobile" className="form-input" value={editForm.mobile} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" className="form-input" value={editForm.gender} onChange={handleEditChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" name="dob" className="form-input" value={editForm.dob} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Academic Information</h4>
                  <div className="info-grid">
                    <div className="form-group">
                      <label>Enrollment Number (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.enrollment} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Admission Year (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.admission_year} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Programme (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.programme} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Course / Branch (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.course} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Semester (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.semester} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Section (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.section} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Batch (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.batch} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="form-group">
                      <label>Academic Status (Read Only)</label>
                      <input type="text" className="form-input" value={editForm.status} disabled style={{ background: '#f1f5f9' }} />
                    </div>
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

export default StudentProfile;
