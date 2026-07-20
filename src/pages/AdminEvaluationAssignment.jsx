import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import './AdminDashboard.css';

function AdminEvaluationAssignment() {
  const { showToast } = useToast();
  const location = useLocation();
  const highlightSheetId = location.state?.highlightSheetId;
  
  // Fetch data
  const { data: stats = {}, refetch: refetchStats } = useApiData('/api/admin/evaluations/assignment-stats');
  const { data: rawAnswerSheets = [], loading: sheetsLoading, refetch: refetchSheets } = useApiData('/api/answer-sheets', []);
  const { data: facultyProgress = [] } = useApiData('/api/admin/evaluations/faculty-progress', []);

  // State
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    department: '',
    search: ''
  });
  
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Derived Data
  const unassignedSheets = useMemo(() => {
    return rawAnswerSheets.filter(sheet => ['Uploaded', 'Uploaded - Needs Linking'].includes(sheet.status));
  }, [rawAnswerSheets]);

  const filteredSheets = useMemo(() => {
    return unassignedSheets.filter(sheet => {
      const matchSub = filters.subject ? sheet.subject === filters.subject : true;
      const matchSem = filters.semester ? sheet.semester === filters.semester : true;
      const matchSearch = filters.search ? (sheet.candidate_code || '').toLowerCase().includes(filters.search.toLowerCase()) : true;
      return matchSub && matchSem && matchSearch;
    });
  }, [unassignedSheets, filters]);

  const activeFacultyList = useMemo(() => {
    return facultyProgress.filter(f => {
      if (filters.department && f.department !== filters.department) return false;
      return true;
    });
  }, [facultyProgress, filters.department]);

  const selectedFacultyDetails = useMemo(() => {
    return activeFacultyList.find(f => f.id.toString() === selectedFacultyId);
  }, [activeFacultyList, selectedFacultyId]);

  useEffect(() => {
    if (highlightSheetId && filteredSheets.length > 0) {
      setSelectedSheets(prev => prev.includes(highlightSheetId) ? prev : [...prev, highlightSheetId]);
      
      setTimeout(() => {
        const el = document.getElementById(`sheet-row-${highlightSheetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = '#fef3c7'; // highlight color
          setTimeout(() => { el.style.backgroundColor = ''; }, 3000);
        }
      }, 100);
    }
  }, [highlightSheetId, filteredSheets]);

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedSheets(filteredSheets.map(s => s.id));
    else setSelectedSheets([]);
  };

  const handleSelectSheet = (id) => {
    setSelectedSheets(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if (!selectedFacultyId || selectedSheets.length === 0) return;
    setIsAssigning(true);
    try {
      await fetchWithHandling('http://localhost:5000/api/answer-sheets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFacultyId,
          sheetIds: selectedSheets,
          reason: 'Initial Assignment'
        })
      });
      showToast('success', `${selectedSheets.length} answer sheets successfully assigned.`);
      setSelectedSheets([]);
      setSelectedFacultyId('');
      refetchStats(true);
      refetchSheets(true);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to assign evaluations.');
    } finally {
      setIsAssigning(false);
    }
  };

  const uniqueSubjects = [...new Set(unassignedSheets.map(s => s.subject))].filter(Boolean);
  const uniqueSemesters = [...new Set(unassignedSheets.map(s => s.semester))].filter(Boolean);
  const uniqueDepartments = [...new Set(facultyProgress.map(f => f.department))].filter(Boolean);

  const getWorkloadLabel = (assigned) => {
    if (assigned < 20) return { text: 'Low', color: '#10b981' };
    if (assigned <= 50) return { text: 'Medium', color: '#f59e0b' };
    return { text: 'High', color: '#ef4444' };
  };

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Evaluation Assignment</h2>
      </div>

      <div className="summary-cards" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3>Unassigned Answer Sheets</h3>
          <p className="card-value highlight-yellow">{stats.unassigned || 0}</p>
        </div>
        <div className="card">
          <h3>Assigned Answer Sheets</h3>
          <p className="card-value">{stats.assigned || 0}</p>
        </div>
        <div className="card">
          <h3>Available Faculty</h3>
          <p className="card-value">{stats.availableFaculty || 0}</p>
        </div>
        <div className="card">
          <h3>Faculty Without Assignment</h3>
          <p className="card-value highlight-green">{stats.facultyWithoutAssignment || 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 350px', gap: '24px' }}>
        
        {/* Left Section: Filters */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>Filters</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Subject</label>
            <select value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Subjects</option>
              {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Semester</label>
            <select value={filters.semester} onChange={e => setFilters({...filters, semester: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Semesters</option>
              {uniqueSemesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Faculty Department</label>
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Departments</option>
              {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Search Candidate Code</label>
            <input type="text" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} placeholder="E.g., CAND001" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
        </div>

        {/* Middle Section: Table */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>Available Answer Sheets ({filteredSheets.length})</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sheetsLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Loading answer sheets...</p>
            ) : filteredSheets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No answer sheets found matching filters.</p>
            ) : (
              <table className="activity-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={handleSelectAll} checked={selectedSheets.length === filteredSheets.length && filteredSheets.length > 0} /></th>
                    <th>Candidate Code</th>
                    <th>Subject</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheets.map(sheet => (
                    <tr key={sheet.id} id={`sheet-row-${sheet.id}`} style={{ transition: 'background-color 0.5s' }}>
                      <td><input type="checkbox" checked={selectedSheets.includes(sheet.id)} onChange={() => handleSelectSheet(sheet.id)} /></td>
                      <td style={{ fontWeight: '500' }}>{sheet.candidate_code || 'N/A'}</td>
                      <td>{sheet.subject}</td>
                      <td>{sheet.course}</td>
                      <td>{sheet.semester}</td>
                      <td>{sheet.upload_date ? new Date(sheet.upload_date).toLocaleDateString() : 'Unknown'}</td>
                      <td>
                        <span className={`status-badge ${(sheet.status || 'unassigned').replace(/\s+/g, '').toLowerCase()}`}>
                          {sheet.status || 'Unassigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Section: Assignment Panel */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>Assignment Panel</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Select Faculty</label>
            <select value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}>
              <option value="">-- Choose Evaluator --</option>
              {activeFacultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.assignedPapers} assigned)</option>
              ))}
            </select>
          </div>

          {selectedFacultyDetails ? (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{selectedFacultyDetails.name}</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>{selectedFacultyDetails.department}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Current Assigned:</span>
                <strong style={{ fontSize: '13px' }}>{selectedFacultyDetails.assignedPapers} Papers</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Completed:</span>
                <strong style={{ fontSize: '13px', color: '#10b981' }}>{selectedFacultyDetails.completed}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Pending:</span>
                <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{selectedFacultyDetails.pending}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Workload Level:</span>
                {(() => {
                  const wl = getWorkloadLabel(selectedFacultyDetails.assignedPapers);
                  return (
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: `${wl.color}20`, color: wl.color }}>
                      {wl.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '8px', marginBottom: '24px' }}>
              Select a faculty member to view workload details.
            </div>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '12px', color: selectedSheets.length > 0 ? '#0f172a' : '#94a3b8', fontWeight: selectedSheets.length > 0 ? '500' : 'normal' }}>
              {selectedSheets.length} Sheets Selected
            </p>
            <button 
              className="primary-btn" 
              style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: (selectedSheets.length === 0 || !selectedFacultyId || isAssigning) ? 0.5 : 1, cursor: (selectedSheets.length === 0 || !selectedFacultyId || isAssigning) ? 'not-allowed' : 'pointer' }}
              disabled={selectedSheets.length === 0 || !selectedFacultyId || isAssigning}
              onClick={handleAssign}
            >
              {isAssigning ? 'Assigning...' : 'Assign Selected Sheets'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminEvaluationAssignment;
