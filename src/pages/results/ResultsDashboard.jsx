import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './Results.css';

function ResultsDashboard() {
  const [stats, setStats] = useState({
    pendingPublications: 0,
    publishedResults: 0,
    totalStudents: 0,
    totalSubjectsEvaluated: 0
  });
  
  const [resultSets, setResultSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    academic_year: '',
    exam_type: '',
    program: '',
    course: '',
    semester: '',
    section: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats
      const statsRes = await fetchWithHandling('http://localhost:5000/api/results/dashboard-stats');
      setStats(statsRes);
      
      // Fetch result sets based on filters
      const queryParams = new URLSearchParams(filters);
      const queryString = queryParams.toString();
      const resultsRes = await fetchWithHandling(`http://localhost:5000/api/results?${queryString}`);
      setResultSets(resultsRes);
      
    } catch (err) {
      console.error('Error fetching results data:', err);
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

  const handlePublish = async (id) => {
    if (!window.confirm('Are you sure you want to publish these results? This action cannot be undone.')) return;
    
    try {
      await fetchWithHandling(`http://localhost:5000/api/results/${id}/publish`, {
        method: 'PUT'
      });
      fetchData();
    } catch (err) {
      console.error('Error publishing results:', err);
      alert(err.message || 'Failed to publish results');
    }
  };

  if (loading && resultSets.length === 0 && !error) {
    return (
      <div className="results-dashboard-container">
        <SkeletonLoader lines={2} height="40px" />
        <SkeletonLoader lines={1} height="120px" />
        <SkeletonLoader lines={5} height="60px" />
      </div>
    );
  }

  if (error && resultSets.length === 0) {
    return (
      <div className="results-dashboard-container">
        <APIError error={error} onRetry={fetchData} resourceName="Results Data" />
      </div>
    );
  }

  return (
    <div className="results-dashboard-container">
      <div className="results-header">
        <h2>Results Dashboard</h2>
        <Link to="/admin/results/generate" className="generate-btn">
          <span>+</span> Generate Results
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Publications</h3>
          <div className="stat-value">{stats.pendingPublications}</div>
        </div>
        <div className="stat-card">
          <h3>Published Results</h3>
          <div className="stat-value">{stats.publishedResults}</div>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <h3>Subjects Evaluated</h3>
          <div className="stat-value">{stats.totalSubjectsEvaluated}</div>
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
            <label>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Batch Details</th>
              <th>Semester</th>
              <th>Students</th>
              <th>Status</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resultSets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No result sets found matching the filters.
                </td>
              </tr>
            ) : (
              resultSets.map(set => (
                <tr key={set.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{set.program} - {set.course}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {set.exam_type} ({set.academic_year}) {set.section ? `Sec: ${set.section}` : ''}
                    </div>
                  </td>
                  <td>Sem {set.semester}</td>
                  <td>{set.total_students}</td>
                  <td>
                    <span className={`status-badge ${set.status.toLowerCase()}`}>
                      {set.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      Gen: {new Date(set.generated_at).toLocaleDateString()}
                    </div>
                    {set.published_at && (
                      <div style={{ fontSize: '13px', color: '#166534' }}>
                        Pub: {new Date(set.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small btn-outline" onClick={() => alert('View Student Results functionality coming in next phase.')}>
                        View
                      </button>
                      {set.status !== 'Published' && (
                        <button 
                          className="btn-small btn-success"
                          onClick={() => handlePublish(set.id)}
                        >
                          Publish
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

export default ResultsDashboard;
