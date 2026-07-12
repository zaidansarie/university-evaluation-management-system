import React from 'react';
import '../AdminDashboard.css';

function StudentNotifications() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Notifications</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Stay updated with university announcements and alerts.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Notifications system will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentNotifications;
