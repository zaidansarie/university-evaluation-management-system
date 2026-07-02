import React, { useMemo } from 'react';
import { useBuilder } from '../BuilderContext';

function ReplaceQuestionDialog() {
  const { 
    isReplaceModalOpen, setReplaceModalOpen, replaceTargetClient, 
    paperQuestions, availableQuestions, replaceQuestion 
  } = useBuilder();

  const targetQ = useMemo(() => {
    return paperQuestions.find(pq => pq.client_id === replaceTargetClient)?.q_data;
  }, [paperQuestions, replaceTargetClient]);

  const usedQuestionIds = new Set(paperQuestions.map(pq => pq.question_id));

  const eligibleQuestions = useMemo(() => {
    if (!targetQ) return [];
    return availableQuestions.filter(q => {
      // Compatibility Rules
      if (usedQuestionIds.has(q.id)) return false;
      if (q.marks !== targetQ.marks) return false;
      if (q.subject_id !== targetQ.subject_id) return false;
      if (q.unit !== targetQ.unit) return false;
      if (q.question_type !== targetQ.question_type) return false;
      if (q.difficulty_level !== targetQ.difficulty_level) return false;
      
      // We can be a bit loose on Bloom, but strict on others to preserve Blueprint
      return true;
    });
  }, [availableQuestions, targetQ, usedQuestionIds]);

  if (!isReplaceModalOpen || !targetQ) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{width: '700px', maxWidth:'90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
        <div className="modal-header">
          <h3>Replace Question</h3>
          <button className="btn-remove" onClick={() => setReplaceModalOpen(false)}>Close</button>
        </div>
        <div className="modal-body" style={{flex: 1, overflowY: 'auto'}}>
          <div className="target-summary" style={{background: '#f1f5f9', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>
            <strong>Replacing:</strong> {targetQ.question_code} | {targetQ.marks}M | {targetQ.unit} | {targetQ.question_type} | {targetQ.difficulty_level}
          </div>
          
          <p>Showing unused questions matching exact Unit, Marks, Type, and Difficulty.</p>
          
          <div className="modal-scroll-area">
            {eligibleQuestions.map(q => (
              <div key={q.id} className="adv-question-card" style={{cursor:'pointer'}} onClick={() => replaceQuestion(replaceTargetClient, q)}>
                <div className="adv-q-header">
                  <span className="q-code">{q.question_code}</span>
                  <span className="q-marks">{q.marks} M</span>
                </div>
                <div className="q-text">{q.question_text}</div>
                <div className="adv-q-meta-grid">
                  <div><b>Bloom:</b> {q.blooms_level}</div>
                </div>
                <div style={{marginTop:'10px', textAlign:'right'}}>
                  <button className="btn-add">Select as Replacement</button>
                </div>
              </div>
            ))}
            {eligibleQuestions.length === 0 && (
              <div style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No eligible replacements found matching the blueprint constraints.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplaceQuestionDialog;
