import React from 'react';

function PaperHeader({ paper }) {
  return (
    <div className="paper-header">
      <div className="paper-header-uni">
        {/* Reserved space for Logo */}
        <div style={{width: '60px', height: '60px', flexShrink: 0}}></div>
        <h1>UNIVERSITY NAME</h1>
      </div>
      
      <h2>{paper.exam_type} {paper.academic_year}</h2>
      
      <div className="paper-meta-grid">
        <div className="paper-meta-item">
          <span className="paper-meta-label">Programme:</span>
          <span>{paper.program}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Course:</span>
          <span>{paper.course}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Semester:</span>
          <span>{paper.semester}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Subject:</span>
          <span>{paper.paper_title}</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Duration:</span>
          <span>--</span>
        </div>
        <div className="paper-meta-item">
          <span className="paper-meta-label">Maximum Marks:</span>
          <span>{paper.total_marks}</span>
        </div>
      </div>

      <div className="paper-instructions">
        <h3>General Instructions</h3>
        <ul>
          <li>The question paper contains multiple sections. Attempt accordingly.</li>
          <li>Write all answers clearly in the provided answer sheet.</li>
          <li>Programmable calculators are not allowed unless specified.</li>
        </ul>
      </div>
    </div>
  );
}

export default PaperHeader;
