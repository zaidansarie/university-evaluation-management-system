import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchStudentSubjects();
  }, []);

  const fetchStudentSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Demo Authentication - Fetch first student to act as logged in user
      const studentRes = await fetch('http://localhost:5000/api/students');
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const students = await studentRes.json();
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the system. Cannot load subjects.');
      }
      
      const loggedInStudent = students[0]; // Hardcoded demo student

      // Step 2: Fetch Subjects for this student
      const subjectsRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/subjects`);
      if (!subjectsRes.ok) throw new Error('Failed to fetch subjects');
      const subjectsData = await subjectsRes.json();
      
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error in fetchStudentSubjects:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.assigned_faculty_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || subject.derived_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter(s => s.derived_status === 'Active').length;
  const completedSubjects = subjects.filter(s => s.derived_status === 'Completed').length;

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>My Subjects</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        View the subjects you are registered for in the current and previous semesters.
      </p>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <div className="stat-value">{totalSubjects}</div>
          <div className="stat-desc">All enrolled subjects</div>
        </div>
        <div className="stat-card">
          <h3>Active Subjects</h3>
          <div className="stat-value">{activeSubjects}</div>
          <div className="stat-desc">Current semester</div>
        </div>
        <div className="stat-card">
          <h3>Completed Subjects</h3>
          <div className="stat-value">{completedSubjects}</div>
          <div className="stat-desc">Past semesters</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by code, name, or faculty..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select 
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Loading your subjects...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>No Subjects Found</h3>
          <p style={{ margin: 0 }}>{searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'You are not registered for any subjects yet.'}</p>
        </div>
      ) : (
        <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Code</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Subject Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569' }}>Faculty</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Credits</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Sem</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map(subject => (
                <tr key={subject.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#334155' }}>{subject.subject_code}</td>
                  <td style={{ padding: '12px 15px', color: '#1e293b' }}>{subject.subject_name}</td>
                  <td style={{ padding: '12px 15px', color: '#64748b' }}>
                    {subject.assigned_faculty_name || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', color: '#334155' }}>{subject.credits}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', color: '#334155' }}>{subject.semester}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: subject.derived_status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: subject.derived_status === 'Active' ? '#16a34a' : '#64748b'
                    }}>
                      {subject.derived_status}
                    </span>
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

export default StudentSubjects;
