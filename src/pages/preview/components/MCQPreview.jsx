import React from 'react';

function MCQPreview({ question }) {
  // If the options are not explicitly defined in DB columns but embedded in text, 
  // they won't render here. This assumes the Phase 4 migration schema where
  // option_a, option_b, etc. are used.
  
  const hasOptions = question.option_a || question.option_b || question.option_c || question.option_d;
  
  if (!hasOptions) {
    return null; // Fallback to raw text if options are just stored in question_text
  }

  return (
    <div className="mcq-options">
      {question.option_a && (
        <div className="mcq-option">
          <span>A.</span>
          <span>{question.option_a}</span>
        </div>
      )}
      {question.option_b && (
        <div className="mcq-option">
          <span>B.</span>
          <span>{question.option_b}</span>
        </div>
      )}
      {question.option_c && (
        <div className="mcq-option">
          <span>C.</span>
          <span>{question.option_c}</span>
        </div>
      )}
      {question.option_d && (
        <div className="mcq-option">
          <span>D.</span>
          <span>{question.option_d}</span>
        </div>
      )}
    </div>
  );
}

export default MCQPreview;
