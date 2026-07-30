import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';

function QuestionCard({ question, index, isOr }) {
  const { 
    removeQuestion, 
    openReplaceModal, 
    openInternalChoiceModal, 
    unlinkInternalChoice 
  } = useBuilder();

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {isOr && (
        <div style={{ textAlign: 'center', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>
      )}
      
      <Draggable draggableId={question.client_id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              background: '#fff',
              border: `1px solid ${question.optional_group_id ? '#93c5fd' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
              position: 'relative',
              display: 'flex',
              gap: '12px'
            }}
          >
            {/* Drag Handle */}
            <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#cbd5e1', paddingTop: '2px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </div>
            
            {/* Question Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                  Q{index + 1}. <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '4px' }}>{question.q_data.question_code}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.9rem', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                  {question.q_data.marks} M
                </div>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {question.q_data.question_text}
              </div>
              
              {question.q_data.question_type === 'MCQ' && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0' }}>
                  {question.q_data.option_a && <div>A. {question.q_data.option_a}</div>}
                  {question.q_data.option_b && <div>B. {question.q_data.option_b}</div>}
                  {question.q_data.option_c && <div>C. {question.q_data.option_c}</div>}
                  {question.q_data.option_d && <div>D. {question.q_data.option_d}</div>}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
              
              {showMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '180px', zIndex: 20, overflow: 'hidden', padding: '4px 0' }}>
                    
                    <button 
                      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      onClick={() => { openReplaceModal(question.client_id); setShowMenu(false); }}
                    >
                      <span style={{ marginRight: '8px' }}>🔄</span> Replace
                    </button>

                    {!question.optional_group_id ? (
                      <button 
                        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={() => { openInternalChoiceModal(question.client_id); setShowMenu(false); }}
                      >
                        <span style={{ marginRight: '8px' }}>🔀</span> Add "OR" Choice
                      </button>
                    ) : (
                      <button 
                        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.85rem', color: '#d97706', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={() => { unlinkInternalChoice(question.client_id); setShowMenu(false); }}
                      >
                        <span style={{ marginRight: '8px' }}>✂️</span> Remove "OR"
                      </button>
                    )}

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                    
                    <button 
                      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.85rem', color: '#ef4444', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      onClick={() => { removeQuestion(question.client_id); setShowMenu(false); }}
                    >
                      <span style={{ marginRight: '8px' }}>🗑️</span> Remove
                    </button>

                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </Draggable>
    </div>
  );
}

export default QuestionCard;
