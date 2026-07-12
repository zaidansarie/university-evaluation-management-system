import React from 'react';
import '../AdminDashboard.css';

function StudentSettings() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Settings</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Configure your portal preferences and security settings.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Settings functionality will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentSettings;
