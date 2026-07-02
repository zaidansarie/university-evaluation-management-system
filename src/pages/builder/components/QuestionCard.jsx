import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';

function QuestionCard({ question, index, isOr }) {
  const { 
    removeQuestion, 
    openReplaceModal, 
    openInternalChoiceModal, 
    unlinkInternalChoice 
  } = useBuilder();

  return (
    <div style={{position: 'relative'}}>
      {isOr && (
        <div style={{textAlign:'center', fontWeight:'bold', color:'#3b82f6', margin:'5px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
          <hr style={{flex:1, borderColor:'#bfdbfe'}}/> 
          <span className="or-badge">OR Pair</span>
          <hr style={{flex:1, borderColor:'#bfdbfe'}}/>
        </div>
      )}
      
      <Draggable draggableId={question.client_id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`question-card draggable ${snapshot.isDragging ? 'dragging' : ''}`}
            style={{
              ...provided.draggableProps.style,
              borderColor: question.optional_group_id ? '#93c5fd' : '#e2e8f0', 
              margin:'5px 0', 
              background: 'white'
            }}
          >
            <div className="q-header">
              <span className="q-code" {...provided.dragHandleProps} style={{cursor: 'grab'}}>
                <span style={{color:'#94a3b8', marginRight:'8px'}}>≡</span>
                Q{index + 1}. {question.q_data.question_code}
              </span>
              <span className="q-marks">{question.q_data.marks} M</span>
            </div>
            
            <div className="q-text">
              <div style={{ whiteSpace: 'pre-wrap' }}>{question.q_data.question_text}</div>
              {question.q_data.question_type === 'MCQ' && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '10px' }}>
                  {question.q_data.option_a && <div>A. {question.q_data.option_a}</div>}
                  {question.q_data.option_b && <div>B. {question.q_data.option_b}</div>}
                  {question.q_data.option_c && <div>C. {question.q_data.option_c}</div>}
                  {question.q_data.option_d && <div>D. {question.q_data.option_d}</div>}
                </div>
              )}
            </div>
            
            <div className="q-actions" style={{justifyContent: 'flex-start', flexWrap:'wrap', marginTop:'10px'}}>
              <button className="btn-move" style={{color:'#059669', borderColor:'#a7f3d0'}} onClick={() => openReplaceModal(question.client_id)}>
                Replace Question
              </button>

              {!question.optional_group_id && (
                <button className="btn-move" style={{color:'#2563eb', borderColor:'#bfdbfe'}} onClick={() => openInternalChoiceModal(question.client_id)}>
                  + Create Internal Choice
                </button>
              )}
              
              {question.optional_group_id && (
                <button className="btn-move" style={{color:'#d97706', borderColor:'#fde68a'}} onClick={() => unlinkInternalChoice(question.client_id)}>
                  Remove Internal Choice
                </button>
              )}
              
              <button className="btn-remove" style={{marginLeft:'auto'}} onClick={() => removeQuestion(question.client_id)}>Remove</button>
            </div>
          </div>
        )}
      </Draggable>
    </div>
  );
}

export default QuestionCard;
