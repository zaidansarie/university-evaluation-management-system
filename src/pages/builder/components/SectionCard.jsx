import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';
import QuestionCard from './QuestionCard';

function SectionCard({ section, questions }) {
  const { setFilters } = useBuilder();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const secMarks = questions.reduce((sum, q) => sum + (q?.q_data?.marks || 0), 0);
  const isComplete = secMarks === section.total_marks;
  
  let bloomCounts = { Remember:0, Understand:0, Apply:0, Analyze:0, Evaluate:0, Create:0 };
  let diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach(q => {
    if(q?.q_data?.blooms_level) bloomCounts[q.q_data.blooms_level]++;
    if(q?.q_data?.difficulty_level) diffCounts[q.q_data.difficulty_level]++;
  });
  const totalQs = questions.length || 1;
  const getPct = (val) => Math.round((val / totalQs) * 100);

  return (
    <div style={{ background: '#fff', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      
      {/* Section Header */}
      <div 
        style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isComplete ? '#f8fafc' : '#fff', cursor: 'pointer', borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{section.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: isComplete ? '#10b981' : '#f59e0b', fontWeight: '600', background: isComplete ? '#d1fae5' : '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>
            {secMarks} / {section.total_marks} Marks
          </span>
        </div>
      </div>
      
      {!isCollapsed && (
        <div style={{ padding: '20px', background: '#fff' }}>
          
          {/* Section Info / Instructions */}
          {section?.config?.instructions && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderLeft: '3px solid #cbd5e1', color: '#475569', fontSize: '0.85rem', borderRadius: '0 4px 4px 0' }}>
              <i>{section.config.instructions}</i>
            </div>
          )}
          
          {/* Live Stats */}
          {questions.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', color: '#64748b', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>Difficulty:</span>
                <span style={{ color: '#166534' }}>E {getPct(diffCounts.Easy)}%</span>
                <span style={{ color: '#854d0e' }}>M {getPct(diffCounts.Medium)}%</span>
                <span style={{ color: '#991b1b' }}>H {getPct(diffCounts.Hard)}%</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>Bloom's:</span>
                <span>R {getPct(bloomCounts.Remember)}%</span>
                <span>U {getPct(bloomCounts.Understand)}%</span>
                <span>Ap {getPct(bloomCounts.Apply)}%</span>
                <span>An {getPct(bloomCounts.Analyze)}%</span>
                <span>E {getPct(bloomCounts.Evaluate)}%</span>
                <span>C {getPct(bloomCounts.Create)}%</span>
              </div>
            </div>
          )}
          
          {/* Droppable Area */}
          <Droppable droppableId={section.client_id}>
            {(provided, snapshot) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                style={{ 
                  minHeight: '80px', 
                  borderRadius: '8px', 
                  background: snapshot.isDraggingOver ? '#f1f5f9' : 'transparent',
                  transition: 'background 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {questions.length === 0 && (
                  <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', border: '2px dashed #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📥</span>
                    Drop questions here from the Question Bank
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

          {/* Suggestion */}
          {secMarks < section.total_marks && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#eff6ff', borderRadius: '8px', color: '#1e3a8a', fontSize: '0.85rem' }}>
              <span>💡 You need <strong>{section.total_marks - secMarks}</strong> more marks to complete this section.</span>
              <button 
                style={{ background: '#fff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                onClick={() => setFilters(prev => ({...prev, marks: (section.total_marks - secMarks).toString()}))}
              >
                Find {section.total_marks - secMarks}M Questions
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default SectionCard;
