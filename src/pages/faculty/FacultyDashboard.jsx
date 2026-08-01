import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApiData } from '../../hooks/useApiData';
import '../AdminDashboard.css'; // Reuse existing styles

function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data, loading, error } = useApiData(`/api/faculty/${user?.id}/dashboard`);
  
  const stats = data?.stats || {
    totalAssigned: 0, pending: 0, draft: 0, completed: 0, averageEvaluationTime: null, nearestDeadline: null, subjectsAssigned: 0
  };
  const workload = data?.workload || [];
  const activity = data?.activity || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 style={{ fontSize: '24px', margin: 0 }}>Faculty Dashboard</h2>
      </div>
      <div className="dashboard-content" style={{ marginTop: '20px' }}>
        <style>
          {`
            .interactive-card {
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .interactive-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .quick-action-card {
              background: white;
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: flex-start;
              gap: 15px;
            }
            .quick-action-card:hover {
              border-color: var(--primary-blue);
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              transform: translateY(-2px);
            }
            .qa-icon {
              font-size: 1.5rem;
              color: var(--primary-blue);
              background: #f0f7ff;
              padding: 10px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qa-content h3 {
              margin: 0 0 5px 0;
              font-size: 1rem;
              color: var(--text-color);
            }
            .qa-content p {
              margin: 0;
              font-size: 0.85rem;
              color: #6c757d;
              line-height: 1.4;
            }
          `}
        </style>

        {/* 1. Evaluation Summary Cards */}
        <div className="summary-cards">
          <div className="card interactive-card" onClick={() => navigate('/faculty/evaluations', { state: { tab: 'pending' } })}>
            <h3>Total Papers Assigned</h3>
            <p className="card-value">{stats.totalAssigned}</p>
          </div>
          <div className="card interactive-card" onClick={() => navigate('/faculty/evaluations', { state: { tab: 'pending' } })}>
            <h3>Pending Evaluations</h3>
            <p className="card-value highlight-red">{stats.pending}</p>
          </div>
          <div className="card interactive-card" onClick={() => navigate('/faculty/evaluations', { state: { tab: 'draft' } })}>
            <h3>Draft / In Progress</h3>
            <p className="card-value" style={{color: '#f59e0b'}}>{stats.draft}</p>
          </div>
          <div className="card interactive-card" onClick={() => navigate('/faculty/evaluations', { state: { tab: 'completed' } })}>
            <h3>Completed Evaluations</h3>
            <p className="card-value" style={{color: '#10b981'}}>{stats.completed}</p>
          </div>
        </div>
        {/* 2. Performance Summary */}
        <div className="summary-cards" style={{marginTop: '20px'}}>
          <div className="card">
            <h3>Average Evaluation Time</h3>
            <p className="card-value" style={{fontSize: '1.4rem'}}>{stats.averageEvaluationTime ? `${stats.averageEvaluationTime} mins / paper` : '--'}</p>
          </div>
          <div className="card">
            <h3>Nearest Deadline</h3>
            <p className="card-value" style={{fontSize: '1.4rem', color: stats.nearestDeadline ? '#dc3545' : '#6c757d'}}>{stats.nearestDeadline || 'No active deadlines'}</p>
          </div>
          <div className="card">
            <h3>Subjects Assigned</h3>
            <p className="card-value" style={{fontSize: '1.4rem'}}>{stats.subjectsAssigned}</p>
          </div>
        </div>

        <div style={{marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px'}}>
          
          {/* 3. Workload by Subject */}
          <div className="recent-activities">
            <h2>Workload by Subject</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {workload.length === 0 ? (
                <p style={{ color: '#6c757d', fontStyle: 'italic', margin: 0 }}>No subject assignments available.</p>
              ) : (
                workload.map((w, idx) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                  const color = colors[idx % colors.length];
                  const percentage = w.total > 0 ? (w.completed / w.total) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{fontWeight: '500'}}>{w.subject}</span>
                        <span style={{color: '#6c757d', fontSize: '0.9rem'}}>{w.total} Papers ({w.completed} done)</span>
                      </div>
                      <div style={{width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px'}}>
                        <div style={{width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Recent Activity */}
          <div className="recent-activities">
            <h2>Recent Activity</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {activity.length === 0 ? (
                <p style={{ color: '#6c757d', fontStyle: 'italic', margin: 0 }}>No recent activity.</p>
              ) : (
                activity.map((act, idx) => {
                  let text = '';
                  if (act.type === 'Assignment received') text = `Received ${act.subject} assignment for Candidate ${act.identifier}`;
                  else if (act.type === 'Draft saved') text = `Saved ${act.subject} evaluation as Draft for Candidate ${act.identifier}`;
                  else if (act.type === 'Evaluation submitted') text = `Submitted ${act.subject} evaluation for Candidate ${act.identifier}`;
                  else if (act.type === 'Rechecking completed') text = `Completed Rechecking request for Answer Sheet #${act.identifier}`;
                  
                  return (
                    <div key={idx} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px'}}>
                      <span style={{fontSize: '0.95rem'}}>{text}</span>
                      <span style={{color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '10px'}}>
                        {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })
              )}
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
                  <td colSpan="4" style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic', padding: '20px' }}>No active deadlines</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Quick Actions */}
        <div className="recent-activities" style={{marginTop: '30px'}}>
          <h2>Quick Actions</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
            
            <div className="quick-action-card" onClick={() => navigate('/faculty/evaluations')}>
              <div className="qa-icon">📋</div>
              <div className="qa-content">
                <h3>Assigned Evaluations</h3>
                <p>Evaluate assigned answer sheets.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => navigate('/faculty/rechecking')}>
              <div className="qa-icon">🔄</div>
              <div className="qa-content">
                <h3>Rechecking Requests</h3>
                <p>Review assigned rechecking requests.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => navigate('/faculty/question-bank')}>
              <div className="qa-icon">📚</div>
              <div className="qa-content">
                <h3>Question Bank</h3>
                <p>Create and manage your question bank.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => navigate('/faculty/notifications')}>
              <div className="qa-icon">🔔</div>
              <div className="qa-content">
                <h3>Notifications</h3>
                <p>View recent updates and announcements.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default FacultyDashboard;
