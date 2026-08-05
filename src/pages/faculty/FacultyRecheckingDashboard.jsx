import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import '../rechecking/Rechecking.css';

function FacultyRecheckingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0
  });

  const [filters, setFilters] = useState({
    academic_year: '',
    exam_type: '',
    semester: '',
    status: '',
    search: ''
  });

  const [displayedRequests, setDisplayedRequests] = useState([]);
  const [activeCardFilter, setActiveCardFilter] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const facultyId = user?.faculty_id || user?.id;
      if (!facultyId) throw new Error("No faculty profile found in session");
      
      const queryParams = new URLSearchParams();
      if (filters.academic_year) queryParams.append('academic_year', filters.academic_year);
      if (filters.exam_type) queryParams.append('exam_type', filters.exam_type);
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.status) queryParams.append('status', filters.status);
      
      // Fetch requests assigned ONLY to this faculty
      const resultsRes = await fetchWithHandling(`http://localhost:5000/api/rechecking?evaluator_id=${facultyId}&${queryParams.toString()}`);
      
      setRequests(resultsRes);
      
      // To calculate stats accurately, we should check ALL their assigned requests without current filters
      const allRes = await fetchWithHandling(`http://localhost:5000/api/rechecking?evaluator_id=${facultyId}`);
      
      const assigned = allRes.filter(r => r.status === 'Assigned').length;
      const inProgress = allRes.filter(r => ['Under Evaluation', 'Revision Requested'].includes(r.status)).length;
      const completed = allRes.filter(r => ['Completed', 'Pending Finalization'].includes(r.status)).length;
      
      setStats({ assigned, inProgress, completed });
      
    } catch (err) {
      console.error('Error fetching rechecking data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.academic_year, filters.exam_type, filters.semester, filters.status]);

  // Client-side search and card filter implementation
  useEffect(() => {
    let filtered = requests;

    // Apply card filter
    if (activeCardFilter === 'Assigned') {
      filtered = filtered.filter(req => req.status === 'Assigned');
    } else if (activeCardFilter === 'In Progress') {
      filtered = filtered.filter(req => ['Under Evaluation', 'Revision Requested'].includes(req.status));
    } else if (activeCardFilter === 'Completed') {
      filtered = filtered.filter(req => ['Completed', 'Pending Finalization'].includes(req.status));
    }

    // Apply text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        (req.student_name && req.student_name.toLowerCase().includes(searchLower)) ||
        (req.roll_number && req.roll_number.toLowerCase().includes(searchLower)) ||
        (req.paper_title && req.paper_title.toLowerCase().includes(searchLower))
      );
    }
    
    setDisplayedRequests(filtered);
  }, [filters.search, requests, activeCardFilter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'assigned') return 'assigned';
    if (s === 'completed') return 'completed';
    if (s === 'under evaluation' || s === 'revision requested') return 'pending';
    return s.replace(' ', '-');
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
        <h2>My Rechecking Requests</h2>
      </div>

      <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div 
          className="stat-card" 
          onClick={() => setActiveCardFilter(activeCardFilter === 'Assigned' ? null : 'Assigned')}
          style={{ 
            flex: '1 1 220px', 
            minWidth: 0, 
            borderLeft: '4px solid #3b82f6',
            cursor: 'pointer',
            backgroundColor: activeCardFilter === 'Assigned' ? '#eff6ff' : 'white',
            boxShadow: activeCardFilter === 'Assigned' ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
            transform: activeCardFilter === 'Assigned' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease-in-out'
          }}>
          <h3>Assigned Requests</h3>
          <div className="stat-value">{stats.assigned}</div>
        </div>
        <div 
          className="stat-card" 
          onClick={() => setActiveCardFilter(activeCardFilter === 'In Progress' ? null : 'In Progress')}
          style={{ 
            flex: '1 1 220px', 
            minWidth: 0, 
            borderLeft: '4px solid #f59e0b',
            cursor: 'pointer',
            backgroundColor: activeCardFilter === 'In Progress' ? '#fef3c7' : 'white',
            boxShadow: activeCardFilter === 'In Progress' ? '0 4px 12px rgba(245, 158, 11, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
            transform: activeCardFilter === 'In Progress' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease-in-out'
          }}>
          <h3>In Progress</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div 
          className="stat-card" 
          onClick={() => setActiveCardFilter(activeCardFilter === 'Completed' ? null : 'Completed')}
          style={{ 
            flex: '1 1 220px', 
            minWidth: 0, 
            borderLeft: '4px solid #10b981',
            cursor: 'pointer',
            backgroundColor: activeCardFilter === 'Completed' ? '#ecfdf5' : 'white',
            boxShadow: activeCardFilter === 'Completed' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
            transform: activeCardFilter === 'Completed' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease-in-out'
          }}>
          <h3>Completed</h3>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input 
              type="text" 
              name="search"
              placeholder="Search Name, Roll No, or Subject..." 
              value={filters.search}
              onChange={handleFilterChange}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="filter-group">
            <label>Academic Year</label>
            <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange} style={{ width: '100%', boxSizing: 'border-box' }}>
              <option value="">All</option>
              <option value="2023-24">2023-24</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Examination</label>
            <select name="exam_type" value={filters.exam_type} onChange={handleFilterChange} style={{ width: '100%', boxSizing: 'border-box' }}>
              <option value="">All</option>
              <option value="Mid Semester">Mid Semester</option>
              <option value="End Semester">End Semester</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange} style={{ width: '100%', boxSizing: 'border-box' }}>
              <option value="">All</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: '100%', boxSizing: 'border-box' }}>
              <option value="">All</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Evaluation">Under Evaluation</option>
              <option value="Revision Requested">Revision Requested</option>
              <option value="Pending Finalization">Pending Finalization</option>
              <option value="Completed">Completed</option>
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
            {displayedRequests.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '1.2rem' }}>No Requests Found</h3>
                    <p style={{ margin: 0 }}>You currently have no rechecking requests matching these filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedRequests.map(req => (
                <tr key={req.id}>
                  <td>REQ-{req.id.toString().padStart(4, '0')}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{req.student_name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Roll: {req.roll_number} | Code: {req.roll_no || 'N/A'}
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
                    <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {new Date(req.requested_on).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {req.status === 'Assigned' && (
                        <button className="btn-small btn-primary" onClick={() => navigate(`/faculty/rechecking/workspace/${req.id}`)}>
                          Start Evaluation
                        </button>
                      )}
                      
                      {['Under Evaluation', 'Revision Requested'].includes(req.status) && (
                        <button className="btn-small" style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }} onClick={() => navigate(`/faculty/rechecking/workspace/${req.id}`)}>
                          Continue Evaluation
                        </button>
                      )}

                      {['Completed', 'Pending Finalization'].includes(req.status) && (
                        <button className="btn-small btn-outline" onClick={() => navigate(`/faculty/rechecking/workspace/${req.id}`)}>
                          View Evaluation
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
  );
}

export default FacultyRecheckingDashboard;
