import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentAnswerSheets() {
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Search & Filter State
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudentAnswerSheets();
  }, []);

  const fetchStudentAnswerSheets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch first student to act as logged in user (demo)
      const studentRes = await fetch('http://localhost:5000/api/students');
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const students = await studentRes.json();
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the system. Cannot load answer sheets.');
      }
      
      const loggedInStudent = students[0]; // Hardcoded demo student

      // Fetch Evaluated Answer Sheets for this student
      const sheetsRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/answer-sheets`);
      if (!sheetsRes.ok) throw new Error('Failed to fetch answer sheets');
      const sheetsData = await sheetsRes.json();
      
      setAnswerSheets(sheetsData);
    } catch (err) {
      console.error('Error in fetchStudentAnswerSheets:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Compute filtering
  const filteredSheets = answerSheets.filter(sheet => {
    const matchesYear = academicYearFilter === 'All' || sheet.academic_year === academicYearFilter;
    const matchesType = examTypeFilter === 'All' || sheet.examination === examTypeFilter;
    const matchesSemester = semesterFilter === 'All' || sheet.semester.toString() === semesterFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      (sheet.subject_code && sheet.subject_code.toLowerCase().includes(searchLower)) ||
      (sheet.subject_name && sheet.subject_name.toLowerCase().includes(searchLower));
    
    return matchesYear && matchesType && matchesSemester && matchesSearch;
  });

  // Calculate Summary Metrics
  const totalSheets = answerSheets.length;
  const evaluatedSheets = answerSheets.filter(s => s.evaluation_status === 'Evaluation Submitted' || s.evaluation_status === 'Results Declared').length;
  const pendingSheets = 0; // Since we only fetch evaluated ones for this endpoint

  // Generate unique filter options
  const academicYears = ['All', ...new Set(answerSheets.map(s => s.academic_year))];
  const examTypes = ['All', ...new Set(answerSheets.map(s => s.examination))];
  const semesters = ['All', ...new Set(answerSheets.map(s => s.semester.toString()))];

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Answer Sheets</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Access your evaluated answer sheets from previous examinations.
      </p>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Answer Sheets</h3>
          <div className="stat-value">{totalSheets}</div>
          <div className="stat-desc">Evaluated answer sheets</div>
        </div>
        <div className="stat-card">
          <h3>Evaluated</h3>
          <div className="stat-value" style={{ color: '#10b981' }}>{evaluatedSheets}</div>
          <div className="stat-desc">Evaluation completed</div>
        </div>
        <div className="stat-card">
          <h3>Pending Evaluation</h3>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingSheets}</div>
          <div className="stat-desc">In progress</div>
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
        <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center' }}>
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
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Loading your answer sheets...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : filteredSheets.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>No evaluated answer sheets found</h3>
          <p style={{ margin: 0 }}>
            {answerSheets.length === 0 
              ? 'None of your answer sheets have been evaluated yet.' 
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Subject Code</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Subject Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Examination</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Semester</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Marks</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSheets.map(sheet => (
                <tr key={sheet.answer_sheet_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#334155' }}>{sheet.subject_code}</td>
                  <td style={{ padding: '12px 15px', color: '#334155' }}>{sheet.subject_name}</td>
                  <td style={{ padding: '12px 15px', color: '#1e293b' }}>{sheet.examination} ({sheet.academic_year})</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', color: '#334155' }}>{sheet.semester}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a'
                    }}>
                      Evaluated
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>
                    {sheet.marks_obtained !== null ? sheet.marks_obtained : '--'} / {sheet.maximum_marks}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => navigate(`/student/answer-sheets/${sheet.answer_sheet_id}`, { state: { sheet } })}
                    >
                      View Answer Sheet
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

export default StudentAnswerSheets;
