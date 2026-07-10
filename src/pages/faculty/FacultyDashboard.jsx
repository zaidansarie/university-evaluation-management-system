import React from 'react';
import '../AdminDashboard.css'; // Reuse existing styles

function FacultyDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 style={{ fontSize: '24px', margin: 0 }}>Faculty Dashboard</h2>
      </div>
      <div className="dashboard-content" style={{ marginTop: '20px' }}>
        <p>Welcome to the Faculty Portal. Here you can view your assigned evaluations and rechecking requests.</p>
        <p>Please select a module from the sidebar to begin.</p>
      </div>
    </div>
  );
}

export default FacultyDashboard;
