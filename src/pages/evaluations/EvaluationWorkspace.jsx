import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import PDFViewer from '../../components/common/PDFViewer';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './EvaluationWorkspace.css';

function EvaluationWorkspace() {
  const { sessionId } = useParams();
  const { data: sessionData, loading, error, refetch } = useApiData(`/api/evaluations/session/${sessionId}`);

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

  return (
    <div className="evaluation-workspace-container">
      {/* HEADER */}
      <div className="workspace-header">
        <div className="workspace-breadcrumb">
          <Link to="/admin/evaluation">Evaluation Dashboard</Link> &gt; <span>Session {sessionId}</span>
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
            <span className={`status-badge ${session?.status?.toLowerCase().replace(' ', '-') || 'draft'}`}>
              {session?.status || 'Draft'}
            </span>
          </div>
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
                        <div className="form-group">
                          <label>Awarded Marks</label>
                          <input 
                            type="number" 
                            className="marks-input" 
                            disabled 
                            placeholder="--"
                          />
                        </div>
                        <div className="form-group">
                          <label>Remarks (Optional)</label>
                          <textarea 
                            className="remarks-input" 
                            disabled 
                            placeholder="Enter remarks..."
                            rows="2"
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
            Total Awarded: <strong>0</strong> / {paper?.total_marks || '--'}
          </div>
          <div className="footer-actions">
            <button className="as-btn as-btn-secondary" disabled>Save Draft</button>
            <button className="as-btn as-btn-primary" disabled>Complete Evaluation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationWorkspace;
