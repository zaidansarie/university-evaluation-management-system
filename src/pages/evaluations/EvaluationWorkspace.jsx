import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import { fetchWithHandling } from '../../utils/api';
import PDFViewer from '../../components/common/PDFViewer';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './EvaluationWorkspace.css';

function EvaluationWorkspace() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { data: sessionData, loading, error, refetch } = useApiData(`/api/evaluations/session/${sessionId}`);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const dashboardLink = isAdmin ? '/admin/evaluation' : '/faculty/dashboard';

  const [marksState, setMarksState] = useState({});
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [sessionStatus, setSessionStatus] = useState('Draft');
  const autoSaveTimer = useRef(null);

  // Initialize state once data loads
  useEffect(() => {
    if (sessionData && Object.keys(marksState).length === 0) {
      const initialMarks = {};
      sessionData.existingMarks?.forEach(m => {
        initialMarks[m.question_id] = {
          marks_awarded: m.marks_awarded !== null ? m.marks_awarded : '',
          remarks: m.remarks || ''
        };
      });
      setMarksState(initialMarks);
      setSessionStatus(sessionData.session?.status || 'Draft');
    }
  }, [sessionData, marksState]);

  if (loading) {
    return (
      <div className="evaluation-workspace-container">
        <div style={{ padding: '20px' }}>
          <SkeletonLoader lines={1} height="60px" />
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <SkeletonLoader lines={10} height="500px" style={{ flex: 2 }} />
            <SkeletonLoader lines={10} height="500px" style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluation-workspace-container">
        <div style={{ padding: '20px' }}>
          <APIError error={error} onRetry={() => refetch(true)} resourceName="Evaluation Session" />
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const { session, paper, builderData, student, pdfUrl } = sessionData;
  const sections = builderData?.sections || [];
  const paperQuestions = builderData?.paperQuestions || [];

  // Derived calculations
  const totalQuestions = paperQuestions.length;
  const evaluatedQuestions = paperQuestions.filter(pq => {
    const val = marksState[pq.question_id]?.marks_awarded;
    return val !== undefined && val !== '' && !errors[pq.question_id];
  }).length;
  
  const progressPercent = totalQuestions > 0 ? Math.round((evaluatedQuestions / totalQuestions) * 100) : 0;
  const canComplete = totalQuestions > 0 && evaluatedQuestions === totalQuestions && Object.keys(errors).length === 0;

  const runningTotal = paperQuestions.reduce((acc, pq) => {
    const val = parseFloat(marksState[pq.question_id]?.marks_awarded);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Handlers
  const validateMarks = (val, max) => {
    if (val === '') return null; // Empty is allowed until completion
    const num = parseFloat(val);
    if (isNaN(num)) return 'Invalid number';
    if (!Number.isInteger(num)) return 'Integers only'; // As per strict rules
    if (num < 0) return 'No negative numbers';
    if (num > max) return `Cannot exceed ${max}`;
    return null;
  };

  const saveToBackend = async (currentMarks, showNotification = false, isComplete = false) => {
    setSaveStatus('Saving...');
    try {
      const payload = paperQuestions.map(pq => ({
        question_id: pq.question_id,
        section_name: sections.find(s => s.id === pq.section_id)?.section_name,
        question_number: pq.order_num,
        marks_awarded: currentMarks[pq.question_id]?.marks_awarded !== undefined ? currentMarks[pq.question_id].marks_awarded : '',
        max_marks: pq.marks,
        remarks: currentMarks[pq.question_id]?.remarks || ''
      }));

      await fetchWithHandling(`http://localhost:5000/api/evaluations/session/${sessionId}/save`, {
        method: 'POST',
        body: JSON.stringify({ marks: payload, isComplete })
      });
      
      setSaveStatus('✓ Saved');
      setSessionStatus(isComplete ? 'Evaluation Submitted' : 'In Progress');
      if (showNotification) alert(isComplete ? 'Evaluation submitted successfully!' : 'Draft saved successfully!');
      
      if (isComplete) {
        navigate(dashboardLink);
      } else {
        setTimeout(() => {
          setSaveStatus((prev) => prev === '✓ Saved' ? '' : prev);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Save Failed');
    }
  };

  const handleMarkChange = (pq, field, value) => {
    const newMarks = {
      ...marksState,
      [pq.question_id]: {
        ...marksState[pq.question_id],
        [field]: value
      }
    };
    
    if (field === 'marks_awarded') {
      const err = validateMarks(value, pq.marks);
      setErrors(prev => {
        const next = { ...prev };
        if (err) next[pq.question_id] = err;
        else delete next[pq.question_id];
        return next;
      });
    }

    setMarksState(newMarks);

    if (sessionStatus !== 'Evaluation Submitted') {
      // Debounce Save
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveToBackend(newMarks);
      }, 1000);
    }
  };

  const handleSaveDraft = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    saveToBackend(marksState, true);
  };

  const handleCompleteEvaluation = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    saveToBackend(marksState, true, true);
  };

  return (
    <div className="evaluation-workspace-container">
      {/* HEADER */}
      <div className="workspace-header">
        <div className="workspace-breadcrumb">
          <Link to={dashboardLink}>{isAdmin ? 'Evaluation Dashboard' : 'Faculty Dashboard'}</Link> &gt; <span>Session {sessionId}</span>
        </div>
        
        <div className="workspace-meta">
          <div className="meta-item">
            <span className="meta-label">Candidate Code:</span>
            <span className="meta-value">{student?.candidate_code || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Paper:</span>
            <span className="meta-value">{paper?.paper_title || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status:</span>
            <span className={`status-badge ${sessionStatus.toLowerCase().replace(' ', '-')}`}>
              {sessionStatus}
            </span>
          </div>
        </div>

        <div className="workspace-progress-container" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
            <span style={{ color: '#475569', fontWeight: '500' }}>Questions Evaluated</span>
            <span style={{ fontWeight: '700', color: '#1e293b' }}>{evaluatedQuestions} / {totalQuestions}</span>
          </div>
          <div style={{ width: '150px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }}></div>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', minWidth: '35px' }}>{progressPercent}%</span>
          {saveStatus && <span style={{ marginLeft: '15px', fontSize: '0.85rem', fontWeight: '600', color: saveStatus === 'Save Failed' ? '#ef4444' : '#10b981' }}>{saveStatus}</span>}
        </div>
      </div>

      {/* BODY */}
      <div className="workspace-body">
        {/* LEFT PANEL: PDF Viewer */}
        <div className="workspace-left-panel">
          <PDFViewer pdfUrl={pdfUrl} />
        </div>

        {/* RIGHT PANEL: Evaluation Form */}
        <div className="workspace-right-panel">
          <div className="evaluation-form-header">
            <h3>Evaluation Form</h3>
            <span className="total-marks">Max Marks: {paper?.total_marks || '--'}</span>
          </div>

          <div className="questions-container">
            {sessionStatus === 'Evaluation Submitted' && (
              <div className="alert-box alert-info" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '6px', border: '1px solid #bae6fd', fontWeight: '500' }}>
                This evaluation has already been submitted and cannot be modified.
              </div>
            )}
            
            {sections?.map(section => {
              const sectionQuestions = paperQuestions?.filter(pq => pq.section_id === section.id) || [];
              
              return (
                <div key={section.id} className="evaluation-section">
                  <h4 className="section-title">{section.section_name}</h4>
                  
                  {sectionQuestions.map((pq, index) => (
                    <div key={pq.id} className="evaluation-question-card">
                      <div className="question-card-header">
                        <span className="q-num">Q{index + 1}</span>
                        <span className="q-marks">Max: {pq.marks}</span>
                      </div>
                      
                      <div className="question-card-body">
                        <div className="q-text" style={{ marginBottom: '15px', color: '#1e293b', lineHeight: '1.5' }}>
                          {pq.question_text || 'No question text provided.'}
                        </div>
                        <div className="form-group">
                          <label>Awarded Marks</label>
                          <input 
                            type="number" 
                            className={`marks-input ${errors[pq.question_id] ? 'input-error' : ''}`}
                            placeholder="--"
                            value={marksState[pq.question_id]?.marks_awarded ?? ''}
                            onChange={(e) => handleMarkChange(pq, 'marks_awarded', e.target.value)}
                            disabled={sessionStatus === 'Evaluation Submitted'}
                          />
                          {errors[pq.question_id] && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>{errors[pq.question_id]}</span>}
                        </div>
                        <div className="form-group">
                          <label>Remarks (Optional)</label>
                          <textarea 
                            className="remarks-input" 
                            placeholder="Enter remarks..."
                            rows="2"
                            value={marksState[pq.question_id]?.remarks ?? ''}
                            onChange={(e) => handleMarkChange(pq, 'remarks', e.target.value)}
                            disabled={sessionStatus === 'Evaluation Submitted'}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            
            {(!sections || sections.length === 0) && (
              <div className="empty-state">
                <p>No sections found for this question paper.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL (Future Total Marks) */}
      <div className="workspace-footer">
        <div className="footer-content">
          <div className="running-total">
            Total Awarded: <strong>{runningTotal}</strong> / {paper?.total_marks || '--'}
          </div>
          <div className="footer-actions">
            {sessionStatus === 'Evaluation Submitted' ? (
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                This evaluation has been submitted and is locked.
              </span>
            ) : (
              <>
                <button className="as-btn as-btn-secondary" onClick={handleSaveDraft}>Save Draft</button>
                <div className="tooltip-wrapper" title={!canComplete ? "Complete all questions before submitting the evaluation." : ""}>
                  <button className="as-btn as-btn-primary" disabled={!canComplete} onClick={handleCompleteEvaluation}>Complete Evaluation</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationWorkspace;
