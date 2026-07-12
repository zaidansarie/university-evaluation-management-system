import React from 'react';
import '../AdminDashboard.css';

function StudentResults() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Results</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        View your published academic results.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Results functionality will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentResults;
