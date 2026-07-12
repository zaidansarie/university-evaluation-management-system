import React from 'react';
import '../AdminDashboard.css';

function StudentProfile() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Profile</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Manage your personal and academic profile details.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Profile management will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentProfile;
