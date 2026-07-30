import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBuilder } from '../BuilderContext';

function QuestionBankPanel() {
  const { 
    availableQuestions, filters, setFilters, 
    currentPage, setCurrentPage, questionsPerPage,
    paperQuestions, addQuestion, sections 
  } = useBuilder();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState({ id: null, style: {} });

  const usedQuestionIds = new Set(paperQuestions.map(pq => pq.question_id));
  const uniqueUnits = [...new Set(availableQuestions.map(q => q.unit))].filter(Boolean);
  const uniqueMarks = [...new Set(availableQuestions.map(q => q.marks))].filter(Boolean).sort((a,b)=>a-b);

  const filteredQuestions = useMemo(() => {
    let result = availableQuestions.filter(q => {
      if (filters.search && !q.question_text.toLowerCase().includes(filters.search.toLowerCase()) && !q.question_code.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.unit && q.unit !== filters.unit) return false;
      if (filters.difficulty && q.difficulty_level !== filters.difficulty) return false;
      if (filters.bloom && q.blooms_level !== filters.bloom) return false;
      if (filters.type && q.question_type !== filters.type) return false;
      if (filters.marks && q.marks?.toString() !== filters.marks) return false;
      if (filters.status && q.status !== filters.status) return false;
      if (filters.usage === 'used' && !usedQuestionIds.has(q.id)) return false;
      if (filters.usage === 'unused' && usedQuestionIds.has(q.id)) return false;
      return true;
    });

    switch (filters.sortBy) {
      case 'Unit': result.sort((a,b) => (a.unit || '').localeCompare(b.unit || '')); break;
      case 'Difficulty': 
        const diffRank = { Easy: 1, Medium: 2, Hard: 3 };
        result.sort((a,b) => (diffRank[a.difficulty_level] || 0) - (diffRank[b.difficulty_level] || 0)); 
        break;
      case 'Marks': result.sort((a,b) => (a.marks || 0) - (b.marks || 0)); break;
      case 'Question Code': result.sort((a,b) => (a.question_code || '').localeCompare(b.question_code || '')); break;
      case 'Newest':
      default:
        result.sort((a,b) => b.id - a.id);
        break;
    }
    return result;
  }, [availableQuestions, filters, usedQuestionIds]);

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);

  const clearFilters = () => {
    setFilters({ search: '', unit: '', difficulty: '', bloom: '', type: '', marks: '', status: '', usage: '', sortBy: 'Newest' });
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({...prev, [field]: value}));
    setCurrentPage(1);
  };

  const inputStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', width: '100%', outline: 'none', boxSizing: 'border-box' };
  const badgeStyle = { padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' };

  const getDiffColor = (level) => {
    if (level === 'Easy') return { bg: '#dcfce7', text: '#166534' };
    if (level === 'Medium') return { bg: '#fef9c3', text: '#854d0e' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const getDiffAbbr = (level) => {
    if (level === 'Easy') return 'E';
    if (level === 'Medium') return 'M';
    if (level === 'Hard') return 'H';
    return level;
  };

  const getBloomAbbr = (level) => {
    const map = { 'Remember': 'R', 'Understand': 'U', 'Apply': 'Ap', 'Analyze': 'An', 'Evaluate': 'E', 'Create': 'C' };
    return map[level] || level;
  };

  const formatUnit = (code, unit) => {
    const match = code?.match(/-U(\d+)-/i);
    if (match) return `Unit ${match[1]}`;
    const unitMatch = unit?.match(/\b(\d+)\b/);
    if (unitMatch) return `Unit ${unitMatch[1]}`;
    return unit;
  };

  return (
    <div style={{ flex: '0.8', minWidth: '380px', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      
      {/* Header & Basic Filters */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Question Bank</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{filteredQuestions.length} Results</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search code or text..." 
              value={filters.search} 
              onChange={e => handleFilterChange('search', e.target.value)} 
              style={{ ...inputStyle, paddingLeft: '32px' }} 
            />
          </div>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', flexShrink: 0,
              border: '1px solid #e2e8f0', background: isFiltersExpanded ? '#f1f5f9' : '#fff', 
              borderRadius: '6px', cursor: 'pointer', color: '#475569', transition: 'background-color 0.2s'
            }}
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            title="More Filters"
            onMouseEnter={e => e.currentTarget.style.background = isFiltersExpanded ? '#e2e8f0' : '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = isFiltersExpanded ? '#f1f5f9' : '#fff'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {isFiltersExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select value={filters.unit} onChange={e => handleFilterChange('unit', e.target.value)} style={inputStyle}>
                <option value="">All Units</option>
                {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={filters.difficulty} onChange={e => handleFilterChange('difficulty', e.target.value)} style={inputStyle}>
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
              </select>
              <select value={filters.bloom} onChange={e => handleFilterChange('bloom', e.target.value)} style={inputStyle}>
                <option value="">All Bloom's</option>
                <option value="Remember">Remember</option><option value="Understand">Understand</option>
                <option value="Apply">Apply</option><option value="Analyze">Analyze</option>
                <option value="Evaluate">Evaluate</option><option value="Create">Create</option>
              </select>
              <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} style={inputStyle}>
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option><option value="Short Answer">Short</option>
                <option value="Long Answer">Long</option><option value="Numerical">Num</option>
              </select>
              <select value={filters.marks} onChange={e => handleFilterChange('marks', e.target.value)} style={inputStyle}>
                <option value="">All Marks</option>
                {uniqueMarks.map(m => <option key={m} value={m}>{m} Marks</option>)}
              </select>
              <select value={filters.usage} onChange={e => handleFilterChange('usage', e.target.value)} style={inputStyle}>
                <option value="">All Usage</option>
                <option value="unused">Unused Only</option><option value="used">Used Only</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <select value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)} style={{ ...inputStyle, width: 'auto', border: 'none', background: 'transparent', padding: '4px' }}>
                <option value="Newest">Sort: Newest</option>
                <option value="Unit">Sort: Unit</option>
                <option value="Difficulty">Sort: Difficulty</option>
                <option value="Marks">Sort: Marks</option>
              </select>
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Clear All</button>
            </div>
          </div>
        )}
      </div>

      {/* Question List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc' }}>
        {paginatedQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
            <div>No questions found matching your criteria.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedQuestions.map(q => {
              const isUsed = usedQuestionIds.has(q.id);
              const diffStyle = getDiffColor(q.difficulty_level);
              
              return (
                <div key={q.id} style={{ background: '#fff', border: `1px solid ${isUsed ? '#cbd5e1' : '#e2e8f0'}`, borderRadius: '8px', padding: '15px', position: 'relative', opacity: isUsed ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {q.question_code}
                      {isUsed && <span style={{ ...badgeStyle, background: '#f1f5f9', color: '#64748b' }}>Used</span>}
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.9rem' }}>
                      {q.marks} M
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {q.question_text}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ ...badgeStyle, background: diffStyle.bg, color: diffStyle.text }}>{getDiffAbbr(q.difficulty_level)}</span>
                      <span style={{ ...badgeStyle, background: '#f3e8ff', color: '#7e22ce' }}>{getBloomAbbr(q.blooms_level)}</span>
                      {q.unit && <span style={{ ...badgeStyle, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{formatUnit(q.question_code, q.unit)}</span>}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => {
                          if (activeDropdown.id === q.id) {
                            setActiveDropdown({ id: null, style: {} });
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          const dropdownHeight = Math.min(sections.length * 35 + 40, 250);
                          const spaceBelow = window.innerHeight - rect.bottom;
                          let style = { position: 'fixed', right: window.innerWidth - rect.right, zIndex: 99999 };
                          
                          if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                            style.bottom = window.innerHeight - rect.top + 4;
                          } else {
                            style.top = rect.bottom + 4;
                          }
                          setActiveDropdown({ id: q.id, style });
                        }}
                        style={{ width: '28px', height: '28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '1.2rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
                        title="Add to Section"
                      >
                        +
                      </button>
                      
                      {activeDropdown.id === q.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={() => setActiveDropdown({ id: null, style: {} })} />
                          {createPortal(
                            <div style={{ ...activeDropdown.style, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '150px', overflow: 'hidden' }}>
                              <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>SELECT SECTION</div>
                              {sections.map(s => (
                                <button 
                                  key={s.client_id}
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                  onMouseEnter={e => e.target.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.target.style.background = 'none'}
                                  onClick={() => {
                                    if (isUsed && !window.confirm('This question is already in the paper. Add again?')) {
                                      setActiveDropdown({ id: null, style: {} });
                                      return;
                                    }
                                    addQuestion(q, s.client_id);
                                    setActiveDropdown({ id: null, style: {} });
                                  }}
                                >
                                  {s.name}
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', background: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionBankPanel;
