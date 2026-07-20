import React, { useState } from 'react';
import { useApiData } from '../../../hooks/useApiData';
import { fetchWithHandling } from '../../../utils/api';

function ReassignEvaluationsModal({ isOpen, onClose, onAssignSuccess, currentFacultyId, currentFacultyName }) {
  const { data: facultyProgress = [] } = useApiData('/api/admin/evaluations/faculty-progress', []);
  const { data: assignedSheets = [], loading } = useApiData(currentFacultyId ? `/api/evaluations/assigned?faculty_id=${currentFacultyId}` : null, [currentFacultyId]);
  
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reassignableSheets = assignedSheets.filter(s => !['Submitted', 'Locked', 'Evaluation Submitted'].includes(s.session_status));
  const currentFacultyDetails = facultyProgress.find(f => f.id.toString() === currentFacultyId?.toString());

  if (!isOpen) return null;

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedSheets(reassignableSheets.map(s => s.answer_sheet_id));
    else setSelectedSheets([]);
  };

  const handleSelectSheet = (id) => {
    setSelectedSheets(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || selectedSheets.length === 0) return;
    setIsSubmitting(true);
    try {
      await fetchWithHandling('http://localhost:5000/api/answer-sheets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          sheetIds: selectedSheets,
          reason: `Reassigned from ${currentFacultyName}`
        })
      });
      onAssignSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to reassign evaluations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '750px', maxWidth: '90%', padding: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#0f172a' }}>Reassign Evaluations</h2>
        
        {/* Section 1: Current Faculty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#64748b' }}>
            {currentFacultyName.charAt(0)}
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b' }}>{currentFacultyName}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{currentFacultyDetails?.department || 'Department Unknown'}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>Current Pending Workload</span>
            <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{currentFacultyDetails?.pending || reassignableSheets.length}</strong>
          </div>
        </div>

        {/* Section 2: Select New Faculty */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Select New Faculty</label>
          <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', fontSize: '14px' }}>
            <option value="">-- Choose New Evaluator --</option>
            {facultyProgress.filter(f => f.id.toString() !== currentFacultyId?.toString()).map(f => (
              <option key={f.id} value={f.id}>{f.name} (Pending {f.pending})</option>
            ))}
          </select>
        </div>

        {/* Section 3: Answer Sheets */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Select Answer Sheets</label>
          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            {loading ? (
              <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '24px' }}>Loading sheets...</p>
            ) : reassignableSheets.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '24px' }}>No active assignments to reassign.</p>
            ) : (
              <table className="activity-table" style={{ width: '100%', margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', padding: '12px' }}><input type="checkbox" onChange={handleSelectAll} checked={selectedSheets.length === reassignableSheets.length && reassignableSheets.length > 0} /></th>
                    <th>Candidate Code</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reassignableSheets.map(sheet => (
                    <tr key={sheet.answer_sheet_id}>
                      <td style={{ padding: '12px' }}><input type="checkbox" checked={selectedSheets.includes(sheet.answer_sheet_id)} onChange={() => handleSelectSheet(sheet.answer_sheet_id)} /></td>
                      <td style={{ fontWeight: '500' }}>{sheet.candidate_code || 'N/A'}</td>
                      <td>{sheet.subject_name}</td>
                      <td>
                        <span className={`status-badge ${(sheet.session_status || 'Assigned').replace(/\s+/g, '').toLowerCase()}`}>
                          {sheet.session_status || 'Assigned'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>{sheet.assigned_date ? new Date(sheet.assigned_date).toLocaleDateString() : 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button className="as-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }} onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button 
            className="primary-btn" 
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', opacity: (selectedSheets.length === 0 || !selectedFaculty || isSubmitting) ? 0.5 : 1 }} 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedFaculty || selectedSheets.length === 0}
          >
            {isSubmitting ? 'Reassigning...' : 'Reassign Selected Papers'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReassignEvaluationsModal;
