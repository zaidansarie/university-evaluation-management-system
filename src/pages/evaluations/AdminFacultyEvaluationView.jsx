import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import '../AdminDashboard.css';

function AdminFacultyEvaluationView() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const { data: assignments = [], loading, error, refetch } = useApiData(`/api/evaluations/assigned?faculty_id=${facultyId}`, [facultyId]);
  const { data: facultyList = [] } = useApiData('/api/faculty', []);

  const faculty = facultyList.find(f => f.id.toString() === facultyId) || {};

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button className="as-btn" onClick={() => navigate('/admin/evaluation')} style={{ marginBottom: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
          &larr; Back to Evaluation Management
        </button>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Faculty Evaluation Workload: {faculty.name || 'Loading...'}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{faculty.department || ''}</p>
        </div>
      </div>

      <div className="dashboard-content" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Assigned Answer Sheets ({assignments.length})</h3>
          <button className="as-btn" onClick={() => refetch(true)}>Refresh</button>
        </div>

        {loading ? (
          <SkeletonLoader lines={5} height="40px" />
        ) : error ? (
          <APIError error={error} onRetry={() => refetch(true)} resourceName="Assignments" />
        ) : (
          <div className="table-responsive">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Assigned Date</th>
                  <th>Candidate Code</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Last Saved</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                      No assignments found for this faculty member.
                    </td>
                  </tr>
                ) : (
                  assignments.map(assignment => (
                    <tr key={assignment.assignment_id}>
                      <td>
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                        <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                          {new Date(assignment.assigned_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td><strong>{assignment.candidate_code || 'Unknown'}</strong></td>
                      <td>
                        <div>{assignment.subject_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{assignment.course_name}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${(assignment.session_status || 'Assigned').replace(' ', '').toLowerCase()}`}>
                          {assignment.session_status || 'Assigned'}
                        </span>
                      </td>
                      <td>
                        {assignment.last_saved_at ? (
                          <>
                            {new Date(assignment.last_saved_at).toLocaleDateString()}
                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                              {new Date(assignment.last_saved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </>
                        ) : <span style={{ color: '#94a3b8' }}>Never</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFacultyEvaluationView;
