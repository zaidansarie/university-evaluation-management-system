import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';
import QuestionCard from './QuestionCard';

function SectionCard({ section, questions }) {
  const { setFilters } = useBuilder();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const secMarks = questions.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
  
  let bloomCounts = { Remember:0, Understand:0, Apply:0, Analyze:0, Evaluate:0, Create:0 };
  let diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach(q => {
    if(q.q_data.blooms_level) bloomCounts[q.q_data.blooms_level]++;
    if(q.q_data.difficulty_level) diffCounts[q.q_data.difficulty_level]++;
  });
  const totalQs = questions.length || 1;
  const getPct = (val) => Math.round((val / totalQs) * 100);

  return (
    <div className="section-container" style={{background:'white', borderRadius:'8px', padding:'15px', marginBottom:'15px', border:'1px solid #e2e8f0'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={{background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#64748b'}}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
          <h3 style={{margin:0, color:'#1e293b'}}>{section.name}</h3>
        </div>
        <span style={{fontWeight:'bold', color: secMarks === section.total_marks ? '#10b981' : '#ef4444'}}>
          Marks: {secMarks}/{section.total_marks}
        </span>
      </div>
      
      {!isCollapsed && (
        <>
          {questions.length > 0 && (
            <div className="section-live-stats" style={{fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px'}}>
              <div style={{display:'flex', gap:'10px'}}>
                <span style={{fontWeight:'bold', color:'#64748b'}}>Diff:</span>
                <span style={{color: '#166534'}}>E {getPct(diffCounts.Easy)}%</span>
                <span style={{color: '#854d0e'}}>M {getPct(diffCounts.Medium)}%</span>
                <span style={{color: '#991b1b'}}>H {getPct(diffCounts.Hard)}%</span>
              </div>
              <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <span style={{fontWeight:'bold', color:'#64748b'}}>Bloom:</span>
                <span>R {getPct(bloomCounts.Remember)}%</span>
                <span>U {getPct(bloomCounts.Understand)}%</span>
                <span>Ap {getPct(bloomCounts.Apply)}%</span>
                <span>An {getPct(bloomCounts.Analyze)}%</span>
                <span>E {getPct(bloomCounts.Evaluate)}%</span>
                <span>C {getPct(bloomCounts.Create)}%</span>
              </div>
            </div>
          )}

          {section.config?.instructions && <p style={{fontStyle:'italic', color:'#64748b', margin:'0 0 10px 5px', fontSize:'0.8rem'}}>{section.config.instructions}</p>}
          
          <Droppable droppableId={section.client_id}>
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                style={{minHeight: '40px'}}
              >
                {questions.length === 0 && (
                  <div style={{color:'#94a3b8', textAlign:'center', padding:'15px', border:'1px dashed #cbd5e1', borderRadius:'6px', background:'#f8fafc', fontSize:'0.85rem'}}>
                    Drop questions here
                  </div>
                )}
                
                {questions.map((q, index) => (
                  <QuestionCard 
                    key={q.client_id} 
                    question={q} 
                    index={index} 
                    isOr={q.optional_group_id && index > 0 && questions[index-1].optional_group_id === q.optional_group_id} 
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {secMarks < section.total_marks && (
            <div className="smart-suggestion" style={{marginTop: '10px'}}>
              💡 Need {section.total_marks - secMarks} more marks.
              <button className="btn-add" style={{marginLeft:'10px'}} onClick={() => setFilters(prev => ({...prev, marks: (section.total_marks - secMarks).toString()}))}>Find Questions</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SectionCard;
