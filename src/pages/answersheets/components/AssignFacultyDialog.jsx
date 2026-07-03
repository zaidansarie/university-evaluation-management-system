import React, { useState, useEffect } from 'react';

function AssignFacultyDialog({ targetSheets, onClose, onAssignComplete }) {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFacultyWorkload();
  }, []);

  const fetchFacultyWorkload = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/faculty/workload');
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data);
      }
    } catch (err) {
      console.error('Failed to fetch faculty workload', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedFaculty = facultyList.find(f => f.id.toString() === selectedFacultyId);
  const isReassignment = targetSheets.some(s => s.assigned_faculty_name);

  // Group unique old faculty names for the reassignment text
  const oldFacultyNames = [...new Set(targetSheets.filter(s => s.assigned_faculty_name).map(s => s.assigned_faculty_name))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId) return;

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/answer-sheets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetIds: targetSheets.map(s => s.id),
          facultyId: selectedFacultyId,
          reason: isReassignment ? reason : null
        })
      });

      if (res.ok) {
        onAssignComplete();
      } else {
        const data = await res.json();
        alert(data.error || 'Assignment failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="as-modal-overlay">
      <div className="as-modal-content" style={{maxWidth: '500px'}}>
        <div className="as-modal-header">
          <h2 style={{margin: 0, fontSize: '1.25rem', color: '#0f172a'}}>Faculty Assignment</h2>
          <button className="as-modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div style={{padding: '30px', textAlign: 'center'}}>Loading faculty data...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{padding: '20px'}}>
            
            <div style={{background: '#eff6ff', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{color: '#1e40af', fontWeight: '500'}}>Selected Answer Sheets:</span>
              <span style={{background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem'}}>{targetSheets.length}</span>
            </div>

            {isReassignment && (
              <div style={{background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#991b1b'}}>
                <div style={{marginBottom: '5px'}}><strong>Reassignment Warning</strong></div>
                You are changing the assignment for one or more sheets currently assigned to: <strong>{oldFacultyNames.join(', ')}</strong>.
              </div>
            )}

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155'}}>
                {isReassignment ? 'Select New Faculty' : 'Select Faculty'}
              </label>
              <select 
                value={selectedFacultyId}
                onChange={e => setSelectedFacultyId(e.target.value)}
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                required
              >
                <option value="" disabled>-- Select Faculty --</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.current_workload} copies)
                  </option>
                ))}
              </select>
            </div>

            {selectedFaculty && (
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
                <div style={{marginBottom: '8px', fontSize: '0.9rem'}}>
                  <span style={{color: '#64748b'}}>Department:</span> <strong style={{color: '#0f172a'}}>{selectedFaculty.department}</strong>
                </div>
                <div style={{marginBottom: '8px', fontSize: '0.9rem'}}>
                  <span style={{color: '#64748b'}}>Current Workload:</span> <strong style={{color: '#0f172a'}}>{selectedFaculty.current_workload} sheets</strong>
                </div>
                <div style={{fontSize: '0.9rem'}}>
                  <span style={{color: '#64748b'}}>Projected Workload:</span> <strong style={{color: '#16a34a'}}>{parseInt(selectedFaculty.current_workload) + targetSheets.length} sheets</strong>
                </div>
              </div>
            )}

            {isReassignment && (
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155'}}>
                  Reason (optional)
                </label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                  placeholder="e.g. Faculty unavailable"
                />
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button type="button" className="as-btn as-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="as-btn as-btn-primary" disabled={submitting || !selectedFacultyId}>
                {submitting ? 'Assigning...' : (isReassignment ? 'Change' : 'Assign')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AssignFacultyDialog;
