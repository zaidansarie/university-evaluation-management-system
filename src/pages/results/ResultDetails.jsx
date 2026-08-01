import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import './Results.css';

function ResultDetails() {
  const { batchId } = useParams();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithHandling(`http://localhost:5000/api/admin/results/${batchId}`);
      setData(result);
    } catch (err) {
      console.error('Failed to load result batch details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading result details...</div>;
  if (error) return <APIError error={error} onRetry={fetchBatchDetails} resourceName="Result Details" />;
  if (!data) return null;

  const { batch, students } = data;

  // Compute summary stats from students array
  const passed = students.filter(s => s.status === 'Pass').length;
  const failed = students.filter(s => s.status === 'Fail').length;
  const absent = students.filter(s => s.status === 'Absent').length;
  
  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      (s.roll_no && s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.student_name && s.student_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="results-container">
      <div className="results-header">
        <Link to="/admin/results" className="back-btn">&larr;</Link>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Result Details</h2>
        </div>
      </div>
      
      {/* Header Info */}
      <div className="batch-header-info compact">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Academic Year</span>
            <span className="info-value">{batch.academic_year}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Examination</span>
            <span className="info-value">{batch.exam_type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Programme</span>
            <span className="info-value">{batch.program}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Course</span>
            <span className="info-value">{batch.course}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Semester</span>
            <span className="info-value">Sem {batch.semester}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Subject</span>
            <span className="info-value">{batch.subject}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Generation Date</span>
            <span className="info-value">
              {new Date(batch.generated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Result Status</span>
            <span className={`status-pill ${batch.status.toLowerCase()}`}>
              {batch.status === 'Generated' ? '🟠 Generated • Not Published' : '🟢 Published'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards modern-cards">
        <div className="card modern-card">
          <div className="card-icon blue">👥</div>
          <div className="card-content">
            <h4>Total Students</h4>
            <p className="card-value">{students.length}</p>
          </div>
        </div>
        <div className="card modern-card">
          <div className="card-icon green">✅</div>
          <div className="card-content">
            <h4>Passed</h4>
            <p className="card-value success">{passed}</p>
          </div>
        </div>
        <div className="card modern-card">
          <div className="card-icon red">❌</div>
          <div className="card-content">
            <h4>Failed</h4>
            <p className="card-value danger">{failed}</p>
          </div>
        </div>
        <div className="card modern-card">
          <div className="card-icon gray">⚠️</div>
          <div className="card-content">
            <h4>Absent</h4>
            <p className="card-value warning">{absent}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="list-toolbar">
        <input 
          type="text" 
          placeholder="Search by Roll No or Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Results</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Subject</th>
              <th className="text-center">Maximum Marks</th>
              <th className="text-center">Obtained Marks</th>
              <th className="text-center">Percentage</th>
              <th className="text-center">Grade</th>
              <th className="text-center">Result</th>
              <th>Evaluated By</th>
              <th>Evaluation Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr 
                key={student.id} 
                onClick={() => setSelectedStudent(student)}
                className="clickable-row compact-row"
              >
                <td className="whitespace-nowrap">{student.roll_no}</td>
                <td style={{ fontWeight: 500 }} className="whitespace-nowrap">{student.student_name}</td>
                <td className="ellipsis-cell" title={batch.subject}>{batch.subject}</td>
                <td className="text-center">{student.max_marks || 100}</td>
                <td className="text-center font-medium">{student.obtained_marks}</td>
                <td className="text-center">{student.display_percentage}</td>
                <td className="text-center" style={{ fontWeight: 600 }}>{student.grade}</td>
                <td className="text-center">
                  <span className={`status-badge small ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td>{student.evaluator_name}</td>
                <td>
                  {student.evaluation_date ? new Date(student.evaluation_date).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="10" className="empty-message">
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Result Details</h3>
              <button className="close-btn" onClick={() => setSelectedStudent(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedStudent.status === 'Absent' && (
                <div className="warning-alert">
                  <strong>Evaluation Missing:</strong> This student was absent or their answer sheet was not uploaded/evaluated.
                </div>
              )}
              
              <div className="student-details-grid">
                <div className="detail-row">
                  <span className="label">Roll No:</span>
                  <span className="value font-medium">{selectedStudent.roll_no}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Student Name:</span>
                  <span className="value font-medium">{selectedStudent.student_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Programme:</span>
                  <span className="value">{batch.program}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Course:</span>
                  <span className="value">{batch.course}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Semester:</span>
                  <span className="value">Sem {batch.semester}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Subject:</span>
                  <span className="value">{batch.subject}</span>
                </div>
                
                <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />
                
                <div className="detail-row">
                  <span className="label">Maximum Marks:</span>
                  <span className="value">{selectedStudent.max_marks || 100}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Obtained Marks:</span>
                  <span className="value font-bold">{selectedStudent.obtained_marks}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Percentage:</span>
                  <span className="value">{selectedStudent.display_percentage}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Grade:</span>
                  <span className="value font-bold text-primary">{selectedStudent.grade}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Result Status:</span>
                  <span className={`value status-text ${selectedStudent.status.toLowerCase()}`}>
                    {selectedStudent.status}
                  </span>
                </div>
                
                <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />
                
                <div className="detail-row">
                  <span className="label">Faculty Name:</span>
                  <span className="value">{selectedStudent.evaluator_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Evaluation Date:</span>
                  <span className="value">
                    {selectedStudent.evaluation_date ? new Date(selectedStudent.evaluation_date).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultDetails;
