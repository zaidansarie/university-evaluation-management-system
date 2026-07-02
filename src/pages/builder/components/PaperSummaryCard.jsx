import React from 'react';
import { useBuilder } from '../BuilderContext';

function PaperSummaryCard() {
  const { paper, paperQuestions } = useBuilder();

  const liveTotalMarks = paperQuestions.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
  
  let bloomCounts = { Remember:0, Understand:0, Apply:0, Analyze:0, Evaluate:0, Create:0 };
  let diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  
  paperQuestions.forEach(pq => {
    if(pq.q_data.blooms_level) bloomCounts[pq.q_data.blooms_level]++;
    if(pq.q_data.difficulty_level) diffCounts[pq.q_data.difficulty_level]++;
  });

  const totalQs = paperQuestions.length || 1; // avoid div/0
  const getPct = (val) => Math.round((val / totalQs) * 100);

  return (
    <div className="paper-summary-card">
      <div className="summary-item">
        <span className="summary-label">Marks</span>
        <span className={`summary-value ${liveTotalMarks === paper.total_marks ? 'valid' : 'invalid'}`}>
          {liveTotalMarks} / {paper.total_marks}
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Selected</span>
        <span className="summary-value">{paperQuestions.length} Qs</span>
      </div>
      
      <div className="summary-item dist-block" style={{flex: 2}}>
        <span className="summary-label">Difficulty & Bloom</span>
        <div style={{fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <div><b>Diff:</b> E {getPct(diffCounts.Easy)}% &nbsp; M {getPct(diffCounts.Medium)}% &nbsp; H {getPct(diffCounts.Hard)}%</div>
          <div><b>Bloom:</b> {Object.keys(bloomCounts).length > 0 ? `${Object.values(bloomCounts).filter(v=>v>0).length}/6 covered` : '0/6 covered'}</div>
        </div>
      </div>
    </div>
  );
}

export default PaperSummaryCard;
