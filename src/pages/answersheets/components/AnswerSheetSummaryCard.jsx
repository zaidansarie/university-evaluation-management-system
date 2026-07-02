import React from 'react';

function AnswerSheetSummaryCard({ title, value }) {
  return (
    <div className="as-summary-card">
      <span className="as-summary-title">{title}</span>
      <span className="as-summary-value">{value}</span>
    </div>
  );
}

export default AnswerSheetSummaryCard;
