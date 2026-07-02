import React, { useMemo } from 'react';
import { useBuilder } from '../BuilderContext';

function QuestionBankPanel() {
  const { 
    availableQuestions, filters, setFilters, 
    currentPage, setCurrentPage, questionsPerPage,
    paperQuestions, addQuestion, sections 
  } = useBuilder();

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

    // Sorting
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
        // Assuming higher ID means newer if created_at isn't strictly sortable here
        result.sort((a,b) => b.id - a.id);
        break;
    }
    return result;
  }, [availableQuestions, filters, usedQuestionIds]);

  // Pagination
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

  // Stats
  let mcqCount = 0, shortCount = 0, longCount = 0, numCount = 0;
  availableQuestions.forEach(q => {
    if (q.question_type === 'MCQ') mcqCount++;
    else if (q.question_type === 'Short Answer') shortCount++;
    else if (q.question_type === 'Long Answer') longCount++;
    else if (q.question_type === 'Numerical') numCount++;
  });

  const [isFiltersExpanded, setIsFiltersExpanded] = React.useState(false);

  return (
    <div className="panel no-print" style={{flex: '0.9', minWidth: '350px'}}>
      <div className="panel-header" style={{flexDirection:'column', alignItems:'stretch', gap:'10px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>Question Bank ({filteredQuestions.length} Results)</span>
          <button className="btn-back" style={{padding:'4px 8px', fontSize:'0.8rem'}} onClick={clearFilters}>Clear Filters</button>
        </div>
        <div className="stats-bar-mini">
          <span>Total: {availableQuestions.length}</span>
          <span>MCQ: {mcqCount}</span>
          <span>Short: {shortCount}</span>
          <span>Long: {longCount}</span>
        </div>
      </div>
      
      <div className="panel-filters-advanced">
        <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
          <input type="text" placeholder="Search Code/Text..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} style={{flex:1}} />
          <button className="btn-move" style={{padding:'4px 8px'}} onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}>
            {isFiltersExpanded ? 'Less Filters ▲' : 'More Filters ▼'}
          </button>
        </div>
        
        <div className="filter-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
          <select value={filters.unit} onChange={e => handleFilterChange('unit', e.target.value)}>
            <option value="">All Units</option>
            {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          
          <select value={filters.difficulty} onChange={e => handleFilterChange('difficulty', e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
          </select>

          <select value={filters.bloom} onChange={e => handleFilterChange('bloom', e.target.value)}>
            <option value="">All Bloom's</option>
            <option value="Remember">Remember</option><option value="Understand">Understand</option>
            <option value="Apply">Apply</option><option value="Analyze">Analyze</option>
            <option value="Evaluate">Evaluate</option><option value="Create">Create</option>
          </select>

          <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option><option value="Short Answer">Short Answer</option>
            <option value="Long Answer">Long Answer</option><option value="Numerical">Numerical</option>
          </select>
        </div>

        {isFiltersExpanded && (
          <div className="filter-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <select value={filters.marks} onChange={e => handleFilterChange('marks', e.target.value)}>
              <option value="">All Marks</option>
              {uniqueMarks.map(m => <option key={m} value={m}>{m} Marks</option>)}
            </select>

            <select value={filters.usage} onChange={e => handleFilterChange('usage', e.target.value)}>
              <option value="">All Usage</option>
              <option value="unused">Show Only Unused</option><option value="used">Show Only Used</option>
            </select>

            <select value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}>
              <option value="Newest">Sort By: Newest</option>
              <option value="Unit">Sort By: Unit</option>
              <option value="Difficulty">Sort By: Difficulty</option>
              <option value="Marks">Sort By: Marks</option>
              <option value="Question Code">Sort By: Question Code</option>
            </select>
          </div>
        )}
      </div>

      <div className="panel-content">
        {paginatedQuestions.map(q => {
          const isUsed = usedQuestionIds.has(q.id);
          return (
            <div key={q.id} className={`adv-question-card ${isUsed ? 'used' : ''}`}>
              <div className="adv-q-header">
                <span className="q-code">{q.question_code} {isUsed && <span className="badge-used">Used</span>}</span>
                <span className="q-marks">{q.marks} M</span>
              </div>
              <div className="q-text">{q.question_text}</div>
              <div className="adv-q-meta-grid">
                <span className="badge-unit" style={{background:'#e0f2fe', color:'#0369a1', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem'}}><b>Unit:</b> {q.unit}</span>
                <span className="badge-type" style={{background:'#f3e8ff', color:'#7e22ce', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem'}}><b>Type:</b> {q.question_type}</span>
                <span className={`badge-diff ${q.difficulty_level === 'Easy' ? 'badge-easy' : q.difficulty_level === 'Medium' ? 'badge-med' : 'badge-hard'}`} style={{padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem'}}><b>Diff:</b> {q.difficulty_level}</span>
                <span className="badge-bloom" style={{background:'#ffedd5', color:'#c2410c', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem'}}><b>Bloom:</b> {q.blooms_level}</span>
              </div>
              <div className="q-actions">
                <span style={{fontSize:'0.8rem', color:'#64748b'}}>Add to Section:</span>
                {sections.map(s => (
                  <button 
                    key={s.client_id} 
                    className="btn-add" 
                    style={{padding:'4px 8px'}} 
                    onClick={() => {
                      if (isUsed) {
                        if (!window.confirm('This question is already in the paper. Add again?')) return;
                      }
                      addQuestion(q, s.client_id);
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        
        {filteredQuestions.length === 0 && <div style={{textAlign:'center', color:'#94a3b8', marginTop:'20px'}}>No questions match filters.</div>}
        
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionBankPanel;
