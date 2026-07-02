import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from '../BuilderContext';

function BuilderToolbar() {
  const navigate = useNavigate();
  const { 
    paper, undo, redo, canUndo, canRedo, savePaper, setAutoGenerateModalOpen 
  } = useBuilder();

  return (
    <div className="builder-header no-print">
      <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
        <h2 style={{margin:0, fontSize:'1.1rem', color:'#1e293b'}}>Builder: {paper.paper_title}</h2>
        <div className="paper-meta" style={{fontSize:'0.8rem', color:'#64748b'}}>
          Sem {paper.semester} • AY {paper.academic_year} • {paper.program} • {paper.total_marks} Marks • {paper.num_sections} Sections
        </div>
      </div>
      <div className="builder-actions">
        <div className="history-actions">
          <button className="btn-icon" onClick={undo} disabled={!canUndo} title="Undo">↩️</button>
          <button className="btn-icon" onClick={redo} disabled={!canRedo} title="Redo">↪️</button>
        </div>
        
        {/* Phase 2: Auto Generate Paper */}
        <button className="btn-back" style={{color:'#2563eb', background:'#dbeafe'}} onClick={() => setAutoGenerateModalOpen(true)}>Auto Generate</button>
        <button className="btn-move" title="Preview Paper" onClick={() => navigate(`/admin/question-papers/${paper.id}/preview`)}>Preview</button>
        
        <button className="btn-back" onClick={() => navigate('/admin/question-papers')}>Exit</button>
        <button className="btn-save" onClick={savePaper}>Save Paper</button>
      </div>
    </div>
  );
}

export default BuilderToolbar;
