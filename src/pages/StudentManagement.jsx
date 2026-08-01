import React, { useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Info, Copy, CheckCircle, User, Shield, Key, Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import './StudentManagement.css';

// -- MASTER DATA (Static for now, can be fetched from DB later) --
const COURSES = ['B.Tech', 'B.Sc', 'BBA', 'MBA', 'M.Tech', 'MCA', 'PhD', 'Other'];

const SCHOOLS = [
  'School of Computer Science',
  'School of Engineering',
  'School of Business',
  'School of Law',
  'School of Design',
  'School of Health Sciences',
  'Other'
];

const PROGRAMS_BY_COURSE = {
  'B.Tech': [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics Engineering',
    'Electrical Engineering',
    'Chemical Engineering'
  ],
  'B.Sc': [
    'Computer Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biotechnology'
  ],
  'BBA': [
    'General',
    'Finance',
    'Marketing',
    'Human Resource'
  ],
  'MBA': [
    'General',
    'Finance',
    'Marketing',
    'Human Resource',
    'Information Technology'
  ],
  'M.Tech': [
    'Computer Science',
    'Embedded Systems',
    'VLSI',
    'Structural Engineering',
    'Thermal Engineering'
  ],
  'MCA': [
    'General',
    'Software Engineering',
    'AI & ML'
  ],
  'PhD': [
    'Computer Science',
    'Management',
    'Physics',
    'Chemistry',
    'Engineering'
  ],
  'Other': [
    'General'
  ]
};

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);
// -----------------------------------------------------------------

function StudentManagement() {
  const { data: studentList = [], loading, error, refetch: fetchStudents } = useApiData('/api/students');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  
  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    course: '',
    program: '',
    school: '',
    semester: '',
    section: '',
    phone_number: '',
    status: 'Active'
  });
  
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, credentials: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, student: null, tempPassword: null });
  const [isResetting, setIsResetting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('********');
  const [isFetchingPassword, setIsFetchingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course') {
      // Reset program if course changes
      setFormData({ ...formData, [name]: value, program: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing student
      try {
        await fetchWithHandling(`http://localhost:5000/api/students/${currentStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        resetForm();
        fetchStudents(true);
      } catch (error) {
        console.error('Error updating student:', error);
        alert(error.message || 'Error updating student');
      }
    } else {
      // Add new student
      try {
        const response = await fetchWithHandling('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        resetForm();
        setSuccessDialog({ isOpen: true, credentials: response.credentials });
        fetchStudents(true);
      } catch (error) {
        console.error('Error adding student:', error);
        alert(error.message || 'Error adding student');
      }
    }
  };
  
  const handleResetPassword = async (username) => {
    if (!window.confirm('Are you sure you want to reset the password for this user?')) return;
    setIsResetting(true);
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/users/${username}/reset-password`, {
        method: 'POST'
      });
      setDetailsModal(prev => ({ ...prev, tempPassword: response.tempPassword }));
      setCurrentPassword(response.tempPassword);
      setShowCurrentPassword(true);
      alert('Password Reset Successfully\n\nNew Username: ' + username + '\nNew Password: ' + response.tempPassword);
    } catch (error) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const fetchCurrentPassword = async (username) => {
    if (showCurrentPassword) {
      setShowCurrentPassword(false);
      return;
    }
    
    if (currentPassword !== '********' && !detailsModal.tempPassword) {
       setShowCurrentPassword(true);
       return;
    }

    setIsFetchingPassword(true);
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/users/${username}/password`);
      if (response.password) {
        setCurrentPassword(response.password);
      } else {
        setCurrentPassword('(User defined - Reset required)');
      }
      setShowCurrentPassword(true);
    } catch (error) {
      console.error('Failed to fetch password', error);
      alert('Could not fetch current password.');
    } finally {
      setIsFetchingPassword(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const openDetailsModal = (student) => {
    setDetailsModal({ isOpen: true, student, tempPassword: null });
    setShowCurrentPassword(false);
    setCurrentPassword('********');
  };

  const resetForm = () => {
    setFormData({
      roll_number: '', name: '', email: '', course: '', program: '',
      school: '', semester: '', section: '', phone_number: '', status: 'Active'
    });
    setIsEditing(false);
    setCurrentStudentId(null);
  };

  const handleEditClick = (student) => {
    setFormData({
      roll_number: student.roll_number || '',
      name: student.name || '',
      email: student.email || '',
      course: student.course || '',
      program: student.program || '',
      school: student.school || '',
      semester: student.semester || '',
      section: student.section || '',
      phone_number: student.phone_number || '',
      status: student.status || 'Active'
    });
    setIsEditing(true);
    setCurrentStudentId(student.id);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE'
      });
      // If the deleted student is currently being edited, reset the form
      if (isEditing && currentStudentId === id) {
         resetForm();
      }
      // Refresh table
      fetchStudents(true);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.message || 'Error deleting student');
    }
  };

  // Derived state for the dependent Program dropdown
  const availablePrograms = formData.course ? PROGRAMS_BY_COURSE[formData.course] || [] : [];

  return (
    <div className="student-management">
      {/* Add/Edit Student Form */}
      <section className="add-student-section">
        <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form className="add-student-form" onSubmit={handleAddOrUpdateStudent}>
          <div className="form-group">
            <input type="text" name="roll_number" placeholder="Roll Number / ID" value={formData.roll_number} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address (Optional)" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <select name="course" value={formData.course} onChange={handleInputChange} required>
              <option value="" disabled>Select Course</option>
              {COURSES.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select 
              name="program" 
              value={formData.program} 
              onChange={handleInputChange} 
              required 
              disabled={!formData.course}
            >
              <option value="" disabled>
                {!formData.course ? 'Select Course First' : 'Select Program'}
              </option>
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="school" value={formData.school} onChange={handleInputChange} required>
              <option value="" disabled>Select School</option>
              {SCHOOLS.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="semester" value={formData.semester} onChange={handleInputChange} required>
              <option value="" disabled>Select Semester</option>
              {SEMESTERS.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input type="text" name="section" placeholder="Section" value={formData.section} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="phone_number" placeholder="Phone Number (Optional)" value={formData.phone_number} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="add-btn">
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Student Directory Table */}
      <section className="student-list-section">
        <h2>Student Directory</h2>
        {loading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : error ? (
          <APIError error={error} onRetry={() => fetchStudents(true)} resourceName="Students" />
        ) : (
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Username</th>
                <th>Course & Program</th>
                <th>Sem/Sec</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No students found. Add one above!
                  </td>
                </tr>
              ) : (
                studentList.map(student => (
                  <tr key={student.id}>
                    <td>{student.roll_number}</td>
                    <td>{student.name}</td>
                    <td><span style={{fontFamily: 'monospace', color: '#475569'}}>{student.username || 'N/A'}</span></td>
                    <td>{student.course} - {student.program}</td>
                    <td>Sem {student.semester} / {student.section}</td>
                    <td>
                      <span className={`status-badge ${student.status?.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn" onClick={() => openDetailsModal(student)} title="Details">
                          <Info size={18} color="#0284c7" />
                        </button>
                        <button className="edit-btn" onClick={() => handleEditClick(student)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>
      
      {/* Success Dialog for New Student */}
      {successDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                <CheckCircle size={48} color="#16a34a" />
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '10px 0', color: '#1e293b' }}>Account Created Successfully</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                Please securely share these credentials with the student. The password should be changed on first login.
              </p>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Username</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{successDialog.credentials?.username}</span>
                    <button onClick={() => copyToClipboard(successDialog.credentials?.username)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Copy size={16} color="#64748b" /></button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Temporary Password</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{successDialog.credentials?.tempPassword}</span>
                    <button onClick={() => copyToClipboard(successDialog.credentials?.tempPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Copy size={16} color="#64748b" /></button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', borderTop: 'none' }}>
              <button className="btn btn-primary" onClick={() => setSuccessDialog({ isOpen: false, credentials: null })} style={{ width: '100%' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.isOpen && detailsModal.student && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="modal" style={{ width: '800px', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#0284c7" /> Student Details
              </h3>
              <button className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setDetailsModal({ isOpen: false, student: null, tempPassword: null })}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', background: '#ffffff' }}>
              
              {/* Left Column: Personal Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', fontWeight: 600 }}>
                  <User size={18} color="#475569" /> Personal Information
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Name</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.student.name}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Enrollment</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.student.roll_number}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Program</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.student.course} {detailsModal.student.program}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Semester</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.student.semester}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Status</span>
                  <span><span className={`status-badge ${detailsModal.student.status?.toLowerCase()}`} style={{ padding: '6px 12px', borderRadius: '12px' }}>{detailsModal.student.status}</span></span>
                </div>
              </div>

              {/* Right Column: Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Credentials Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.5)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <Shield size={18} color="#3b82f6" /> Login Credentials
                  </h4>
                  
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Username</label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{detailsModal.student.username || 'N/A'}</span>
                      <button onClick={() => copyToClipboard(detailsModal.student.username)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} title="Copy Username" className="hover-bg-slate-100">
                        <Copy size={18} color="#64748b" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Password</label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '1rem', letterSpacing: showCurrentPassword ? 'normal' : '0.2em' }}>
                        {showCurrentPassword ? currentPassword : '••••••••'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => fetchCurrentPassword(detailsModal.student.username)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} title={showCurrentPassword ? 'Hide Password' : 'Show Password'} disabled={isFetchingPassword} className="hover-bg-slate-100">
                          {isFetchingPassword ? <RefreshCw size={18} color="#64748b" className="spinner" /> : (showCurrentPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />)}
                        </button>
                        <button onClick={() => copyToClipboard(showCurrentPassword ? currentPassword : '••••••••')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} title="Copy Password" className="hover-bg-slate-100">
                          <Copy size={18} color="#64748b" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Management */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', fontWeight: 600 }}>
                    <Key size={18} color="#475569" /> Account Management
                  </h4>
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleResetPassword(detailsModal.student.username)}
                    disabled={isResetting || !detailsModal.student.username}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', cursor: 'pointer' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  >
                    {isResetting ? <RefreshCw size={18} className="spinner" /> : <RefreshCw size={18} />}
                    {isResetting ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                    Generates a new strong password. The user must change it on their next login.
                  </p>
                </div>

              </div>
            </div>
            
            <div className="modal-footer" style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', borderRadius: '0 0 16px 16px' }}>
              <button className="btn btn-primary" onClick={() => setDetailsModal({ isOpen: false, student: null, tempPassword: null })} style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
