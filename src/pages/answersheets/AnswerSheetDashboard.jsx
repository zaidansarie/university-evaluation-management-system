import React, { useState, useEffect } from 'react';
import './AnswerSheets.css';
import AnswerSheetToolbar from './components/AnswerSheetToolbar';
import AnswerSheetSummaryCard from './components/AnswerSheetSummaryCard';
import AnswerSheetTable from './components/AnswerSheetTable';
import UploadAnswerBookletDialog from './components/UploadAnswerBookletDialog';
import LinkStudentDialog from './components/LinkStudentDialog';
import { useParams, useNavigate } from 'react-router-dom';

function AnswerSheetDashboard() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkSheet, setLinkSheet] = useState(null); // Which sheet needs manual linking
  const [deleteSheet, setDeleteSheet] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null); // 'confirm' or 'protected'
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (paperId) {
      fetchQuestionPaper();
      fetchAnswerSheets();
    }
  }, [paperId]);

  const fetchQuestionPaper = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/question-papers/${paperId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestionPaper(data);
      }
    } catch (err) {
      console.error('Failed to fetch question paper details', err);
    }
  };

  const fetchAnswerSheets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/answer-sheets?paper_id=${paperId}`);
      if (res.ok) {
        const data = await res.json();
        setAnswerSheets(data);
      }
    } catch (err) {
      console.error('Failed to fetch answer sheets', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const total = answerSheets.length;
  const assigned = answerSheets.filter(s => s.status === 'Assigned').length;
  const evaluating = answerSheets.filter(s => s.status === 'Under Evaluation').length;
  const moderation = answerSheets.filter(s => s.status === 'Moderation').length;
  const rechecking = answerSheets.filter(s => s.status === 'Rechecking').length;
  const completed = answerSheets.filter(s => s.status === 'Completed').length;
  const locked = answerSheets.filter(s => s.status === 'Locked').length;
  const pending = total - (assigned + evaluating + moderation + rechecking + completed + locked);

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
          {questionPaper && (
            <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{fontWeight: '600', color: '#0f172a', fontSize: '1.1rem'}}>{questionPaper.exam_type} - {questionPaper.subject_name} ({questionPaper.subject_code})</div>
              <div style={{display: 'flex', gap: '15px', color: '#475569', fontSize: '0.9rem'}}>
                <span><strong>Programme:</strong> {questionPaper.course} {questionPaper.program}</span>
                <span><strong>Semester:</strong> {questionPaper.semester}</span>
                <span><strong>AY:</strong> {questionPaper.academic_year}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="as-summary-cards">
        <AnswerSheetSummaryCard title="Total Uploaded" value={total} />
        <AnswerSheetSummaryCard title="Pending Assignment" value={pending} />
        <AnswerSheetSummaryCard title="Assigned" value={assigned} />
        <AnswerSheetSummaryCard title="Under Evaluation" value={evaluating} />
        <AnswerSheetSummaryCard title="Moderation" value={moderation} />
        <AnswerSheetSummaryCard title="Rechecking" value={rechecking} />
        <AnswerSheetSummaryCard title="Completed" value={completed} />
        <AnswerSheetSummaryCard title="Locked" value={locked} />
      </div>

      <AnswerSheetToolbar onOpenUpload={() => setShowUploadModal(true)} />

      {loading ? (
        <div style={{padding: '40px', textAlign: 'center'}}>Loading data...</div>
      ) : (
        <AnswerSheetTable 
          answerSheets={answerSheets} 
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
