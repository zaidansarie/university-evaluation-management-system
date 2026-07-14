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
      // In a real app, you'd get the studentId from context/auth. Using 1 for demo.
      const studentId = 1;
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
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Request Details</h2>
        </div>
        <div className="loading-spinner">Loading request details...</div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Request Details</h2>
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Request #{requestData.request_id}</h2>
          <p className="subtitle">
            Applied Date: {formatDate(requestData.applied_date)} 
            <span className={`status-badge ${getStatusBadgeClass(requestData.status)}`} style={{marginLeft: '15px'}}>
              {requestData.status}
            </span>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/student/rechecking')}>
            Back to Rechecking Dashboard
          </button>
        </div>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Details */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card">
            <h3 className="card-title">Request Information</h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Subject</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>{requestData.subject_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Subject Code</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>{requestData.subject_code}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Examination</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>{requestData.examination}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Semester / Year</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>Sem {requestData.semester} / {requestData.academic_year}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Original Evaluation</h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Marks Obtained</span>
                <span className="detail-value" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#334155' }}>
                  {requestData.original_marks !== null ? parseFloat(requestData.original_marks).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Max Marks</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>{requestData.total_marks || '100'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Percentage</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>
                  {requestData.original_marks !== null && requestData.total_marks 
                    ? ((requestData.original_marks / requestData.total_marks) * 100).toFixed(1) + '%' 
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Grade</span>
                <span className="detail-value" style={{ fontWeight: '500' }}>
                   {requestData.original_marks !== null && requestData.total_marks 
                    ? (((requestData.original_marks / requestData.total_marks) * 100) >= 90 ? 'A+' : 
                       ((requestData.original_marks / requestData.total_marks) * 100) >= 80 ? 'A' :
                       ((requestData.original_marks / requestData.total_marks) * 100) >= 70 ? 'B' :
                       ((requestData.original_marks / requestData.total_marks) * 100) >= 60 ? 'C' : 'F')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Student Request</h3>
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>Reason for Rechecking</span>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px' }}>
                  {requestData.reason}
                </div>
              </div>
              {requestData.remarks && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>Additional Remarks</span>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px' }}>
                    {requestData.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Faculty Information</h3>
            <div style={{ marginTop: '16px' }}>
               {requestData.faculty_name ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold' }}>
                     {requestData.faculty_name.charAt(0)}
                   </div>
                   <div>
                     <div style={{ fontWeight: '500', color: '#1e293b' }}>{requestData.faculty_name}</div>
                     <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Assigned Date: {formatDate(requestData.assigned_on)}</div>
                   </div>
                 </div>
               ) : (
                 <div style={{ color: '#64748b', fontStyle: 'italic', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                   Faculty not assigned yet.
                 </div>
               )}
            </div>
          </div>

        </div>

        {/* Right Column: Timeline & Result */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card">
            <h3 className="card-title" style={{ marginBottom: '24px' }}>Rechecking Timeline</h3>
            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {timelineStages.map((stage, index) => (
                <div key={stage.id} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: index === timelineStages.length - 1 ? '0' : '32px' }}>
                  {/* Line connecting nodes */}
                  {index < timelineStages.length - 1 && (
                     <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '0', width: '2px', backgroundColor: stage.active && timelineStages[index+1].active ? '#3b82f6' : '#e2e8f0' }}></div>
                  )}
                  
                  {/* Node */}
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    backgroundColor: stage.active ? '#3b82f6' : '#fff', 
                    border: stage.active ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '12px', zIndex: 1
                  }}>
                    {stage.active ? '✔' : '○'}
                  </div>
                  
                  {/* Label */}
                  <div style={{ paddingTop: '2px' }}>
                    <div style={{ fontWeight: stage.active ? '600' : '400', color: stage.active ? '#1e293b' : '#94a3b8' }}>
                      {stage.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {requestData.status === 'Completed' && (
            <div className="dashboard-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <h3 className="card-title" style={{ color: '#166534', borderBottom: '1px solid #bbf7d0', paddingBottom: '12px', marginBottom: '16px' }}>Rechecking Result</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#166534', opacity: 0.8 }}>Original Marks</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>{parseFloat(requestData.original_marks).toFixed(2)}</div>
                </div>
                
                <div style={{ color: '#166534', fontSize: '1.5rem' }}>→</div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#166534', opacity: 0.8 }}>Revised Marks</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>{parseFloat(requestData.revised_marks).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '6px', fontWeight: '500', color: '#166534' }}>
                {parseFloat(requestData.revised_marks) > parseFloat(requestData.original_marks) 
                  ? 'Marks Increased' 
                  : parseFloat(requestData.revised_marks) < parseFloat(requestData.original_marks)
                    ? 'Marks Decreased'
                    : 'No Change After Rechecking'}
              </div>
            </div>
          )}

          <div className="dashboard-card" style={{ textAlign: 'center' }}>
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Action</h3>
            {requestData.status === 'Completed' ? (
              <div style={{ color: '#16a34a', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>✔</span> Completed Successfully
              </div>
            ) : requestData.status === 'Rejected' ? (
              <div style={{ color: '#dc2626', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>✖</span> Request Rejected
              </div>
            ) : (
               <div style={{ color: '#3b82f6', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', animation: 'spin 2s linear infinite' }}>↻</span> Request in Progress
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default StudentRecheckingDetails;
