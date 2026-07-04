import React, { useState } from 'react';
import './AnswerSheets.css';
import AnswerSheetToolbar from './components/AnswerSheetToolbar';
import AnswerSheetSummaryCard from './components/AnswerSheetSummaryCard';
import AnswerSheetTable from './components/AnswerSheetTable';
import UploadAnswerBookletDialog from './components/UploadAnswerBookletDialog';
import LinkStudentDialog from './components/LinkStudentDialog';
import AssignFacultyDialog from './components/AssignFacultyDialog';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';

function AnswerSheetDashboard() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { data: questionPaper, loading: qpLoading, error: qpError, refetch: refetchQp } = useApiData(`/api/question-papers/${paperId}`, null, [paperId]);
  const { data: answerSheets, loading: sheetsLoading, error: sheetsError, refetch: fetchAnswerSheets, setData: setAnswerSheets } = useApiData(`/api/answer-sheets?paper_id=${paperId}`, [], [paperId]);
  const { data: facultyList, loading: facultyLoading, error: facultyError, refetch: refetchFaculty } = useApiData('/api/faculty', []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkSheet, setLinkSheet] = useState(null); // Which sheet needs manual linking
  const [deleteSheet, setDeleteSheet] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null); // 'confirm' or 'protected'
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedSheets, setSelectedSheets] = useState([]);
  const [filters, setFilters] = useState({ searchQuery: '', assignmentStatus: 'All', facultyId: 'All' });
  const [facultyList, setFacultyList] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetSheets, setAssignTargetSheets] = useState([]);



  // Compute stats
  const total = answerSheets.length;
  const assigned = answerSheets.filter(s => s.status === 'Assigned').length;
  const evaluating = answerSheets.filter(s => s.status === 'Under Evaluation').length;
  const moderation = answerSheets.filter(s => s.status === 'Moderation').length;
  const rechecking = answerSheets.filter(s => s.status === 'Rechecking').length;
  const completed = answerSheets.filter(s => s.status === 'Completed').length;
  const locked = answerSheets.filter(s => s.status === 'Locked').length;
  const pending = total - (assigned + evaluating + moderation + rechecking + completed + locked);

  const filteredSheets = answerSheets.filter(sheet => {
    const searchMatch = !filters.searchQuery || 
      (sheet.roll_number?.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (sheet.student_name?.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (sheet.candidate_code?.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
    let statusMatch = true;
    if (filters.assignmentStatus === 'Assigned') statusMatch = sheet.status === 'Assigned';
    else if (filters.assignmentStatus === 'Unassigned') statusMatch = ['Uploaded', 'Uploaded - Needs Linking'].includes(sheet.status);
    else if (filters.assignmentStatus === 'Evaluating') statusMatch = sheet.status === 'Under Evaluation';
    
    let facultyMatch = true;
    if (filters.facultyId !== 'All') {
      facultyMatch = sheet.assigned_faculty_id?.toString() === filters.facultyId;
    }
    
    return searchMatch && statusMatch && facultyMatch;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      const selectable = filteredSheets.filter(s => !['Uploaded - Needs Linking', 'Completed', 'Locked'].includes(s.status));
      setSelectedSheets(selectable.map(s => s.id));
    } else {
      setSelectedSheets([]);
    }
  };

  const handleSelectSheet = (id, checked) => {
    if (checked) {
      setSelectedSheets(prev => [...prev, id]);
    } else {
      setSelectedSheets(prev => prev.filter(sId => sId !== id));
    }
  };

  const handleBulkAssign = () => {
    const targets = answerSheets.filter(s => selectedSheets.includes(s.id));
    setAssignTargetSheets(targets);
    setShowAssignModal(true);
  };
  
  const handleSingleAssign = (sheet) => {
    setAssignTargetSheets([sheet]);
    setShowAssignModal(true);
  };

  const handleDeleteRequest = (sheet) => {
    const protectedStatuses = ['Assigned', 'Under Evaluation', 'Moderation', 'Rechecking', 'Completed', 'Locked'];
    if (protectedStatuses.includes(sheet.status)) {
      setDeleteMode('protected');
    } else {
      setDeleteMode('confirm');
    }
    setDeleteSheet(sheet);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`http://localhost:5000/api/answer-sheets/${deleteSheet.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Examination Answer Sheet deleted successfully.');
        setDeleteSheet(null);
        setDeleteMode(null);
        fetchAnswerSheets();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Unable to delete the Examination Answer Sheet.\n\nPlease try again or contact the system administrator.');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to delete the Examination Answer Sheet.\n\nPlease try again or contact the system administrator.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="answer-sheet-dashboard">
      <div style={{marginBottom: '20px'}}>
        <button 
          onClick={() => navigate('/admin/examination-answer-sheets')}
          style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}
        >
          ← Back to Examination Directory
        </button>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
        <div>
          <h1 style={{margin: '0 0 10px 0', fontSize: '1.8rem'}}>Examination Answer Sheets</h1>
          {qpLoading ? (
            <SkeletonLoader lines={2} height="40px" />
          ) : qpError ? (
            <APIError error={qpError} onRetry={() => refetchQp(true)} resourceName="Paper Details" />
          ) : questionPaper ? (
            <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{fontWeight: '600', color: '#0f172a', fontSize: '1.1rem'}}>{questionPaper.exam_type} - {questionPaper.subject_name} ({questionPaper.subject_code})</div>
              <div style={{display: 'flex', gap: '15px', color: '#475569', fontSize: '0.9rem'}}>
                <span><strong>Programme:</strong> {questionPaper.course} {questionPaper.program}</span>
                <span><strong>Semester:</strong> {questionPaper.semester}</span>
                <span><strong>AY:</strong> {questionPaper.academic_year}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="as-summary-cards">
        <AnswerSheetSummaryCard title="Total Uploaded" value={total} />
        <AnswerSheetSummaryCard title="Unassigned" value={pending} />
        <AnswerSheetSummaryCard title="Assigned" value={assigned} />
        <AnswerSheetSummaryCard title="Under Evaluation" value={evaluating} />
        <AnswerSheetSummaryCard title="Moderation" value={moderation} />
        <AnswerSheetSummaryCard title="Rechecking" value={rechecking} />
        <AnswerSheetSummaryCard title="Completed" value={completed} />
        <AnswerSheetSummaryCard title="Locked" value={locked} />
      </div>

      <AnswerSheetToolbar 
        onOpenUpload={() => setShowUploadModal(true)} 
        filters={filters}
        setFilters={setFilters}
        facultyList={facultyList}
        selectedCount={selectedSheets.length}
        onBulkAssign={handleBulkAssign}
      />

      {sheetsLoading ? (
        <div style={{padding: '20px'}}>
          <SkeletonLoader lines={6} height="60px" />
        </div>
      ) : sheetsError ? (
        <APIError error={sheetsError} onRetry={() => fetchAnswerSheets(true)} resourceName="Answer Sheets" />
      ) : (
        <AnswerSheetTable 
          answerSheets={filteredSheets} 
          selectedSheets={selectedSheets}
          onSelectSheet={handleSelectSheet}
          onSelectAll={handleSelectAll}
          onSingleAssign={handleSingleAssign}
          onOpenUpload={() => setShowUploadModal(true)} 
          onLinkStudent={(sheet) => setLinkSheet(sheet)}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {showUploadModal && questionPaper && (
        <UploadAnswerBookletDialog 
          onClose={() => setShowUploadModal(false)} 
          onUploadComplete={fetchAnswerSheets}
          questionPaper={questionPaper}
          paperId={paperId}
        />
      )}

      {linkSheet && (
        <LinkStudentDialog
          sheet={linkSheet}
          onClose={() => setLinkSheet(null)}
          onLinked={() => {
            setLinkSheet(null);
            fetchAnswerSheets();
          }}
        />
      )}

      {showAssignModal && (
        <AssignFacultyDialog 
          targetSheets={assignTargetSheets}
          onClose={() => setShowAssignModal(false)}
          onAssignComplete={() => {
            setShowAssignModal(false);
            setSelectedSheets([]);
            fetchAnswerSheets();
          }}
        />
      )}

      {/* DELETE MODALS */}
      {deleteSheet && (
        <div className="link-modal-overlay">
          <div className="link-modal" style={{maxWidth: '500px', height: 'auto', padding: '20px'}}>
            <div className="link-modal-header" style={{border: 'none', padding: 0, marginBottom: '20px'}}>
              <h2 style={{color: deleteMode === 'protected' ? '#f59e0b' : '#ef4444'}}>
                {deleteMode === 'protected' ? 'Cannot Delete Record' : 'Delete Examination Answer Sheet'}
              </h2>
            </div>
            
            <div className="link-modal-body" style={{flexDirection: 'column', gap: '15px'}}>
              {deleteMode === 'protected' ? (
                <>
                  <p style={{lineHeight: '1.5', color: '#334155'}}>
                    This Examination Answer Sheet has already entered the evaluation workflow (Status: <strong>{deleteSheet.status}</strong>).
                  </p>
                  <p style={{lineHeight: '1.5', color: '#334155'}}>
                    Deletion has been disabled to protect evaluation records.
                  </p>
                  <p style={{lineHeight: '1.5', color: '#334155'}}>
                    If this booklet was uploaded incorrectly, an administrator must first remove it from the evaluation workflow or archive it.
                  </p>
                  <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                    <button className="as-btn as-btn-primary" onClick={() => setDeleteSheet(null)}>Understood</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem'}}>
                    <div style={{marginBottom: '10px'}}>
                      <span style={{color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Student</span>
                      <strong>{deleteSheet.student_name || 'Unlinked'}</strong>
                    </div>
                    <div style={{marginBottom: '10px'}}>
                      <span style={{color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Question Paper</span>
                      {deleteSheet.exam_type}<br/>
                      {deleteSheet.subject}<br/>
                      Sem {deleteSheet.semester} • {deleteSheet.academic_year}
                    </div>
                    <div>
                      <span style={{color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'}}>PDF</span>
                      {deleteSheet.original_filename || 'Unknown'}
                    </div>
                  </div>
                  
                  <div style={{marginTop: '10px', color: '#ef4444', background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca'}}>
                    <strong>This will permanently delete:</strong>
                    <ul style={{marginTop: '8px', paddingLeft: '20px', marginBottom: '8px'}}>
                      <li>the uploaded PDF</li>
                      <li>its database record</li>
                      <li>any OCR information linked to it</li>
                    </ul>
                    This action cannot be undone.
                  </div>
                  
                  <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button className="as-btn as-btn-secondary" disabled={isDeleting} onClick={() => setDeleteSheet(null)}>Cancel</button>
                    <button 
                      className="as-btn" 
                      style={{backgroundColor: '#ef4444', color: 'white', border: 'none'}} 
                      disabled={isDeleting}
                      onClick={confirmDelete}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnswerSheetDashboard;
