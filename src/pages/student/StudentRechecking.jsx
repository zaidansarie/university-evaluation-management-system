import React from 'react';
import '../AdminDashboard.css';

function StudentRechecking() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Rechecking Requests</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Track your rechecking and re-evaluation requests.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Rechecking tracking will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentRechecking;
