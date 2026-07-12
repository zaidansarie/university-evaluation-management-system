import React from 'react';
import '../AdminDashboard.css';

function StudentSubjects() {
  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Subjects</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        View the subjects you are registered for in the current semester.
      </p>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Subject list will be implemented here soon.
      </div>
    </div>
  );
}

export default StudentSubjects;
