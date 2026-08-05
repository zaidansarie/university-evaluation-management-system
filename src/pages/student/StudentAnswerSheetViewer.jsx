import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EvaluationWorkspace from '../evaluations/EvaluationWorkspace';

function StudentAnswerSheetViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const sheet = location.state?.sheet;

  if (!sheet) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h2>Answer sheet details not found.</h2>
        <button onClick={() => navigate('/student/answer-sheets')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    );
  }

  if (!sheet.session_id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h2>Evaluation details not found.</h2>
        <p>The evaluation session for this answer sheet is unavailable.</p>
        <button onClick={() => navigate('/student/answer-sheets')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    );
  }

  const customAction = (
    <button 
      style={{ padding: '10px 20px', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
      onClick={() => navigate('/student/rechecking/create', { state: { sheet } })}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
    >
      <span style={{ fontSize: '18px' }}>+</span> Apply for Rechecking
    </button>
  );

  return (
    <EvaluationWorkspace 
      providedSessionId={sheet.session_id} 
      readOnly={true} 
      backLink="/student/answer-sheets"
      customAction={customAction}
      sheetData={sheet}
    />
  );
}

export default StudentAnswerSheetViewer;
