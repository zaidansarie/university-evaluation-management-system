import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../AdminDashboard.css';

function StudentRecheckingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const studentId = 1; // Assuming 1 for demo
      const response = await fetch(`http://localhost:5000/api/students/${studentId}/rechecking/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }
      const data = await response.json();
      setRequestData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ padding: '24px 32px', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
        <div className="loading-spinner">Loading request details...</div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="admin-dashboard" style={{ padding: '24px 32px', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <button className="btn-secondary" onClick={() => navigate('/student/rechecking')}>
            Back to Dashboard
          </button>
        </div>
        <div className="error-message">
          {error || 'Request not found.'}
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'Under Evaluation': return 'status-under-eval';
      case 'Pending Finalization': return 'status-pending-final';
      case 'Revision Requested': return 'status-revision';
      case 'Completed': return 'status-completed';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getTimelineStages = () => {
    const stages = [
      { id: 'submitted', label: 'Submitted', active: true },
      { id: 'assigned', label: 'Assigned', active: ['Assigned', 'Under Evaluation', 'Pending Finalization', 'Completed', 'Revision Requested'].includes(requestData.status) },
      { id: 'under_review', label: 'Under Review', active: ['Under Evaluation', 'Pending Finalization', 'Completed', 'Revision Requested'].includes(requestData.status) },
      { id: 'pending_final', label: 'Pending Finalization', active: ['Pending Finalization', 'Completed'].includes(requestData.status) },
      { id: 'completed', label: 'Completed', active: requestData.status === 'Completed' }
    ];

    if (requestData.status === 'Rejected') {
       return [
         { id: 'submitted', label: 'Submitted', active: true },
         { id: 'rejected', label: 'Rejected', active: true }
       ];
    }
    
    return stages;
  };

  const timelineStages = getTimelineStages();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const percentage = requestData.original_marks !== null && requestData.total_marks 
                    ? ((requestData.original_marks / requestData.total_marks) * 100) : null;
  const grade = percentage !== null 
                    ? (percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F') 
                    : 'N/A';

  return (
    <div className="admin-dashboard" style={{ padding: '32px 40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button 
            onClick={() => navigate('/student/rechecking')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, marginBottom: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
            <span>←</span> Back to Requests
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>Request #{requestData.request_id}</h1>
            <span className={`status-badge ${getStatusBadgeClass(requestData.status)}`} style={{ padding: '6px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>
              {requestData.status}
            </span>
          </div>
          
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            {requestData.subject_name}
          </h2>
          
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>{requestData.examination}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>Semester {requestData.semester}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>{requestData.academic_year}</span>
            <span style={{ margin: '0 8px', width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></span>
            <span style={{ fontWeight: '500' }}>Applied on: {formatDate(requestData.applied_date)}</span>
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }} className="rechecking-grid">
        
        {/* LEFT COLUMN: 65% on Desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* REQUEST INFO */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3b82f6' }}>ℹ️</span> Request Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Subject</div>
                <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>{requestData.subject_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Subject Code</div>
                <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>{requestData.subject_code}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Examination</div>
                <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>{requestData.examination}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Semester</div>
                <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>{requestData.semester}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Academic Year</div>
                <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>{requestData.academic_year}</div>
              </div>
            </div>
          </div>

          {/* ORIGINAL EVALUATION */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#8b5cf6' }}>📊</span> Original Evaluation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Marks Obtained</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#334155' }}>
                  {requestData.original_marks !== null ? parseFloat(requestData.original_marks).toFixed(2) : 'N/A'}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Percentage</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#334155' }}>
                  {percentage !== null ? percentage.toFixed(1) + '%' : 'N/A'}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Grade</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#334155' }}>{grade}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Maximum Marks</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#94a3b8' }}>
                  {requestData.total_marks || '100'}
                </div>
              </div>
            </div>
          </div>

          {/* STUDENT REQUEST */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>📝</span> Student Request
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Rechecking</div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '8px', color: '#334155', borderLeft: '4px solid #94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>
                  {requestData.reason}
                </div>
              </div>
              {requestData.remarks && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Additional Remarks</div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '8px', color: '#334155', borderLeft: '4px solid #94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>
                    {requestData.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FACULTY INFORMATION */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>👨‍🏫</span> Faculty Information
            </h3>
            {requestData.faculty_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {requestData.faculty_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.1rem' }}>{requestData.faculty_name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>Assigned Evaluator • Assigned on {formatDate(requestData.assigned_on)}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                Faculty has not been assigned to this request yet.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 35% on Desktop (Sticky) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
          
          {/* TIMELINE */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#6366f1' }}>⏱️</span> Rechecking Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
              {timelineStages.map((stage, index) => {
                const isLast = index === timelineStages.length - 1;
                return (
                  <div key={stage.id} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: isLast ? '0' : '32px' }}>
                    
                    {/* Vertical Connector */}
                    {!isLast && (
                      <div style={{ position: 'absolute', left: '11px', top: '28px', bottom: '0', width: '2px', backgroundColor: stage.active && timelineStages[index+1].active ? '#3b82f6' : '#e2e8f0', zIndex: 0 }}></div>
                    )}
                    
                    {/* Circle Node */}
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: stage.active ? (stage.id === 'completed' || stage.id === 'rejected' ? '#10b981' : '#3b82f6') : '#f8fafc',
                      border: stage.active ? 'none' : '2px solid #cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff', fontSize: '12px', zIndex: 1,
                      boxShadow: stage.active ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                      flexShrink: 0
                    }}>
                      {stage.active ? (stage.id === 'rejected' ? '✖' : '✔') : ''}
                    </div>
                    
                    {/* Content */}
                    <div style={{ paddingTop: '2px' }}>
                      <div style={{ fontWeight: stage.active ? '600' : '500', color: stage.active ? '#1e293b' : '#94a3b8', fontSize: '0.95rem' }}>
                        {stage.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECHECKING RESULT (If Completed) */}
          {requestData.status === 'Completed' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>🏆</span> Rechecking Result
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Original</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#475569' }}>
                    {parseFloat(requestData.original_marks).toFixed(2)}
                  </div>
                </div>
                
                <div style={{ color: '#94a3b8', fontSize: '1.5rem', padding: '0 16px' }}>➔</div>
                
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Revised</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981' }}>
                    {parseFloat(requestData.revised_marks).toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                {parseFloat(requestData.revised_marks) > parseFloat(requestData.original_marks) ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>↑</span> Marks Increased
                  </div>
                ) : parseFloat(requestData.revised_marks) < parseFloat(requestData.original_marks) ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>↓</span> Marks Reduced
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>=</span> No Change
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REQUEST STATUS */}
          <div style={{ 
            backgroundColor: requestData.status === 'Completed' ? '#10b981' : requestData.status === 'Rejected' ? '#ef4444' : '#ffffff',
            borderRadius: '12px', padding: '32px 24px', 
            color: (requestData.status === 'Completed' || requestData.status === 'Rejected') ? '#ffffff' : '#1e293b',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            {requestData.status === 'Completed' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: '700' }}>Rechecking Completed</h3>
                <div style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 12px', borderRadius: '6px' }}>Result Updated</div>
                <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5' }}>
                  Student result has been updated successfully.
                </p>
              </div>
            ) : requestData.status === 'Rejected' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: '700' }}>Request Rejected</h3>
                <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5' }}>
                  This request has been reviewed and rejected.
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</span> Request in Progress
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6' }}>
                  Your request is currently being processed by the examination department. You will be notified once the evaluation is complete.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .rechecking-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

export default StudentRecheckingDetails;
