import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFViewer from '../../components/common/PDFViewer';
import '../rechecking/Rechecking.css'; // Reusing workspace styles

function StudentAnswerSheetViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const sheet = location.state?.sheet;

  if (!sheet) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h2>Answer sheet details not found.</h2>
        <button className="btn-primary" onClick={() => navigate('/student/answer-sheets')}>
          Go Back
        </button>
      </div>
    );
  }

  // Calculate percentage safely
  const obtained = sheet.marks_obtained !== null ? parseFloat(sheet.marks_obtained) : 0;
  const max = parseFloat(sheet.maximum_marks) || 1;
  const percentage = ((obtained / max) * 100).toFixed(2);

  return (
    <div className="workspace-container">
      <div className="viewer-section">
        <div className="viewer-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>
              Answer Sheet: {sheet.subject_code} - {sheet.subject_name}
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {sheet.examination} ({sheet.academic_year}) | Semester {sheet.semester}
            </div>
          </div>
          <button className="btn-outline" onClick={() => navigate('/student/answer-sheets')}>
            Back to Dashboard
          </button>
        </div>
        
        <div className="workspace-left-panel">
          {sheet.file_path ? (
            <PDFViewer pdfUrl={`http://localhost:5000/${sheet.file_path.replace(/\\/g, '/')}`} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f1f5f9', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No answer sheet PDF file available.
            </div>
          )}
        </div>
      </div>
      
      <div className="scoring-section" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="scoring-header">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Evaluation Details</h3>
        </div>
        
        <div className="scoring-body" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Subject Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
              <strong style={{ color: '#64748b' }}>Subject:</strong> <span>{sheet.subject_name}</span>
              <strong style={{ color: '#64748b' }}>Code:</strong> <span>{sheet.subject_code}</span>
              <strong style={{ color: '#64748b' }}>Examination:</strong> <span>{sheet.examination}</span>
              <strong style={{ color: '#64748b' }}>Semester:</strong> <span>{sheet.semester}</span>
              <strong style={{ color: '#64748b' }}>Academic Year:</strong> <span>{sheet.academic_year}</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Evaluation Result
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
              <strong style={{ color: '#64748b' }}>Evaluated By:</strong> <span>{sheet.faculty_name || 'N/A'}</span>
              <strong style={{ color: '#64748b' }}>Status:</strong> 
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Evaluated</span>
              <strong style={{ color: '#64748b' }}>Date:</strong> 
              <span>{sheet.evaluation_date ? new Date(sheet.evaluation_date).toLocaleDateString() : 'N/A'}</span>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 'bold', marginBottom: '5px' }}>Total Marks Obtained</div>
              <div style={{ fontSize: '32px', color: '#0369a1', fontWeight: 'bold' }}>
                {sheet.marks_obtained !== null ? sheet.marks_obtained : '--'} <span style={{ fontSize: '18px', color: '#0284c7' }}>/ {sheet.maximum_marks}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#0284c7', marginTop: '5px' }}>
                {percentage}%
              </div>
            </div>
          </div>
        </div>
        
        <div className="scoring-footer">
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
            onClick={() => navigate('/student/rechecking/create', { state: { sheet } })}
          >
            Apply for Rechecking
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentAnswerSheetViewer;
