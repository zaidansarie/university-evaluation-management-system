import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from '../BuilderContext';

function BuilderToolbar() {
  const navigate = useNavigate();
  const { 
    paper, undo, redo, canUndo, canRedo, savePaper, setAutoGenerateModalOpen 
  } = useBuilder();
  const [showInfo, setShowInfo] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="builder-header no-print" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '15px 30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left Side: Title & Info Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '600' }}>{paper.paper_title}</h2>
          <button 
            onClick={() => setShowInfo(!showInfo)} 
            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {showInfo ? 'Hide Details ▲' : 'Show Details ▼'}
          </button>
        </div>

        {/* Right Side: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid #e2e8f0', paddingRight: '12px' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.4 }} onClick={undo} disabled={!canUndo} title="Undo">↩️</button>
            <button style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.4 }} onClick={redo} disabled={!canRedo} title="Redo">↪️</button>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button 
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              title="Help / Abbreviations"
            >
              ⓘ
            </button>
            
            {isHelpOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setIsHelpOpen(false)} />
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '280px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 30, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Abbreviations Help</h4>
                    <button onClick={() => setIsHelpOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#94a3b8', cursor: 'pointer' }}>×</button>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    <h5 style={{ margin: '0 0 6px 0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Difficulty Distribution</h5>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', color: '#64748b' }}>
                      <li><strong>Easy</strong> = Easy Difficulty</li>
                      <li><strong>Medium</strong> = Medium Difficulty</li>
                      <li><strong>Hard</strong> = Hard Difficulty</li>
                    </ul>

                    <h5 style={{ margin: '0 0 6px 0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Bloom's Taxonomy</h5>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', color: '#64748b' }}>
                      <li><strong>R</strong> = Remember</li>
                      <li><strong>U</strong> = Understand</li>
                      <li><strong>Ap</strong> = Apply</li>
                      <li><strong>An</strong> = Analyze</li>
                      <li><strong>E</strong> = Evaluate</li>
                      <li><strong>C</strong> = Create</li>
                    </ul>
                    
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                      These indicators help maintain the required difficulty distribution and Bloom's Taxonomy coverage while creating a balanced examination paper.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <button style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => navigate('/admin/question-papers')}>
            Exit
          </button>
          
          <button style={{ padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', color: '#1d4ed8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setAutoGenerateModalOpen(true)}>
            <span>⚡</span> Auto Generate
          </button>
          
          <button style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => navigate(`/admin/question-papers/${paper.id}/preview`)}>
            Preview
          </button>
          
          <button style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }} onClick={savePaper}>
            Save Paper
          </button>
        </div>
      </div>

      {/* Expandable Paper Info Panel */}
      {showInfo && (
        <div style={{ display: 'flex', gap: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569' }}>
          <div><strong>Subject:</strong> {paper.subject}</div>
          <div><strong>Semester:</strong> {paper.semester}</div>
          <div><strong>Academic Year:</strong> {paper.academic_year}</div>
          <div><strong>Program:</strong> {paper.program}</div>
          <div><strong>Target Marks:</strong> {paper.total_marks}</div>
          <div><strong>Sections:</strong> {paper.num_sections}</div>
        </div>
      )}

    </div>
  );
}

export default BuilderToolbar;
