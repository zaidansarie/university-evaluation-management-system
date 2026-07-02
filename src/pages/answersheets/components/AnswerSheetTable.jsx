import React from 'react';

function AnswerSheetTable({ answerSheets, onOpenUpload }) {
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Uploaded': return 'as-badge-uploaded';
      case 'Assigned': return 'as-badge-assigned';
      case 'Under Evaluation': return 'as-badge-evaluating';
      case 'Moderation': return 'as-badge-moderation';
      case 'Rechecking': return 'as-badge-rechecking';
      case 'Completed': return 'as-badge-completed';
      case 'Locked': return 'as-badge-locked';
      default: return 'as-badge-uploaded';
    }
  };

  return (
    <div className="as-table-container">
      <table className="as-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Student Name</th>
            <th>Question Paper</th>
            <th>PDF File</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {answerSheets.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p style={{fontSize: '1.1rem', marginBottom: '8px', color: '#0f172a', fontWeight: '500'}}>No answer booklets uploaded yet.</p>
                <p style={{marginBottom: '20px'}}>Upload scanned answer booklets to begin the evaluation process.</p>
                <button className="as-btn as-btn-primary" onClick={onOpenUpload}>
                  Upload Answer Booklets
                </button>
              </td>
            </tr>
          ) : (
            answerSheets.map(sheet => (
              <tr key={sheet.id}>
                <td>{sheet.roll_number || sheet.candidate_code || 'Unlinked'}</td>
                <td>{sheet.student_name || 'Unlinked'}</td>
                <td>
                  <div style={{fontWeight: '600'}}>{sheet.exam_type}</div>
                  <div style={{fontSize: '0.85rem', color: '#64748b'}}>{sheet.subject}</div>
                  <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>Sem {sheet.semester} • {sheet.academic_year}</div>
                </td>
                <td>
                  <span style={{color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => alert("PDF Viewer coming in Phase 5.5")}>
                    {sheet.original_filename || 'View PDF'}
                  </span>
                </td>
                <td>{sheet.assigned_faculty_name || '-'}</td>
                <td>
                  <span className={`as-badge ${getBadgeClass(sheet.status)}`}>
                    {sheet.status}
                  </span>
                </td>
                <td>
                  <select 
                    style={{padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem'}}
                    onChange={(e) => alert(e.target.value + " feature coming soon")}
                    defaultValue=""
                  >
                    <option value="" disabled>Actions...</option>
                    <option value="view">View PDF</option>
                    <option value="assign">Assign / Change</option>
                    <option value="evaluation">View Evaluation</option>
                    <option value="history">History</option>
                    <option value="delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AnswerSheetTable;
