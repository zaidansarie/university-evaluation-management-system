import React, { useMemo } from 'react';
import { useBuilder } from '../BuilderContext';

function InternalChoiceDialog() {
  const { 
    isInternalChoiceModalOpen, setInternalChoiceModalOpen, internalChoiceTargetClient, 
    paperQuestions, availableQuestions, createInternalChoice 
  } = useBuilder();

  const targetQ = useMemo(() => {
    return paperQuestions.find(pq => pq.client_id === internalChoiceTargetClient)?.q_data;
  }, [paperQuestions, internalChoiceTargetClient]);

  const usedQuestionIds = new Set(paperQuestions.map(pq => pq.question_id));

  const eligibleQuestions = useMemo(() => {
    if (!targetQ) return [];
    return availableQuestions.filter(q => {
      if (usedQuestionIds.has(q.id)) return false;
      // Internal choice must have exactly same marks
      if (q.marks !== targetQ.marks) return false;
      // Ideally same unit and difficulty, but we allow more flexibility than Replace
      return true;
    });
  }, [availableQuestions, targetQ, usedQuestionIds]);

  if (!isInternalChoiceModalOpen || !targetQ) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{width: '700px', maxWidth:'90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
        <div className="modal-header">
          <h3>Create Internal Choice (OR)</h3>
          <button className="btn-remove" onClick={() => setInternalChoiceModalOpen(false)}>Close</button>
        </div>
        <div className="modal-body" style={{flex: 1, overflowY: 'auto'}}>
          <div className="target-summary" style={{background: '#f1f5f9', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>
            <strong>Target:</strong> {targetQ.question_code} | {targetQ.marks}M
          </div>
          
          <p>Showing unused questions matching exactly <b>{targetQ.marks} Marks</b>.</p>
          
          <div className="modal-scroll-area">
            {eligibleQuestions.map(q => (
              <div key={q.id} className="adv-question-card" style={{cursor:'pointer'}} onClick={() => createInternalChoice(internalChoiceTargetClient, q)}>
                <div className="adv-q-header">
                  <span className="q-code">{q.question_code}</span>
                  <span className="q-marks">{q.marks} M</span>
                </div>
                <div className="q-text">{q.question_text}</div>
                <div className="adv-q-meta-grid">
                  <div><b>Unit:</b> {q.unit}</div>
                  <div><b>Type:</b> {q.question_type}</div>
                  <div><b>Difficulty:</b> {q.difficulty_level}</div>
                </div>
                <div style={{marginTop:'10px', textAlign:'right'}}>
                  <button className="btn-add">Select as OR</button>
                </div>
              </div>
            ))}
            {eligibleQuestions.length === 0 && (
              <div style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No eligible questions found for {targetQ.marks} marks.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternalChoiceDialog;
