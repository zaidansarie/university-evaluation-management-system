import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './EvaluationDashboard.css';

function EvaluationDashboard() {
  const navigate = useNavigate();
  const { data: assignments = [], loading, error, refetch } = useApiData('/api/evaluations/assigned?faculty_id=1');
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' | 'newest'
  const [isStartingSession, setIsStartingSession] = useState(false);

  const stats = useMemo(() => {
    let pending = 0;
    let draft = 0;
    let completed = 0;
    
    assignments.forEach(a => {
      // Determine effective status based on session if available, else assignment status
      const effStatus = a.session_status || 'Assigned';
      
      if (effStatus === 'Assigned') pending++;
      else if (effStatus === 'Draft' || effStatus === 'In Progress') draft++;
      else if (effStatus === 'Submitted' || effStatus === 'Locked') completed++;
    });
    
    return { pending, draft, completed };
  }, [assignments]);

  const filteredAndSortedAssignments = useMemo(() => {
    let result = assignments.filter(a => {
      const effStatus = a.session_status || 'Assigned';
      
      // Tab filter
      if (activeTab === 'Pending' && effStatus !== 'Assigned') return false;
      if (activeTab === 'Drafts' && (effStatus !== 'Draft' && effStatus !== 'In Progress')) return false;
      if (activeTab === 'Completed' && (effStatus !== 'Submitted' && effStatus !== 'Locked')) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (a.candidate_code && a.candidate_code.toLowerCase().includes(query));
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.assigned_date).getTime();
      const dateB = new Date(b.assigned_date).getTime();
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [assignments, activeTab, searchQuery, sortOrder]);

  const handleStartEvaluation = async (answerSheetId, existingSessionId) => {
    if (existingSessionId) {
      navigate(`/admin/evaluation/session/${existingSessionId}`);
      return;
    }

    try {
      setIsStartingSession(true);
      const res = await fetchWithHandling(`http://localhost:5000/api/evaluations/start/${answerSheetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty_id: 1 })
      });
      navigate(`/admin/evaluation/session/${res.sessionId}`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to start evaluation session.');
      setIsStartingSession(false);
    }
  };

  return (
    <div className="eval-dashboard-container">
      <div className="dashboard-header">
        <h1>Evaluation Dashboard</h1>
        <p className="subtitle">Manage and evaluate your assigned answer sheets.</p>
      </div>

      <div className="summary-cards">
        <div className={`card ${activeTab === 'Pending' ? 'active-card' : ''}`} onClick={() => setActiveTab('Pending')}>
          <h3>Pending</h3>
          <p className="card-value">{stats.pending}</p>
        </div>
        <div className={`card ${activeTab === 'Drafts' ? 'active-card' : ''}`} onClick={() => setActiveTab('Drafts')}>
          <h3>Draft / In Progress</h3>
          <p className="card-value highlight-yellow">{stats.draft}</p>
        </div>
        <div className={`card ${activeTab === 'Completed' ? 'active-card' : ''}`} onClick={() => setActiveTab('Completed')}>
          <h3>Completed</h3>
          <p className="card-value highlight-green">{stats.completed}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="eval-toolbar">
          <div className="eval-tabs">
            <button className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
              My Assignments ({stats.pending})
            </button>
            <button className={`tab-btn ${activeTab === 'Drafts' ? 'active' : ''}`} onClick={() => setActiveTab('Drafts')}>
              Drafts ({stats.draft})
            </button>
            <button className={`tab-btn ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>
              Completed ({stats.completed})
            </button>
          </div>

          <div className="eval-filters">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search Candidate Code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
            </select>
            <button className="as-btn" onClick={() => refetch(true)}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={6} height="50px" />
          </div>
        ) : error ? (
          <APIError error={error} onRetry={() => refetch(true)} resourceName="Evaluations" />
        ) : (
          <div className="table-responsive">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Assigned Date</th>
                  <th>Candidate Code</th>
                  <th>Paper Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                      No assignments found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedAssignments.map(assignment => (
                    <tr key={assignment.assignment_id}>
                      <td>
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                        <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                          {new Date(assignment.assigned_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td><strong>{assignment.candidate_code || 'Hidden'}</strong></td>
                      <td>
                        <div>{assignment.paper_title}</div>
                        <div className="badge" style={{marginTop: '4px'}}>{assignment.subject_name} ({assignment.course_name})</div>
                      </td>
                      <td>
                        <span className={`status-badge ${(assignment.session_status || 'Assigned').replace(' ', '').toLowerCase()}`}>
                          {assignment.session_status || 'Assigned'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="as-btn" 
                          onClick={() => handleStartEvaluation(assignment.answer_sheet_id, assignment.session_id)}
                          disabled={isStartingSession || assignment.session_status === 'Locked' || assignment.session_status === 'Submitted'}
                          style={{
                            backgroundColor: (assignment.session_status === 'Draft' || assignment.session_status === 'In Progress') ? '#eab308' : ''
                          }}
                        >
                          {assignment.session_status === 'Submitted' || assignment.session_status === 'Locked' 
                            ? 'View Evaluation' 
                            : (assignment.session_status === 'Draft' || assignment.session_status === 'In Progress' 
                                ? 'Resume Evaluation' 
                                : 'Start Evaluation')}
                        </button>
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

export default EvaluationDashboard;
