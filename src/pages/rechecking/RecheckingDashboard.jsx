import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import AssignFacultyModal from './components/AssignFacultyModal';
import './Rechecking.css';

function RecheckingDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    assignedRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0
  });
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  
  const [filters, setFilters] = useState({
    academic_year: '',
    exam_type: '',
    program: '',
    course: '',
    semester: '',
    status: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await fetchWithHandling('http://localhost:5000/api/rechecking/dashboard-stats');
      setStats(statsRes);
      
      const queryParams = new URLSearchParams(filters);
      const queryString = queryParams.toString();
      const resultsRes = await fetchWithHandling(`http://localhost:5000/api/rechecking?${queryString}`);
      setRequests(resultsRes);
      
    } catch (err) {
      console.error('Error fetching rechecking data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openAssignModal = (id) => {
    setSelectedRequestId(id);
    setAssignModalOpen(true);
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    
    try {
      await fetchWithHandling(`http://localhost:5000/api/rechecking/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading && requests.length === 0 && !error) {
    return (
      <div className="rechecking-dashboard-container">
        <SkeletonLoader lines={2} height="40px" />
        <SkeletonLoader lines={1} height="120px" />
        <SkeletonLoader lines={5} height="60px" />
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="rechecking-dashboard-container">
        <APIError error={error} onRetry={fetchData} resourceName="Rechecking Data" />
      </div>
    );
  }

  return (
    <div className="rechecking-dashboard-container">
      <div className="rechecking-header">
        <h2>Rechecking Requests</h2>
        <Link to="/admin/rechecking/create" className="generate-btn">
          <span>+</span> Create Request
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <div className="stat-value">{stats.pendingRequests}</div>
        </div>
        <div className="stat-card">
          <h3>Assigned</h3>
          <div className="stat-value">{stats.assignedRequests}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{stats.completedRequests}</div>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <div className="stat-value">{stats.rejectedRequests}</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Academic Year</label>
            <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="2023-24">2023-24</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Examination</label>
            <select name="exam_type" value={filters.exam_type} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Mid Semester">Mid Semester</option>
              <option value="End Semester">End Semester</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Programme</label>
            <select name="program" value={filters.program} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Computer Science Engineering (CSE)">Computer Science Engineering (CSE)</option>
              <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
              <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Course</label>
            <select name="course" value={filters.course} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="BCA">BCA</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="results-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Details</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No rechecking requests found matching the filters.
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id}>
                  <td>REQ-{req.id.toString().padStart(4, '0')}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{req.student_name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Roll: {req.roll_number} | Code: {req.candidate_code || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{req.paper_title}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {req.program} - Sem {req.semester}
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${req.priority.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                    {req.status === 'Assigned' && req.evaluator_name && (
                      <div style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>
                        To: {req.evaluator_name}
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(req.requested_on).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {req.status === 'Pending' && (
                        <>
                          <button className="btn-small btn-outline" onClick={() => openAssignModal(req.id)}>
                            Assign
                          </button>
                          <button className="btn-small" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleUpdateStatus(req.id, 'Rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      
                      {req.status === 'Assigned' && (
                        <button className="btn-small btn-primary" onClick={() => navigate(`/admin/rechecking/workspace/${req.id}`)}>
                          Evaluate
                        </button>
                      )}

                      {req.status === 'Completed' && (
                        <button className="btn-small btn-outline" onClick={() => navigate(`/admin/rechecking/workspace/${req.id}`)}>
                          View
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

      {assignModalOpen && (
        <AssignFacultyModal 
          requestId={selectedRequestId} 
          onClose={() => setAssignModalOpen(false)}
          onAssignSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default RecheckingDashboard;
