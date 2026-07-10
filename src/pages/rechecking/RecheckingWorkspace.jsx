import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import './Rechecking.css';
import PDFViewer from '../../components/common/PDFViewer';

function RecheckingWorkspace() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // local state for evaluation input
  const [scores, setScores] = useState({});

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetchWithHandling(`http://localhost:5000/api/rechecking/${requestId}`);
        setRequest(res);
        
        // initialize scores
        const initialScores = {};
        res.questions.forEach(q => {
          initialScores[q.id] = {
            revised_mark: q.revised_mark !== null ? q.revised_mark : q.original_mark,
            remarks: q.remarks || ''
          };
        });
        setScores(initialScores);
      } catch (err) {
        console.error('Failed to fetch request:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  const handleScoreChange = (qId, field, value) => {
    setScores(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        [field]: value
      }
    }));
  };

  const calculateTotal = () => {
    let sum = 0;
    Object.values(scores).forEach(s => {
      const val = parseFloat(s.revised_mark);
      if (!isNaN(val)) sum += val;
    });
    return sum.toFixed(2);
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit these revised marks?')) return;
    
    setSubmitting(true);
    try {
      const marksArray = Object.keys(scores).map(qId => {
        const q = request.questions.find(x => x.id === parseInt(qId));
        return {
          question_id: parseInt(qId),
          original_mark: q.original_mark,
          revised_mark: parseFloat(scores[qId].revised_mark) || 0,
          remarks: scores[qId].remarks
        };
      });
      
      const payload = {
        marks: marksArray,
        total_marks: calculateTotal()
      };
      
      await fetchWithHandling(`http://localhost:5000/api/rechecking/${requestId}/evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      alert('Re-evaluation submitted successfully!');
      navigate('/faculty/rechecking');
    } catch (err) {
      console.error('Submission failed:', err);
      alert(err.message || 'Failed to submit re-evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm('Are you sure you want to finalize these marks and update the student results?')) return;
    
    setSubmitting(true);
    try {
      await fetchWithHandling(`http://localhost:5000/api/rechecking/${requestId}/finalize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      alert('Re-evaluation finalized successfully!');
      navigate('/admin/rechecking');
    } catch (err) {
      console.error('Finalization failed:', err);
      alert(err.message || 'Failed to finalize re-evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading workspace...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!request) return <div style={{ padding: '20px' }}>Request not found.</div>;

  const isAdmin = window.location.pathname.includes('/admin');
  const isReadOnly = isAdmin || request.status === 'Completed' || request.status === 'Rejected' || request.status === 'Pending Finalization';

  return (
    <div className="workspace-container">
      <div className="viewer-section">
        <div className="viewer-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>
              Rechecking: {request.student_name} ({request.roll_number})
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {request.paper_title} | Reason: {request.reason}
            </div>
          </div>
          <button className="btn-outline" onClick={() => navigate(isAdmin ? '/admin/rechecking' : '/faculty/rechecking')}>
            Exit Workspace
          </button>
        </div>
        
        {/* We use the DocumentViewer from Evaluation Phase */}
        <div style={{ flex: 1, position: 'relative' }}>
          {request.files && request.files.length > 0 ? (
            <PDFViewer pdfUrl={`http://localhost:5000/uploads/${request.files[0].file_path.split(/[\\/]/).pop()}`} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No answer sheet file available.
            </div>
          )}
        </div>
      </div>
      
      <div className="scoring-section">
        <div className="scoring-header">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Re-evaluation Marks</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
            <span>Original Total: <strong>{request.original_marks}</strong></span>
            <span>Revised Total: <strong>{calculateTotal()}</strong> / {request.max_marks}</span>
          </div>
        </div>
        
        <div className="scoring-body">
          {request.questions.map(q => (
            <div key={q.id} className="question-score-card">
              <h4>
                <span>Q{q.question_number}</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>Max: {q.max_marks}</span>
              </h4>
              <p style={{ fontSize: '13px', color: '#1e293b', margin: '0 0 12px 0' }}>{q.question_text}</p>
              
              <div className="score-inputs">
                <div className="score-input-group" style={{ flex: 0.4 }}>
                  <label>Original</label>
                  <input type="number" value={q.original_mark} disabled />
                </div>
                <div className="score-input-group" style={{ flex: 0.6 }}>
                  <label>Revised Mark</label>
                  <input 
                    type="number" 
                    min="0" max={q.max_marks} step="0.5"
                    value={scores[q.id]?.revised_mark ?? ''}
                    onChange={(e) => handleScoreChange(q.id, 'revised_mark', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              <div className="score-input-group">
                <label>Remarks</label>
                <input 
                  type="text" 
                  placeholder="Reason for change..."
                  value={scores[q.id]?.remarks ?? ''}
                  onChange={(e) => handleScoreChange(q.id, 'remarks', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="scoring-footer">
          {isAdmin ? (
            request.status === 'Pending Finalization' ? (
              <button 
                className="btn-success" 
                style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
                onClick={handleFinalize}
                disabled={submitting}
              >
                {submitting ? 'Finalizing...' : 'Finalize Marks & Update Results'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', color: '#64748b' }}>
                {request.status === 'Completed' ? 'Rechecking Completed & Finalized' : `Status: ${request.status}`}
              </div>
            )
          ) : (
            <button 
              className="btn-success" 
              style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
              onClick={handleSubmit}
              disabled={submitting || isReadOnly}
            >
              {isReadOnly ? (request.status === 'Pending Finalization' ? 'Pending Admin Finalization' : 'Rechecking Completed') : (submitting ? 'Submitting...' : 'Submit Re-evaluation')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecheckingWorkspace;
