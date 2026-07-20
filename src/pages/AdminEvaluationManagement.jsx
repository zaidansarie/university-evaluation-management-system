import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '../hooks/useApiData';
import ReassignEvaluationsModal from './evaluations/components/ReassignEvaluationsModal';
import './AdminDashboard.css';

function AdminEvaluationManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const { data: rawStats = {}, refetch: refetchStats } = useApiData('/api/admin/evaluations/statistics');
  const { data: facultyProgress = [], refetch: refetchProgress } = useApiData('/api/admin/evaluations/faculty-progress', []);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignFaculty, setReassignFaculty] = useState(null);

  const stats = {
    totalAssignments: rawStats.totalAssignments || 0,
    pending: rawStats.pending || 0,
    inProgress: rawStats.inProgress || 0,
    completed: rawStats.completed || 0
  };

  const filteredData = facultyProgress.filter(f => {
    if (activeTab !== 'All' && f.status !== activeTab) return false;
    if (departmentFilter !== 'All' && f.department !== departmentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.id.toString().includes(q)) return false;
    }
    return true;
  });

  const handleAssignSuccess = () => {
    refetchStats(true);
    refetchProgress(true);
  };

  const handleReassign = (faculty) => {
    setReassignFaculty(faculty);
    setShowReassignModal(true);
  };

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Evaluation Management</h2>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Assignments</h3>
          <p className="card-value">{stats.totalAssignments}</p>
        </div>
        <div className="card">
          <h3>Pending Evaluations</h3>
          <p className="card-value">{stats.pending}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p className="card-value highlight-yellow">{stats.inProgress}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p className="card-value highlight-green">{stats.completed}</p>
        </div>
      </div>

      <div className="dashboard-content" style={{ marginTop: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Faculty Evaluation Status</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '250px' }}
            />
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            >
              <option value="All">All Departments</option>
              {[...new Set(facultyProgress.map(f => f.department))].filter(Boolean).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            >
              <option value="All">All Status</option>
              <option value="No Assignments">No Assignments</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button className="as-btn" onClick={() => { refetchStats(true); refetchProgress(true); }}>Refresh</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Department</th>
                <th>Assigned</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Progress</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No faculty evaluation records found.</td>
                </tr>
              ) : (
                filteredData.map(faculty => (
                  <tr key={faculty.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: '#334155' }}>{faculty.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{faculty.id}</div>
                    </td>
                    <td>{faculty.department}</td>
                    <td>{faculty.assignedPapers}</td>
                    <td style={{ color: '#10b981', fontWeight: '500' }}>{faculty.completed}</td>
                    <td style={{ color: '#f59e0b', fontWeight: '500' }}>{faculty.pending}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${faculty.progress}%`, height: '100%', backgroundColor: faculty.progress === 100 ? '#10b981' : '#3b82f6' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '500', width: '35px' }}>{faculty.progress}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {faculty.lastActivity ? new Date(faculty.lastActivity).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Not started'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }} 
                          title="View Workload"
                          onClick={() => navigate(`/admin/evaluation/faculty/${faculty.id}`)}
                        >
                          View
                        </button>
                        {faculty.assignedPapers > 0 && faculty.progress < 100 && (
                          <button 
                            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }} 
                            title="Reassign"
                            onClick={() => handleReassign(faculty)}
                          >
                            Reassign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reassignFaculty && (
        <ReassignEvaluationsModal 
          isOpen={showReassignModal} 
          onClose={() => setShowReassignModal(false)} 
          onAssignSuccess={handleAssignSuccess}
          currentFacultyId={reassignFaculty.id}
          currentFacultyName={reassignFaculty.name}
        />
      )}
    </div>
  );
}

export default AdminEvaluationManagement;
