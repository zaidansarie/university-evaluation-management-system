import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    phone_number: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  
  // Since authentication is not implemented, we use the first student as the demo student (ID 1)
  const studentId = 1;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
      setEditForm({
        phone_number: data.phone_number || '',
        address: data.address || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editForm.phone_number) {
      errors.phone_number = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(editForm.phone_number)) {
      errors.phone_number = 'Mobile Number must be exactly 10 digits';
    }

    if (!editForm.address || !editForm.address.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaveStatus('Saving...');
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      setProfile({
        ...profile,
        phone_number: editForm.phone_number,
        address: editForm.address
      });
      
      setIsEditing(false);
      setSaveStatus('Profile updated successfully.');
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditForm({
      phone_number: profile.phone_number || '',
      address: profile.address || ''
    });
    setFormErrors({});
    setIsEditing(false);
    setSaveStatus('');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="admin-header-inline">
          <h2>My Profile</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="admin-header-inline">
          <h2>My Profile</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Profile</h2>
        {!isEditing && (
          <button 
            className="btn-primary" 
            onClick={() => setIsEditing(true)}
            style={{ padding: '8px 16px' }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {saveStatus && (
        <div style={{ 
          padding: '12px 20px', 
          marginBottom: '20px', 
          backgroundColor: saveStatus.startsWith('Error') ? '#fee2e2' : '#dcfce7', 
          color: saveStatus.startsWith('Error') ? '#dc2626' : '#16a34a',
          borderRadius: '6px',
          border: `1px solid ${saveStatus.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`
        }}>
          {saveStatus}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(300px, 350px) 1fr', 
        gap: '24px', 
        alignItems: 'start' 
      }}>
        
        {/* Left Side: Profile Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100px', 
            backgroundColor: '#3b82f6',
            backgroundImage: 'linear-gradient(to right, #3b82f6, #2dd4bf)'
          }}></div>
          
          <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-50px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#3b82f6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {profile.name.charAt(0)}
            </div>
            
            <h3 style={{ margin: '16px 0 4px 0', color: '#0f172a', fontSize: '20px' }}>{profile.name}</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>{profile.roll_number}</p>
            
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {profile.status === 'Active' ? 'Active Student' : profile.status}
            </span>

            <div style={{ width: '100%', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Programme</span>
                <span style={{ color: '#334155', fontWeight: '500', fontSize: '13px' }}>{profile.program || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Course</span>
                <span style={{ color: '#334155', fontWeight: '500', fontSize: '13px' }}>{profile.course || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Semester</span>
                <span style={{ color: '#334155', fontWeight: '500', fontSize: '13px' }}>{profile.semester ? `Semester ${profile.semester}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Information Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personal Information */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Personal Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Full Name</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.email}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Mobile Number</label>
                {isEditing ? (
                  <div>
                    <input 
                      type="text" 
                      value={editForm.phone_number} 
                      onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: `1px solid ${formErrors.phone_number ? '#ef4444' : '#cbd5e1'}`,
                        fontSize: '14px'
                      }}
                    />
                    {formErrors.phone_number && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.phone_number}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.phone_number || '-'}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                  {profile.dob ? new Date(profile.dob).toLocaleDateString() : '-'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Gender</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.gender || '-'}</div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px' }}>Academic Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Roll Number</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.roll_number}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Enrollment Number / Candidate Code</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                  {profile.enrollment_number || profile.candidate_code || '-'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Programme</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.program || '-'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Course / Branch</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.course || '-'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Semester</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.semester || '-'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admission Year</label>
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{profile.admission_year || '-'}</div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px' }}>Address Information</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Residential Address</label>
              {isEditing ? (
                <div>
                  <textarea 
                    value={editForm.address} 
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    rows="3"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      border: `1px solid ${formErrors.address ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  {formErrors.address && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.address}</div>}
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500', lineHeight: '1.5' }}>
                  {profile.address || 'No address provided.'}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons for Edit Mode */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
      
      {/* Responsive styles injected via a style tag for mobile support */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-container > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .dashboard-container > div:nth-child(3) > div:nth-child(2) > div > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
          .dashboard-container > div:nth-child(3) > div:nth-child(2) > div > div > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentProfile;
