import React from 'react';

function AnswerSheetToolbar({ 
  onOpenUpload, 
  filters, 
  setFilters
}) {
  return (
    <div className="as-toolbar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap'}}>
      <div className="as-toolbar-left" style={{display: 'flex', gap: '15px', flex: 1, minWidth: '300px'}}>
        <input 
          type="text" 
          placeholder="Search by Roll Number, Student Name, Candidate Code, or Paper..." 
          style={{padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1}}
          value={filters.searchQuery || ''}
          onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
        />
        <select 
          style={{padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white'}}
          value={filters.assignmentStatus || 'All'}
          onChange={(e) => setFilters({...filters, assignmentStatus: e.target.value})}
        >
          <option value="All">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Unassigned">Unassigned</option>
          <option value="Evaluating">Evaluating</option>
        </select>
      </div>
      <div className="as-toolbar-right" style={{display: 'flex', gap: '10px'}}>
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
