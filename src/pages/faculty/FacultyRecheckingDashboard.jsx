import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import '../rechecking/Rechecking.css';

function FacultyRecheckingDashboard() {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulating fetching only assigned requests for this faculty.
      // We fetch all and filter client-side for demo, or rely on a backend update.
      const resultsRes = await fetchWithHandling(`http://localhost:5000/api/rechecking?status=Assigned,Revision Requested`);
      
      // In a real app with auth, the backend would filter by evaluator_id
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
  }, []);

  if (loading && requests.length === 0 && !error) {
    return (
      <div className="rechecking-dashboard-container">
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
        <h2>Assigned Rechecking Requests</h2>
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
                  No rechecking requests assigned to you.
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
                    <span className={`status-badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {new Date(req.requested_on).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small btn-primary" onClick={() => navigate(`/faculty/rechecking/workspace/${req.id}`)}>
                        Evaluate
                      </button>
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
