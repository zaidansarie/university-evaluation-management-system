import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Search & Filter State
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  useEffect(() => {
    fetchStudentResults();
  }, []);

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Demo Authentication - Fetch first student to act as logged in user
      const studentRes = await fetch('http://localhost:5000/api/students');
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const students = await studentRes.json();
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the system. Cannot load results.');
      }
      
      const loggedInStudent = students[0]; // Hardcoded demo student

      // Step 2: Fetch Published Results for this student
      const resultsRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/results`);
      if (!resultsRes.ok) throw new Error('Failed to fetch results');
      const resultsData = await resultsRes.json();
      
      setResults(resultsData);
    } catch (err) {
      console.error('Error in fetchStudentResults:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Compute filtering
  const filteredResults = results.filter(result => {
    const matchesYear = academicYearFilter === 'All' || result.academic_year === academicYearFilter;
    const matchesType = examTypeFilter === 'All' || result.exam_type === examTypeFilter;
    const matchesSemester = semesterFilter === 'All' || result.semester.toString() === semesterFilter;
    
    return matchesYear && matchesType && matchesSemester;
  });

  // Calculate Summary Metrics
  const totalResults = results.length;
  let latestSemester = 'N/A';
  let latestSGPA = 'N/A';
  let overallPercentage = 'N/A';

  if (totalResults > 0) {
    // Determine the max semester (assuming results are sorted by semester desc)
    const latestResult = results.reduce((prev, current) => 
      (prev.semester > current.semester) ? prev : current
    );
    latestSemester = `Semester ${latestResult.semester}`;
    latestSGPA = latestResult.sgpa || 'N/A';
    
    // Overall Percentage
    const sumPercentage = results.reduce((sum, res) => sum + parseFloat(res.percentage || 0), 0);
    overallPercentage = (sumPercentage / totalResults).toFixed(2) + '%';
  }

  // Generate unique filter options
  const academicYears = ['All', ...new Set(results.map(r => r.academic_year))];
  const examTypes = ['All', ...new Set(results.map(r => r.exam_type))];
  const semesters = ['All', ...new Set(results.map(r => r.semester.toString()))];

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Results</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        View your published academic examination results.
      </p>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Published</h3>
          <div className="stat-value">{totalResults}</div>
          <div className="stat-desc">Results available</div>
        </div>
        <div className="stat-card">
          <h3>Latest Semester</h3>
          <div className="stat-value" style={{ fontSize: '24px' }}>{latestSemester}</div>
          <div className="stat-desc">Most recent result</div>
        </div>
        <div className="stat-card">
          <h3>Latest SGPA</h3>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{latestSGPA}</div>
          <div className="stat-desc">Semester Performance</div>
        </div>
        <div className="stat-card">
          <h3>Overall Percentage</h3>
          <div className="stat-value" style={{ color: '#10b981' }}>{overallPercentage}</div>
          <div className="stat-desc">Cumulative Average</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
           <span style={{ marginRight: '10px', color: '#64748b', fontWeight: 500 }}>Academic Year:</span>
           <select 
             className="status-filter"
             value={academicYearFilter}
             onChange={(e) => setAcademicYearFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
           </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
           <span style={{ marginRight: '10px', color: '#64748b', fontWeight: 500 }}>Exam Type:</span>
           <select 
             className="status-filter"
             value={examTypeFilter}
             onChange={(e) => setExamTypeFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             {examTypes.map(type => <option key={type} value={type}>{type}</option>)}
           </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center' }}>
           <span style={{ marginRight: '10px', color: '#64748b', fontWeight: 500 }}>Semester:</span>
           <select 
             className="status-filter"
             value={semesterFilter}
             onChange={(e) => setSemesterFilter(e.target.value)}
             style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', flex: 1 }}
           >
             {semesters.map(sem => <option key={sem} value={sem}>{sem === 'All' ? 'All' : `Semester ${sem}`}</option>)}
           </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Loading your results...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : filteredResults.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎓</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>No published results available</h3>
          <p style={{ margin: 0 }}>
            {results.length === 0 
              ? 'Your examination results have not been published yet.' 
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Academic Year</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Semester</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Examination</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Published Date</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Percentage</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Grade</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>SGPA</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(result => (
                <tr key={result.result_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#334155' }}>{result.academic_year}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', color: '#334155' }}>{result.semester}</td>
                  <td style={{ padding: '12px 15px', color: '#1e293b' }}>{result.exam_type}</td>
                  <td style={{ padding: '12px 15px', color: '#64748b' }}>
                    {result.published_at ? new Date(result.published_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>
                    {result.percentage}%
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                    {result.grade}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {result.sgpa}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a'
                    }}>
                      {result.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => navigate(`/student/results/${result.result_id}`)}
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

export default StudentResults;
