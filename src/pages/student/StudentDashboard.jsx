import React from 'react';
import '../AdminDashboard.css'; // Reusing dashboard styles

function StudentDashboard() {
  return (
    <div className="dashboard-container">
      <div className="welcome-section" style={{ marginBottom: '30px' }}>
        <h2>Welcome back, Student Name!</h2>
        <p>Here's an overview of your academic progress.</p>
        
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '40px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll Number</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>CS24001</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programme</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>B.Tech Computer Science</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>III</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Registered Subjects</h3>
          <div className="stat-value">6</div>
          <div className="stat-desc">Current Semester</div>
        </div>
        <div className="stat-card">
          <h3>Published Results</h3>
          <div className="stat-value">4</div>
          <div className="stat-desc">For current semester</div>
        </div>
        <div className="stat-card">
          <h3>Pending Rechecking</h3>
          <div className="stat-value">1</div>
          <div className="stat-desc">Awaiting finalization</div>
        </div>
        <div className="stat-card">
          <h3>Notifications</h3>
          <div className="stat-value">3</div>
          <div className="stat-desc">Unread messages</div>
        </div>
      </div>

      <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        
        {/* Recent Results Section */}
        <div className="dashboard-section" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Recent Results</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', color: '#334155' }}>Data Structures</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Published on Oct 12, 2026</span>
              </div>
              <div style={{ fontWeight: 'bold', color: '#10b981' }}>Grade: A</div>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', color: '#334155' }}>Database Systems</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Published on Oct 10, 2026</span>
              </div>
              <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>Grade: B+</div>
            </li>
            <li style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', color: '#334155' }}>Computer Networks</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Published on Oct 08, 2026</span>
              </div>
              <div style={{ fontWeight: 'bold', color: '#10b981' }}>Grade: A-</div>
            </li>
          </ul>
        </div>

        {/* Recent Notifications Section */}
        <div className="dashboard-section" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Recent Notifications</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                <strong style={{ color: '#334155' }}>Rechecking Update</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0 0 18px' }}>Your rechecking request for Database Systems has been assigned to a faculty.</p>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                <strong style={{ color: '#334155' }}>New Result Published</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0 0 18px' }}>The result for Data Structures has been published.</p>
            </li>
            <li style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></span>
                <strong style={{ color: '#334155' }}>Exam Registration</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0 0 18px' }}>Exam registration for Semester IV is now open.</p>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
