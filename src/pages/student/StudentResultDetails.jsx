import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentResultDetails() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  const fetchResultDetails = async () => {
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

      // Step 2: Fetch detailed results for this student and result ID
      const res = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/results/${resultId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch result details or result not found.');
      }
      const data = await res.json();
      setResultData(data);
    } catch (err) {
      console.error('Error in fetchResultDetails:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '15px', color: '#64748b' }}>Loading digital marksheet...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <button className="btn-secondary" onClick={() => navigate('/student/results')}>&larr; Back to Results</button>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  const { summary, subjects } = resultData;

  return (
    <div className="dashboard-container marksheet-container">
      {/* Hide controls when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .marksheet-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          body { background: white; margin: 0; padding: 0; }
          .dashboard-container { padding: 0; }
        }
      `}</style>

      <div className="admin-header-inline no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn-secondary" onClick={() => navigate('/student/results')}>&larr; Back</button>
          <h2 style={{ margin: 0 }}>Result Details</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handlePrint}>Print Result</button>
          <button className="btn-primary" onClick={handlePrint}>Download PDF</button>
        </div>
      </div>

      <div className="marksheet-card" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        
        {/* University Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #3b82f6' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '28px' }}>Demo University</h1>
          <h3 style={{ margin: '0 0 5px 0', color: '#475569', fontWeight: '500' }}>Official Grade Report (Digital Marksheet)</h3>
          <p style={{ margin: 0, color: '#64748b' }}>{summary.exam_type} - {summary.academic_year}</p>
        </div>

        {/* Student Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ marginBottom: '10px' }}><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Student Name:</span> <strong style={{ color: '#1e293b', fontSize: '16px' }}>{summary.student_name}</strong></div>
            <div style={{ marginBottom: '10px' }}><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Roll Number:</span> <strong style={{ color: '#1e293b' }}>{summary.roll_number}</strong></div>
            <div><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Programme:</span> <strong style={{ color: '#1e293b' }}>{summary.program}</strong></div>
          </div>
          <div>
            <div style={{ marginBottom: '10px' }}><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Course:</span> <strong style={{ color: '#1e293b' }}>{summary.course}</strong></div>
            <div style={{ marginBottom: '10px' }}><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Semester:</span> <strong style={{ color: '#1e293b' }}>{summary.semester}</strong></div>
            <div><span style={{ color: '#64748b', display: 'inline-block', width: '120px' }}>Published Date:</span> <strong style={{ color: '#1e293b' }}>{new Date(summary.published_at).toLocaleDateString()}</strong></div>
          </div>
        </div>

        {/* Subject-wise Marks Table */}
        <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '18px' }}>Subject-wise Performance</h4>
        <div style={{ marginBottom: '40px', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '14px' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '14px' }}>Subject Name</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Credits</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Max Marks</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Marks Obtained</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Grade</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, index) => (
                <tr key={sub.subject_code || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{sub.subject_code}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{sub.subject_name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>{sub.credits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{sub.max_marks}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>{sub.marks_obtained}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{sub.grade}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: sub.result === 'Pass' ? '#dcfce7' : '#fee2e2',
                      color: sub.result === 'Pass' ? '#16a34a' : '#b91c1c'
                    }}>
                      {sub.result}
                    </span>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No subject data found for this result.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '400px', backgroundColor: '#f8fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Result Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Total Max Marks:</span>
              <strong style={{ color: '#1e293b' }}>{summary.total_max_marks}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Total Marks Obtained:</span>
              <strong style={{ color: '#1e293b' }}>{summary.total_marks_obtained}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Overall Percentage:</span>
              <strong style={{ color: '#1e293b' }}>{summary.overall_percentage}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>SGPA:</span>
              <strong style={{ color: '#3b82f6' }}>{summary.sgpa}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#64748b' }}>CGPA:</span>
              <strong style={{ color: '#8b5cf6' }}>{summary.cgpa}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #cbd5e1', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Final Result:</span>
              <span style={{ 
                padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
                backgroundColor: summary.overall_result === 'Pass' ? '#16a34a' : '#dc2626',
                color: 'white'
              }}>
                {summary.overall_result}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div style={{ marginTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
          <p>This is a computer-generated digital marksheet and does not require a signature.</p>
          <p>Generated on: {new Date().toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
}

export default StudentResultDetails;
