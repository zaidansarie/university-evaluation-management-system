import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentRechecking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Search & Filter State
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecheckingRequests();
  }, []);

  const fetchRecheckingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch first student to act as logged in user (demo)
      const studentRes = await fetch('http://localhost:5000/api/students');
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const students = await studentRes.json();
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the system. Cannot load rechecking requests.');
      }
      
      const loggedInStudent = students[0]; // Hardcoded demo student

      // Fetch Rechecking requests for this student
      const requestsRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/rechecking`);
      if (!requestsRes.ok) throw new Error('Failed to fetch rechecking requests');
      const requestsData = await requestsRes.json();
      
      setRequests(requestsData);
    } catch (err) {
      console.error('Error in fetchRecheckingRequests:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fef3c7', text: '#d97706' };
      case 'Assigned': return { bg: '#e0e7ff', text: '#4f46e5' };
      case 'Under Evaluation': return { bg: '#dbeafe', text: '#2563eb' };
      case 'Pending Finalization': return { bg: '#ffedd5', text: '#ea580c' };
      case 'Revision Requested': return { bg: '#fee2e2', text: '#dc2626' };
      case 'Completed': return { bg: '#dcfce7', text: '#16a34a' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  // Compute filtering
  const filteredRequests = requests.filter(req => {
    const matchesYear = academicYearFilter === 'All' || req.academic_year === academicYearFilter;
    const matchesType = examTypeFilter === 'All' || req.examination === examTypeFilter;
    const matchesSemester = semesterFilter === 'All' || req.semester.toString() === semesterFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      (req.subject_code && req.subject_code.toLowerCase().includes(searchLower)) ||
      (req.subject_name && req.subject_name.toLowerCase().includes(searchLower));
    
    return matchesYear && matchesType && matchesSemester && matchesStatus && matchesSearch;
  });

  // Calculate Summary Metrics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const underReview = requests.filter(r => ['Assigned', 'Under Evaluation', 'Pending Finalization', 'Revision Requested'].includes(r.status)).length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;

  // Generate unique filter options
  const academicYears = ['All', ...new Set(requests.map(r => r.academic_year))];
  const examTypes = ['All', ...new Set(requests.map(r => r.examination))];
  const semesters = ['All', ...new Set(requests.map(r => r.semester.toString()))];
  const statuses = ['All', 'Pending', 'Assigned', 'Under Evaluation', 'Pending Finalization', 'Revision Requested', 'Completed'];

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Rechecking Requests</h2>
        <button 
          className="btn-primary" 
          onClick={() => alert("Apply for Rechecking module coming soon in Phase 2!")}
        >
          Apply for Rechecking
        </button>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Track the status of your submitted rechecking requests.
      </p>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Requests</h3>
          <div className="stat-value">{totalRequests}</div>
          <div className="stat-desc">All rechecking applications</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingRequests}</div>
          <div className="stat-desc">Awaiting assignment</div>
        </div>
        <div className="stat-card">
          <h3>Under Review</h3>
          <div className="stat-value" style={{ color: '#2563eb' }}>{underReview}</div>
          <div className="stat-desc">Evaluation in progress</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value" style={{ color: '#16a34a' }}>{completedRequests}</div>
          <div className="stat-desc">Finalized rechecking</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
           <input 
             type="text" 
             placeholder="Search by Subject Code or Name..." 
             className="search-input"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
           />
        </div>
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center' }}>
           <select 
             className="status-filter"
             value={academicYearFilter}
             onChange={(e) => setAcademicYearFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             <option value="All">All Years</option>
             {academicYears.filter(y => y !== 'All').map(year => <option key={year} value={year}>{year}</option>)}
           </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center' }}>
           <select 
             className="status-filter"
             value={examTypeFilter}
             onChange={(e) => setExamTypeFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             <option value="All">All Exams</option>
             {examTypes.filter(t => t !== 'All').map(type => <option key={type} value={type}>{type}</option>)}
           </select>
        </div>
        <div style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center' }}>
           <select 
             className="status-filter"
             value={semesterFilter}
             onChange={(e) => setSemesterFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             <option value="All">All Semesters</option>
             {semesters.filter(s => s !== 'All').map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
           </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center' }}>
           <select 
             className="status-filter"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             {statuses.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Loading your requests...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>No rechecking requests found</h3>
          <p style={{ margin: 0 }}>
            {requests.length === 0 
              ? 'You have not submitted any rechecking requests yet.' 
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Subject</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Examination</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Applied On</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.request_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#334155' }}>{req.subject_code}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{req.subject_name}</div>
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{ color: '#1e293b' }}>{req.examination}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Sem {req.semester} ({req.academic_year})</div>
                  </td>
                  <td style={{ padding: '12px 15px', color: '#64748b' }}>
                    {new Date(req.applied_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(req.status).bg,
                      color: getStatusColor(req.status).text
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => navigate(`/student/rechecking/${req.request_id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentRechecking;
