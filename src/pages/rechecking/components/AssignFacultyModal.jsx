import React, { useState, useEffect } from 'react';
import { fetchWithHandling } from '../../../utils/api';

function AssignFacultyModal({ requestId, onClose, onAssignSuccess }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetchWithHandling('http://localhost:5000/api/faculty');
        setFacultyList(res);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const handleAssign = async () => {
    if (!selectedFaculty) {
      alert('Please select a faculty member');
      return;
    }
    
    setAssigning(true);
    try {
      await fetchWithHandling(`http://localhost:5000/api/rechecking/${requestId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluator_id: selectedFaculty })
      });
      onAssignSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning faculty:', err);
      alert(err.message || 'Failed to assign faculty');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Assign Evaluator</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Select a faculty member to evaluate this rechecking request.
          </p>
          
          {loading ? (
            <p>Loading faculty...</p>
          ) : (
            <div className="filter-group">
              <label>Select Faculty</label>
              <select 
                value={selectedFaculty} 
                onChange={e => setSelectedFaculty(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">-- Choose Evaluator --</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px', justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={onClose} disabled={assigning}>Cancel</button>
            <button 
              className="btn-primary" 
              onClick={handleAssign} 
              disabled={assigning || !selectedFaculty}
            >
              {assigning ? 'Assigning...' : 'Assign Evaluator'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignFacultyModal;
