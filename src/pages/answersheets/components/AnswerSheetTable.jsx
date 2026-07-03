import React from 'react';

function AnswerSheetTable({ 
  answerSheets, onOpenUpload, onLinkStudent, onDeleteRequest,
  selectedSheets = [], onSelectSheet, onSelectAll, onSingleAssign
}) {
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Uploaded': return 'as-badge-uploaded';
      case 'Uploaded - Needs Linking': return 'as-badge-rechecking'; // distinct color for attention
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
            <th style={{width: '40px'}}>
              <input 
                type="checkbox" 
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={answerSheets.length > 0 && selectedSheets.length === answerSheets.filter(s => !['Uploaded - Needs Linking', 'Completed', 'Locked'].includes(s.status)).length}
              />
            </th>
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
              <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p style={{fontSize: '1.1rem', marginBottom: '8px', color: '#0f172a', fontWeight: '500'}}>No answer booklets uploaded yet.</p>
                <p style={{marginBottom: '20px'}}>Upload scanned answer booklets to begin the evaluation process.</p>
                <button className="as-btn as-btn-primary" onClick={onOpenUpload}>
                  Upload Answer Booklets
                </button>
              </td>
            </tr>
          ) : (
            answerSheets.map(sheet => {
              const isSelectable = !['Uploaded - Needs Linking', 'Completed', 'Locked'].includes(sheet.status);
              return (
              <tr key={sheet.id}>
                <td>
                  <input 
                    type="checkbox" 
                    disabled={!isSelectable}
                    checked={selectedSheets.includes(sheet.id)}
                    onChange={(e) => onSelectSheet(sheet.id, e.target.checked)}
                  />
                </td>
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
                <td>
                  {sheet.assigned_faculty_name ? (
                    <div>
                      <div style={{fontWeight: '500'}}>{sheet.assigned_faculty_name}</div>
                      <div style={{fontSize: '0.75rem', color: '#64748b'}}>
                        Assigned: {sheet.assigned_date ? new Date(sheet.assigned_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <span className={`as-badge ${getBadgeClass(sheet.status)}`}>
                    {sheet.status}
                  </span>
                </td>
                <td>
                  {sheet.status === 'Uploaded - Needs Linking' ? (
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button 
                        className="as-btn as-btn-primary" 
                        style={{padding: '6px 12px', fontSize: '0.85rem'}}
                        onClick={() => onLinkStudent(sheet)}
                      >
                        Link Student
                      </button>
                      <button 
                        className="as-btn as-btn-secondary" 
                        style={{padding: '6px 10px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fee2e2'}}
                        title="Delete"
                        onClick={() => onDeleteRequest(sheet)}
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <select 
                      style={{padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem'}}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'delete') {
                          onDeleteRequest(sheet);
                        } else if (val === 'assign') {
                          if (onSingleAssign) onSingleAssign(sheet);
                        } else {
                          alert(val + " feature coming soon");
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Actions...</option>
                      <option value="view">View PDF</option>
                      <option value="assign">Assign / Change Faculty</option>
                      <option value="evaluation">View Evaluation</option>
                      <option value="history">History</option>
                      <option value="delete">Delete</option>
                    </select>
                  )}
                </td>
              </tr>
            );
          })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AnswerSheetTable;
