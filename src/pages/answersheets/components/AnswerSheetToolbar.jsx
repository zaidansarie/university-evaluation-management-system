import React from 'react';

function AnswerSheetToolbar({ onOpenUpload }) {
  return (
    <div className="as-toolbar">
      <div className="as-toolbar-left">
        <input 
          type="text" 
          placeholder="Search by Roll Number, Student Name, Candidate Code, or Paper..." 
          style={{padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '450px'}}
        />
      </div>
      <div className="as-toolbar-right">
        <button className="as-btn as-btn-secondary" onClick={() => alert("Bulk Assign feature coming in Phase 5.4")}>
          Assign Faculty
        </button>
        <button className="as-btn as-btn-secondary" onClick={onOpenUpload}>
          Upload Single
        </button>
        <button className="as-btn as-btn-primary" onClick={onOpenUpload}>
          + Bulk Upload Booklets
        </button>
      </div>
    </div>
  );
}

export default AnswerSheetToolbar;
