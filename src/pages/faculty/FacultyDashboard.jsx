import React from 'react';
import '../AdminDashboard.css'; // Reuse existing styles

function FacultyDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 style={{ fontSize: '24px', margin: 0 }}>Faculty Dashboard</h2>
      </div>
      <div className="dashboard-content" style={{ marginTop: '20px' }}>
        
        {/* 1. Evaluation Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Papers Assigned</h3>
            <p className="card-value">124</p>
          </div>
          <div className="card">
            <h3>Pending Evaluations</h3>
            <p className="card-value highlight-red">38</p>
          </div>
          <div className="card">
            <h3>Draft / In Progress</h3>
            <p className="card-value" style={{color: '#f59e0b'}}>12</p>
          </div>
          <div className="card">
            <h3>Completed Evaluations</h3>
            <p className="card-value" style={{color: '#10b981'}}>74</p>
          </div>
        </div>

        {/* 2. Performance Summary */}
        <div className="summary-cards" style={{marginTop: '20px'}}>
          <div className="card">
            <h3>Average Evaluation Time</h3>
            <p className="card-value" style={{fontSize: '1.4rem'}}>14 mins / paper</p>
          </div>
          <div className="card">
            <h3>Nearest Deadline</h3>
            <p className="card-value" style={{fontSize: '1.4rem', color: '#dc3545'}}>Tomorrow</p>
          </div>
          <div className="card">
            <h3>Subjects Assigned</h3>
            <p className="card-value" style={{fontSize: '1.4rem'}}>3</p>
          </div>
        </div>

        <div style={{marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px'}}>
          
          {/* 3. Workload by Subject */}
          <div className="recent-activities">
            <h2>Workload by Subject</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span style={{fontWeight: '500'}}>DBMS</span>
                  <span style={{color: '#6c757d', fontSize: '0.9rem'}}>18 Papers</span>
                </div>
                <div style={{width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px'}}>
                  <div style={{width: '45%', backgroundColor: '#3b82f6', height: '100%', borderRadius: '4px'}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span style={{fontWeight: '500'}}>AIML</span>
                  <span style={{color: '#6c757d', fontSize: '0.9rem'}}>12 Papers</span>
                </div>
                <div style={{width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px'}}>
                  <div style={{width: '30%', backgroundColor: '#10b981', height: '100%', borderRadius: '4px'}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span style={{fontWeight: '500'}}>Operating Systems</span>
                  <span style={{color: '#6c757d', fontSize: '0.9rem'}}>9 Papers</span>
                </div>
                <div style={{width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px'}}>
                  <div style={{width: '25%', backgroundColor: '#f59e0b', height: '100%', borderRadius: '4px'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Recent Activity */}
          <div className="recent-activities">
            <h2>Recent Activity</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px'}}>
                <span style={{fontSize: '0.95rem'}}>Submitted DBMS evaluation for Candidate CSE24035</span>
                <span style={{color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '10px'}}>10 mins ago</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px'}}>
                <span style={{fontSize: '0.95rem'}}>Saved AIML evaluation as Draft</span>
                <span style={{color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '10px'}}>1 hour ago</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px'}}>
                <span style={{fontSize: '0.95rem'}}>Completed Operating Systems evaluation</span>
                <span style={{color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '10px'}}>2 hours ago</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontSize: '0.95rem'}}>Reviewed a Rechecking Request</span>
                <span style={{color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '10px'}}>Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Upcoming Deadlines */}
        <div className="recent-activities" style={{marginTop: '30px'}}>
          <h2>Upcoming Deadlines</h2>
          <div className="table-responsive">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Papers Remaining</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DBMS</td>
                  <td>5</td>
                  <td>Tomorrow</td>
                  <td><span style={{color: '#dc3545', fontWeight: '600', backgroundColor: '#ffe5e5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>High</span></td>
                </tr>
                <tr>
                  <td>AIML</td>
                  <td>7</td>
                  <td>2 Days</td>
                  <td><span style={{color: '#f59e0b', fontWeight: '600', backgroundColor: '#fff4cc', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>Medium</span></td>
                </tr>
                <tr>
                  <td>Operating Systems</td>
                  <td>2</td>
                  <td>4 Days</td>
                  <td><span style={{color: '#10b981', fontWeight: '600', backgroundColor: '#e6fff2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>Low</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FacultyDashboard;
