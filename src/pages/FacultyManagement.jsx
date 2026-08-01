import React, { useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Info, Copy, CheckCircle, User, Shield, Key, Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import './FacultyManagement.css';

function FacultyManagement() {
  const { data: facultyList = [], loading, error, refetch: fetchFaculty } = useApiData('/api/faculty');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone_number: '',
    status: 'Active'
  });
  
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, credentials: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, faculty: null, tempPassword: null });
  const [isResetting, setIsResetting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('********');
  const [isFetchingPassword, setIsFetchingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithHandling('http://localhost:5000/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      // Clear form
      setFormData({ name: '', email: '', department: '', phone_number: '', status: 'Active' });
      // Show Success Dialog
      setSuccessDialog({ isOpen: true, credentials: response.credentials });
      // Refresh table
      fetchFaculty(true);
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert(error.message || 'Failed to add faculty.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/faculty/${id}`, {
        method: 'DELETE'
      });
      fetchFaculty(true);
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert(error.message || 'Failed to delete faculty.');
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

  const openDetailsModal = (faculty) => {
    setDetailsModal({ isOpen: true, faculty, tempPassword: null });
    setShowCurrentPassword(false);
    setCurrentPassword('********');
  };

  return (
    <div className="faculty-management">
      {/* Add Faculty Form */}
      <section className="add-faculty-section">
        <h2>Add New Faculty</h2>
        <form className="add-faculty-form" onSubmit={handleAddFaculty}>
          <div className="form-group">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address (Optional)" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="add-btn">Add Faculty</button>
        </form>
      </section>

      {/* Faculty Directory Table */}
      <section className="faculty-list-section">
        <h2>Faculty Directory</h2>
        {loading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : error ? (
          <APIError error={error} onRetry={() => fetchFaculty(true)} resourceName="Faculty" />
        ) : (
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No faculty found. Add one above!
                  </td>
                </tr>
              ) : (
                facultyList.map(faculty => (
                  <tr key={faculty.id}>
                    <td>{faculty.name}</td>
                    <td><span style={{fontFamily: 'monospace', color: '#475569'}}>{faculty.username || 'N/A'}</span></td>
                    <td>{faculty.department}</td>
                    <td>{faculty.phone_number}</td>
                    <td>
                      <span className={`status-badge ${faculty.status.toLowerCase()}`}>
                        {faculty.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn" onClick={() => openDetailsModal(faculty)} title="Details">
                          <Info size={18} color="#0284c7" />
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteFaculty(faculty.id)}>
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
      
      {/* Success Dialog for New Faculty */}
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
                Please securely share these credentials with the faculty member. The password should be changed on first login.
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
      {detailsModal.isOpen && detailsModal.faculty && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="modal" style={{ width: '800px', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#0284c7" /> Faculty Details
              </h3>
              <button className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setDetailsModal({ isOpen: false, faculty: null, tempPassword: null })}>
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
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.faculty.name}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Department</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.faculty.department}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Phone</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{detailsModal.faculty.phone_number || 'N/A'}</span>
                  
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Status</span>
                  <span><span className={`status-badge ${detailsModal.faculty.status?.toLowerCase()}`} style={{ padding: '6px 12px', borderRadius: '12px' }}>{detailsModal.faculty.status}</span></span>
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
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{detailsModal.faculty.username || 'N/A'}</span>
                      <button onClick={() => copyToClipboard(detailsModal.faculty.username)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} title="Copy Username" className="hover-bg-slate-100">
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
                        <button onClick={() => fetchCurrentPassword(detailsModal.faculty.username)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} title={showCurrentPassword ? 'Hide Password' : 'Show Password'} disabled={isFetchingPassword} className="hover-bg-slate-100">
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
                    onClick={() => handleResetPassword(detailsModal.faculty.username)}
                    disabled={isResetting || !detailsModal.faculty.username}
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
              <button className="btn btn-primary" onClick={() => setDetailsModal({ isOpen: false, faculty: null, tempPassword: null })} style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyManagement;
