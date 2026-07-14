import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentCreateRecheckingRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pre-filled sheet from Answer Sheet Viewer
  const preFilledSheet = location.state?.sheet;

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch demo student
        const studentRes = await fetch('http://localhost:5000/api/students');
        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        const students = await studentRes.json();
        
        if (!students || students.length === 0) {
          throw new Error('No students found in the system.');
        }
        
        const loggedInStudent = students[0];
        setStudent(loggedInStudent);

        // If no prefilled sheet, fetch eligible sheets
        if (!preFilledSheet) {
          const sheetsRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/answer-sheets`);
          if (!sheetsRes.ok) throw new Error('Failed to fetch eligible answer sheets');
          const sheetsData = await sheetsRes.json();
          setAvailableSheets(sheetsData);
        } else {
          setSelectedSheetId(preFilledSheet.answer_sheet_id.toString());
        }

      } catch (err) {
        console.error('Error initializing form:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [preFilledSheet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for rechecking.');
      return;
    }
    
    if (!selectedSheetId && !preFilledSheet) {
      setError('Please select an eligible answer sheet.');
      return;
    }

    let targetSheet;
    if (preFilledSheet) {
      targetSheet = preFilledSheet;
    } else {
      targetSheet = availableSheets.find(s => s.answer_sheet_id.toString() === selectedSheetId);
    }
    
    if (!targetSheet) {
      setError('Invalid answer sheet selected.');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        student_id: student.id,
        paper_id: targetSheet.paper_id,
        reason: reason,
        remarks: remarks,
        priority: 'Normal'
      };

      const res = await fetch('http://localhost:5000/api/rechecking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rechecking request');
      }
      
      alert(data.message || 'Rechecking request submitted successfully.');
      navigate('/student/rechecking');
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentSheet = preFilledSheet || availableSheets.find(s => s.answer_sheet_id.toString() === selectedSheetId);

  // Safe percentage calculation
  const getPercentage = (sheet) => {
    if (!sheet) return 'N/A';
    const obtained = sheet.marks_obtained !== null ? parseFloat(sheet.marks_obtained) : 0;
    const max = parseFloat(sheet.maximum_marks) || 1;
    return ((obtained / max) * 100).toFixed(2) + '%';
  };

  const getGrade = (percentageStr) => {
    if (percentageStr === 'N/A') return 'N/A';
    const p = parseFloat(percentageStr);
    if (p >= 90) return 'O';
    if (p >= 80) return 'A+';
    if (p >= 70) return 'A';
    if (p >= 60) return 'B+';
    if (p >= 50) return 'B';
    if (p >= 40) return 'C';
    return 'F';
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b' }}>Loading request form...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Apply for Rechecking</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Submit a request to have your answer sheet re-evaluated by a faculty member.
      </p>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Answer Sheet Selection */}
          {!preFilledSheet && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                Select Answer Sheet *
              </label>
              <select 
                className="form-control" 
                value={selectedSheetId}
                onChange={(e) => setSelectedSheetId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                required
              >
                <option value="">-- Select an evaluated answer sheet --</option>
                {availableSheets.map(sheet => (
                  <option key={sheet.answer_sheet_id} value={sheet.answer_sheet_id}>
                    {sheet.subject_code} - {sheet.subject_name} (Sem {sheet.semester}, {sheet.examination} {sheet.academic_year})
                  </option>
                ))}
              </select>
              {availableSheets.length === 0 && (
                <div style={{ marginTop: '8px', color: '#dc2626', fontSize: '13px' }}>
                  You have no eligible answer sheets for rechecking.
                </div>
              )}
            </div>
          )}

          {/* Current Details Display */}
          {currentSheet && (
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '15px' }}>Subject Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Subject Name:</span>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>{currentSheet.subject_name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Subject Code:</span>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>{currentSheet.subject_code}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Examination:</span>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>{currentSheet.examination}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Academic Year:</span>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>{currentSheet.academic_year}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Semester:</span>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>Semester {currentSheet.semester}</div>
                </div>
              </div>

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Current Marks:</span>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '16px' }}>
                    {currentSheet.marks_obtained !== null ? currentSheet.marks_obtained : '--'} / {currentSheet.maximum_marks}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Current Grade:</span>
                  <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>
                    {getGrade(getPercentage(currentSheet))} ({getPercentage(currentSheet)})
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
              Reason for Rechecking *
            </label>
            <textarea
              className="form-control"
              placeholder="Please explain in detail why you are requesting a rechecking for this answer sheet..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '120px', fontFamily: 'inherit' }}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
              Additional Remarks <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Any other comments or specific questions to review..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => navigate(-1)}
              disabled={submitting}
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting || (!preFilledSheet && !selectedSheetId)}
              style={{ padding: '10px 20px', backgroundColor: '#3b82f6' }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentCreateRecheckingRequest;
