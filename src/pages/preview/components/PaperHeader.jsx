import React from 'react';

function PaperHeader({ paper }) {
  return (
    <div className="paper-header-container">
      <div className="paper-header">
        <div className="paper-header-uni">
          <div className="uni-logo-placeholder"></div>
          <h1>UNIVERSITY NAME</h1>
        </div>
        
        <h2>{paper.exam_type} {paper.academic_year}</h2>
      </div>
      
      {/* Horizontal separator below the header */}
      <hr className="paper-divider" />

      <div className="paper-meta-grid">
        <div className="paper-meta-item">
          <span className="paper-meta-label">Programme:</span>
          <span className="paper-meta-value">{paper.program}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Course:</span>
          <span className="paper-meta-value">{paper.course}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Semester:</span>
          <span className="paper-meta-value">{paper.semester}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Subject:</span>
          <span className="paper-meta-value">{paper.paper_title}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Duration:</span>
          <span className="paper-meta-value">--</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Maximum Marks:</span>
          <span className="paper-meta-value">{paper.total_marks}</span>
        </div>
      </div>

      {/* Horizontal separator below the exam information */}
      <hr className="paper-divider" />

      <div className="paper-instructions">
        <h3>General Instructions</h3>
        <ul>
          <li>The question paper contains multiple sections. Attempt accordingly.</li>
          <li>Write all answers clearly in the provided answer sheet.</li>
          <li>Programmable calculators are not allowed unless specified.</li>
        </ul>
      </div>
      
      {/* Separator to close the instructions section */}
      <hr className="paper-divider" />
    </div>
  );
}

export default PaperHeader;
