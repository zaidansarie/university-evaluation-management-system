import React from 'react';
import QuestionPreview from './QuestionPreview';
import MCQPreview from './MCQPreview';

function InternalChoicePreview({ group }) {
  return (
    <div className="internal-choice-group">
      {group.map((q, index) => (
        <React.Fragment key={q.id}>
          {index > 0 && (
            <div className="internal-choice-or">OR</div>
          )}
          
          <div className="question-preview">
            <div className="question-number">
              Q{group[0].order_num}{index > 0 ? String.fromCharCode(64 + index) : ''}.
            </div>
            
            <div className="question-body">
              <div className="question-text">
                {q.question_text}
              </div>
              {q.question_type === 'MCQ' && (
                <MCQPreview question={q} />
              )}
            </div>

            <div className="question-marks">
              [{q.marks}]
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default InternalChoicePreview;
