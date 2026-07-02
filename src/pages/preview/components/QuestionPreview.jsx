import React from 'react';
import MCQPreview from './MCQPreview';

function QuestionPreview({ question }) {
  return (
    <div className="question-preview">
      <div className="question-number">
        Q{question.order_num}.
      </div>
      
      <div className="question-body">
        <div className="question-text">
          {question.question_text}
        </div>
        
        {question.question_type === 'MCQ' && (
          <MCQPreview question={question} />
        )}
      </div>

      <div className="question-marks">
        [{question.marks}]
      </div>
    </div>
  );
}

export default QuestionPreview;
