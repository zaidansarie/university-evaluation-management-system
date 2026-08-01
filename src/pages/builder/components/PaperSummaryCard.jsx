import React from 'react';
import { useBuilder } from '../BuilderContext';

function PaperSummaryCard() {
  const { paper, paperQuestions } = useBuilder();

  const liveTotalMarks = paperQuestions.reduce((sum, q) => sum + (q?.q_data?.marks || 0), 0);
  const isValidMarks = liveTotalMarks === paper?.total_marks;
  
  let bloomCounts = { Remember:0, Understand:0, Apply:0, Analyze:0, Evaluate:0, Create:0 };
  let diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  
  paperQuestions.forEach(pq => {
    if(pq?.q_data?.blooms_level) bloomCounts[pq.q_data.blooms_level]++;
    if(pq?.q_data?.difficulty_level) diffCounts[pq.q_data.difficulty_level]++;
  });

  const totalQs = paperQuestions.length || 1; 
  const getPct = (val) => Math.round((val / totalQs) * 100);
  const bloomCoverage = Object.values(bloomCounts).filter(v => v > 0).length;

  const StatBlock = ({ label, value, subtext, isValid }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 15px', borderRight: '1px solid #e2e8f0', minWidth: '120px' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isValid === false ? '#ef4444' : (isValid === true ? '#10b981' : '#0f172a') }}>{value}</span>
      {subtext && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext}</span>}
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <StatBlock 
          label="Total Marks" 
          value={`${liveTotalMarks} / ${paper?.total_marks || 0}`} 
          isValid={isValidMarks} 
        />
        <StatBlock 
          label="Questions" 
          value={paperQuestions.length} 
        />
        <div style={{ padding: '0 15px', display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Difficulty</span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              <span style={{ color: '#166534' }}>E {getPct(diffCounts.Easy)}%</span>
              <span style={{ color: '#854d0e' }}>M {getPct(diffCounts.Medium)}%</span>
              <span style={{ color: '#991b1b' }}>H {getPct(diffCounts.Hard)}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Bloom's</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>{bloomCoverage}/6 Covered</span>
          </div>
        </div>
      </div>
      
      {!isValidMarks && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', background: '#fef3c7', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
          <span>⚠️</span> Target marks not met
        </div>
      )}
    </div>
  );
}

export default PaperSummaryCard;
