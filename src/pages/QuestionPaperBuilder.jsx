import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintableQuestionPaper from '../components/PrintableQuestionPaper';
import './QuestionPaperBuilder.css';

function QuestionPaperBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paper, setPaper] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  const [sections, setSections] = useState([]);
  const [paperQuestions, setPaperQuestions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // --- ADVANCED FILTERS STATE ---
  const [filters, setFilters] = useState({
    search: '', subject: '', unit: '', difficulty: '', bloom: '', 
    type: '', marks: '', created_by: '', status: '', usage: ''
  });

  // --- INTERNAL CHOICE (OR) MODAL STATE ---
  const [orModal, setOrModal] = useState({
    isOpen: false, sectionId: null, targetIndex: null, targetQuestionId: null, marks: null
  });

  // --- DRAG AND DROP STATE ---
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // --- PREVIEW & UI STATE ---
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSectionCollapse = (secId) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Derived Mode
  const isBlueprintMode = paperQuestions.length === 0;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const paperRes = await fetch(`http://localhost:5000/api/question-papers`);
      const allPapers = await paperRes.json();
      const currentPaper = allPapers.find(p => p.id.toString() === id);
      setPaper(currentPaper);

      if (currentPaper) {
        const qRes = await fetch(`http://localhost:5000/api/question-papers/${id}/available-questions`);
        const availQ = await qRes.json();
        setAvailableQuestions(availQ);
        
        // Auto-select unit filter if custom units are specified
        if (currentPaper.coverage_mode === 'Custom Unit Selection' && currentPaper.custom_units) {
          const units = currentPaper.custom_units.split(',').map(u => u.trim());
          if (units.length === 1) {
            setFilters(prev => ({ ...prev, unit: units[0] }));
          }
        }
      }

      const savedRes = await fetch(`http://localhost:5000/api/question-papers/${id}/builder-data`);
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        
        if (savedData.sections && savedData.sections.length > 0) {
          const loadedSections = savedData.sections.map(s => {
            let parsedConfig = {
              num_questions: 10, marks_per_question: 1, question_type: 'Mixed',
              diffDist: { Easy: 33, Medium: 33, Hard: 34 },
              bloomDist: { Remember: 16, Understand: 16, Apply: 17, Analyze: 17, Evaluate: 17, Create: 17 },
              internal_choice: 'No', optional_questions: 0, instructions: ''
            };
            if (s.config) {
              try { parsedConfig = typeof s.config === 'string' ? JSON.parse(s.config) : s.config; } 
              catch(e) {}
            }
            return {
              ...s, 
              client_id: `db_${s.id}`,
              config: parsedConfig
            };
          });
          setSections(loadedSections);
        } else if (currentPaper && currentPaper.num_sections > 0) {
          let defSec = [];
          for (let i = 0; i < currentPaper.num_sections; i++) {
            defSec.push({
              client_id: `new_${i}`,
              name: `Section ${String.fromCharCode(65 + i)}`,
              description: '',
              total_marks: Math.floor(currentPaper.total_marks / currentPaper.num_sections),
              config: {
                num_questions: 10, marks_per_question: 1, question_type: 'Mixed',
                diffDist: { Easy: 33, Medium: 33, Hard: 34 },
                bloomDist: { Remember: 16, Understand: 16, Apply: 17, Analyze: 17, Evaluate: 17, Create: 17 },
                internal_choice: 'No', optional_questions: 0, instructions: ''
              }
            });
          }
          setSections(defSec);
        }
        
        if (savedData.paperQuestions && savedData.paperQuestions.length > 0) {
          const loadedQ = savedData.paperQuestions.map(q => ({
            client_id: `db_q_${q.id}_${Date.now()}_${Math.random()}`,
            section_client_id: `db_${q.section_id}`,
            question_id: q.id,
            optional_group_id: q.optional_group_id,
            q_data: q
          }));
          setPaperQuestions(loadedQ);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleSavePaper = async () => {
    try {
      const payload = {
        sections: sections.map(s => ({ ...s, total_marks: parseInt(s.total_marks) || 0 })),
        paperQuestions: paperQuestions.map(pq => ({
          section_client_id: pq.section_client_id,
          question_id: pq.question_id,
          optional_group_id: pq.optional_group_id
        }))
      };
      
      const res = await fetch(`http://localhost:5000/api/question-papers/${id}/builder-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Question Paper saved successfully!');
        navigate('/admin/question-papers');
      } else {
        alert('Failed to save question paper.');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  const handleGenerateFullPaper = async () => {
    let currentTotal = sections.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
    if (currentTotal !== paper.total_marks) return;
    
    setGenerating(true);
    try {
      const payload = {
        sections: sections.map(s => ({ ...s, total_marks: parseInt(s.total_marks) || 0 })),
        availableQuestions
      };
      const res = await fetch(`http://localhost:5000/api/question-papers/${id}/generate-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to generate paper.');
      }
    } catch (err) {
      console.error('Error auto-generating:', err);
    }
    setGenerating(false);
  };

  const resetToBlueprint = () => {
    if(window.confirm('Are you sure? This will delete all currently generated questions and return to Blueprint mode.')) {
      setPaperQuestions([]);
    }
  };

  // --- FILTERS & STATS COMPUTATION ---
  const usedQuestionIds = new Set(paperQuestions.map(pq => pq.question_id));

  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter(q => {
      if (filters.search && !q.question_text.toLowerCase().includes(filters.search.toLowerCase()) && !q.question_code.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.subject && q.subject_id?.toString() !== filters.subject) return false;
      if (filters.unit && q.unit !== filters.unit) return false;
      if (filters.difficulty && q.difficulty_level !== filters.difficulty) return false;
      if (filters.bloom && q.blooms_level !== filters.bloom) return false;
      if (filters.type && q.question_type !== filters.type) return false;
      if (filters.marks && q.marks?.toString() !== filters.marks) return false;
      if (filters.created_by && q.created_by?.toString() !== filters.created_by) return false;
      if (filters.status && q.status !== filters.status) return false;
      if (filters.usage === 'used' && !usedQuestionIds.has(q.id)) return false;
      if (filters.usage === 'unused' && usedQuestionIds.has(q.id)) return false;
      return true;
    });
  }, [availableQuestions, filters, usedQuestionIds]);

  const uniqueUnits = [...new Set(availableQuestions.map(q => q.unit))].filter(Boolean);
  const uniqueMarks = [...new Set(availableQuestions.map(q => q.marks))].filter(Boolean).sort((a,b)=>a-b);
  
  const clearFilters = () => setFilters({
    search: '', subject: '', unit: '', difficulty: '', bloom: '', type: '', marks: '', created_by: '', status: '', usage: ''
  });

  // --- REVIEW MODE METHODS ---
  const addQuestion = (q, sectionId, insertAfterIndex = null, forceGroupId = null) => {
    if (usedQuestionIds.has(q.id) && !forceGroupId) {
      if(!window.confirm('This question is already in the paper. Add again?')) return;
    }
    const newQ = {
      client_id: `man_${Date.now()}_${Math.random()}`,
      section_client_id: sectionId,
      question_id: q.id,
      optional_group_id: forceGroupId,
      q_data: q
    };
    
    if (insertAfterIndex !== null) {
      const arr = [...paperQuestions];
      const secQs = arr.filter(pq => pq.section_client_id === sectionId);
      const targetSecClient = secQs[insertAfterIndex].client_id;
      const absoluteIdx = arr.findIndex(pq => pq.client_id === targetSecClient);
      arr.splice(absoluteIdx + 1, 0, newQ);
      setPaperQuestions(arr);
    } else {
      setPaperQuestions([...paperQuestions, newQ]);
    }
  };

  const removeQuestion = (clientId) => setPaperQuestions(paperQuestions.filter(q => q.client_id !== clientId));

  // Drag and drop for reordering
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, targetIndex, sectionClientId) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
    
    const arr = [...paperQuestions];
    const secQs = arr.filter(pq => pq.section_client_id === sectionClientId);
    
    const draggedSecQ = secQs[draggedItemIndex];
    const targetSecQ = secQs[targetIndex];
    
    const absDragIdx = arr.findIndex(pq => pq.client_id === draggedSecQ.client_id);
    const absTargetIdx = arr.findIndex(pq => pq.client_id === targetSecQ.client_id);
    
    const [movedItem] = arr.splice(absDragIdx, 1);
    // Determine new absolute index
    const newTargetIdx = arr.findIndex(pq => pq.client_id === targetSecQ.client_id);
    arr.splice(targetIndex > draggedItemIndex ? newTargetIdx + 1 : newTargetIdx, 0, movedItem);
    
    setPaperQuestions(arr);
    setDraggedItemIndex(null);
  };

  const openOrModal = (index, sectionId, q) => {
    setOrModal({
      isOpen: true,
      sectionId,
      targetIndex: index,
      targetQuestionId: q.id,
      marks: q.marks
    });
  };

  const selectOrChoice = (q) => {
    const groupId = Date.now();
    
    // First update the target question to have this group ID
    const arr = [...paperQuestions];
    const secQs = arr.filter(pq => pq.section_client_id === orModal.sectionId);
    const targetQ = secQs[orModal.targetIndex];
    
    const absIdx = arr.findIndex(pq => pq.client_id === targetQ.client_id);
    arr[absIdx].optional_group_id = groupId;
    setPaperQuestions(arr);
    
    // Add the new question right below it with the same group ID
    addQuestion(q, orModal.sectionId, orModal.targetIndex, groupId);
    setOrModal({ isOpen: false, sectionId: null, targetIndex: null, targetQuestionId: null, marks: null });
  };

  const unlinkOrChoice = (clientId) => setPaperQuestions(paperQuestions.map(pq => pq.client_id === clientId ? { ...pq, optional_group_id: null } : pq));

  // --- STATS COMPUTATION ---
  let currentConfigTotal = sections.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
  let liveTotalMarks = paperQuestions.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
  
  let allPercentagesValid = true;
  sections.forEach(sec => {
    const diffSum = Object.values(sec.config?.diffDist || {}).reduce((a, b) => a + (parseInt(b)||0), 0);
    const bloomSum = Object.values(sec.config?.bloomDist || {}).reduce((a, b) => a + (parseInt(b)||0), 0);
    if (diffSum !== 100 || bloomSum !== 100) allPercentagesValid = false;
  });
  const getSum = (distObj) => Object.values(distObj || {}).reduce((a,b) => a + (parseInt(b)||0), 0);

  // Live Stats for Header
  const diffScore = { Easy: 1, Medium: 2, Hard: 3 };
  let totalDiffWeight = 0;
  let bloomCounts = { Remember:0, Understand:0, Apply:0, Analyze:0, Evaluate:0, Create:0 };
  
  paperQuestions.forEach(pq => {
    if(pq.q_data.difficulty_level) totalDiffWeight += diffScore[pq.q_data.difficulty_level] || 2;
    if(pq.q_data.blooms_level) bloomCounts[pq.q_data.blooms_level] = (bloomCounts[pq.q_data.blooms_level] || 0) + 1;
  });
  const avgDiff = paperQuestions.length > 0 ? (totalDiffWeight / paperQuestions.length).toFixed(1) : 0;
  let diffLabel = "Medium";
  if (avgDiff < 1.6) diffLabel = "Easy";
  if (avgDiff > 2.4) diffLabel = "Hard";

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Builder...</div>;
  if (!paper) return <div>Paper not found.</div>;

  if (isPreviewMode) {
    return (
      <PrintableQuestionPaper 
        paper={paper} 
        sections={sections} 
        paperQuestions={paperQuestions} 
        onBack={() => setIsPreviewMode(false)} 
      />
    );
  }

  return (
    <div className="builder-container">
      <div className="builder-header no-print">
        <div>
          <h2>Builder: {paper.paper_title}</h2>
          <div className="paper-meta">
            {paper.course} - {paper.program} | Target Marks: {paper.total_marks} | Sections: {paper.num_sections}
          </div>
        </div>
        <div className="builder-actions">
          {!isBlueprintMode && <button className="btn-back" style={{color:'#166534', background:'#dcfce7'}} onClick={() => setIsPreviewMode(true)}>Preview Paper</button>}
          {!isBlueprintMode && <button className="btn-back" style={{color:'#dc2626', background:'#fee2e2'}} onClick={resetToBlueprint}>Reset to Blueprint</button>}
          <button className="btn-back" onClick={() => navigate('/admin/question-papers')}>Exit</button>
          <button className="btn-save" onClick={handleSavePaper}>Save Paper</button>
        </div>
      </div>

      {isBlueprintMode ? (
        // --- BLUEPRINT MODE ---
        <div className="blueprint-mode no-print">
          <div className="blueprint-header">
            <h3>Blueprint Configuration</h3>
            <div className={`validation-bar ${currentConfigTotal === paper.total_marks ? 'valid' : 'invalid'}`}>
              Allocated: {currentConfigTotal} / {paper.total_marks} Marks
              {currentConfigTotal !== paper.total_marks && <span> (Adjust section marks to match total)</span>}
            </div>
          </div>
          
          <div className="blueprint-sections">
            {sections.map((sec, idx) => {
              const conf = sec.config || {};
              const calcMarks = (parseInt(conf.num_questions) || 0) * (parseInt(conf.marks_per_question) || 0);
              const isMathValid = calcMarks === parseInt(sec.total_marks);
              const updateSectionConfig = (secId, field, value) => {
                setSections(sections.map(s => s.client_id === secId ? { ...s, config: { ...s.config, [field]: value } } : s));
              };
              const updateSectionDist = (secId, distName, key, value) => {
                setSections(sections.map(s => s.client_id === secId ? { ...s, config: { ...s.config, [distName]: { ...s.config[distName], [key]: parseInt(value) || 0 } } } : s));
              };
              const updateSectionBase = (secId, field, value) => {
                setSections(sections.map(s => s.client_id === secId ? { ...s, [field]: value } : s));
              };
              
              return (
                <div key={sec.client_id} className="blueprint-card">
                  <div className="bp-card-header">
                    <input type="text" value={sec.name} onChange={e => updateSectionBase(sec.client_id, 'name', e.target.value)} className="bp-sec-name" />
                    <div className="bp-card-marks">
                      Total Section Marks: 
                      <input type="number" value={sec.total_marks} onChange={e => updateSectionBase(sec.client_id, 'total_marks', e.target.value)} />
                    </div>
                  </div>
                  <div className="bp-card-body">
                    <div className="bp-row">
                      <div className="bp-group">
                        <label>Question Type</label>
                        <select value={conf.question_type} onChange={e => updateSectionConfig(sec.client_id, 'question_type', e.target.value)}>
                          <option value="Mixed">Mixed</option><option value="MCQ">MCQ</option><option value="Short Answer">Short Answer</option><option value="Long Answer">Long Answer</option><option value="Numerical">Numerical</option>
                        </select>
                      </div>
                      <div className="bp-group">
                        <label>Number of Questions</label>
                        <input type="number" value={conf.num_questions} onChange={e => updateSectionConfig(sec.client_id, 'num_questions', e.target.value)} />
                      </div>
                      <div className="bp-group">
                        <label>Marks per Question</label>
                        <input type="number" value={conf.marks_per_question} onChange={e => updateSectionConfig(sec.client_id, 'marks_per_question', e.target.value)} />
                      </div>
                      <div className="bp-group">
                        <label>Internal Choice</label>
                        <select value={conf.internal_choice} onChange={e => updateSectionConfig(sec.client_id, 'internal_choice', e.target.value)}>
                          <option value="No">No</option><option value="Yes">Yes</option>
                        </select>
                      </div>
                      {conf.internal_choice === 'Yes' && (
                        <div className="bp-group">
                          <label>Optional Qs</label>
                          <input type="number" value={conf.optional_questions} onChange={e => updateSectionConfig(sec.client_id, 'optional_questions', e.target.value)} />
                        </div>
                      )}
                    </div>
                    
                    <div className={`bp-validation ${isMathValid ? 'ok' : 'err'}`}>
                      Check: {conf.num_questions} Qs × {conf.marks_per_question} Marks = {calcMarks} (Target: {sec.total_marks})
                    </div>

                    <div className="bp-row">
                      <div className="bp-group full-width">
                        <label>Difficulty Distribution (%)</label>
                        <div className="dist-inputs-container">
                          {['Easy', 'Medium', 'Hard'].map(level => (
                            <div key={level} className="dist-input-box">
                              <label>{level}</label>
                              <input type="number" value={conf.diffDist?.[level] || ''} onChange={e => updateSectionDist(sec.client_id, 'diffDist', level, e.target.value)} />
                            </div>
                          ))}
                        </div>
                        <div className={`dist-validation ${getSum(conf.diffDist) === 100 ? 'valid' : 'invalid'}`}>
                          {getSum(conf.diffDist) === 100 ? '✅ Difficulty Total: 100%' : `❌ Difficulty Total: ${getSum(conf.diffDist)}% (Must equal 100%)`}
                        </div>
                      </div>
                      <div className="bp-group full-width">
                        <label>Bloom's Priorities (%)</label>
                        <div className="dist-inputs-container">
                          {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(level => (
                            <div key={level} className="dist-input-box">
                              <label>{level}</label>
                              <input type="number" value={conf.bloomDist?.[level] || ''} onChange={e => updateSectionDist(sec.client_id, 'bloomDist', level, e.target.value)} />
                            </div>
                          ))}
                        </div>
                        <div className={`dist-validation ${getSum(conf.bloomDist) === 100 ? 'valid' : 'invalid'}`}>
                          {getSum(conf.bloomDist) === 100 ? '✅ Bloom Total: 100%' : `❌ Bloom Total: ${getSum(conf.bloomDist)}% (Must equal 100%)`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bp-group full-width" style={{marginTop:'10px'}}>
                      <label>Section Instructions</label>
                      <input type="text" placeholder="e.g. Attempt any 5 questions..." value={conf.instructions} onChange={e => updateSectionConfig(sec.client_id, 'instructions', e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="blueprint-footer">
            <button 
              className="btn-generate giant" 
              onClick={handleGenerateFullPaper} 
              disabled={generating || currentConfigTotal !== paper.total_marks || !allPercentagesValid}
              title={(currentConfigTotal !== paper.total_marks || !allPercentagesValid) ? 'Cannot generate: Check validation errors above.' : 'Click to generate!'}
            >
              {generating ? 'Generating Paper...' : 'Generate Entire Question Paper'}
            </button>
            {(currentConfigTotal !== paper.total_marks || !allPercentagesValid) && (
              <p className="error-tooltip">Generate disabled: Ensure section marks and 100% distributions are valid.</p>
            )}
          </div>
        </div>
      ) : (
        // --- REVIEW MODE ---
        <div className="builder-main">
          {/* Left Panel: Question Bank */}
          <div className="panel no-print" style={{flex: '0.9', minWidth: '350px'}}>
            <div className="panel-header" style={{flexDirection:'column', alignItems:'stretch', gap:'10px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>Question Bank ({filteredQuestions.length} Results)</span>
                <button className="btn-back" style={{padding:'4px 8px', fontSize:'0.8rem'}} onClick={clearFilters}>Clear Filters</button>
              </div>
              <div className="stats-bar-mini">
                <span>Total: {availableQuestions.length}</span>
                <span>Used: {usedQuestionIds.size}</span>
                <span>Unused: {availableQuestions.length - usedQuestionIds.size}</span>
              </div>
            </div>
            
            <div className="panel-filters-advanced">
              <input type="text" placeholder="Search Code/Text..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="full-width" />
              
              <div className="filter-grid">
                <select value={filters.unit} onChange={e => setFilters({...filters, unit: e.target.value})}>
                  <option value="">All Units</option>
                  {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                
                <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})}>
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                </select>

                <select value={filters.bloom} onChange={e => setFilters({...filters, bloom: e.target.value})}>
                  <option value="">All Bloom's</option>
                  <option value="Remember">Remember</option><option value="Understand">Understand</option>
                  <option value="Apply">Apply</option><option value="Analyze">Analyze</option>
                  <option value="Evaluate">Evaluate</option><option value="Create">Create</option>
                </select>

                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                  <option value="">All Types</option>
                  <option value="MCQ">MCQ</option><option value="Short Answer">Short Answer</option>
                  <option value="Long Answer">Long Answer</option><option value="Numerical">Numerical</option>
                </select>

                <select value={filters.marks} onChange={e => setFilters({...filters, marks: e.target.value})}>
                  <option value="">All Marks</option>
                  {uniqueMarks.map(m => <option key={m} value={m}>{m} Marks</option>)}
                </select>

                <select value={filters.usage} onChange={e => setFilters({...filters, usage: e.target.value})}>
                  <option value="">All Usage</option>
                  <option value="unused">Show Only Unused</option><option value="used">Show Only Used</option>
                </select>
              </div>
            </div>

            <div className="panel-content">
              {filteredQuestions.map(q => (
                <div key={q.id} className="adv-question-card">
                  <div className="adv-q-header">
                    <span className="q-code">{q.question_code}</span>
                    <span className="q-marks">{q.marks} M</span>
                  </div>
                  <div className="q-text">{q.question_text}</div>
                  <div className="adv-q-meta-grid">
                    <div><b>Unit:</b> {q.unit}</div>
                    <div><b>Type:</b> {q.question_type}</div>
                    <div><b>Difficulty:</b> {q.difficulty_level}</div>
                    <div><b>Bloom:</b> {q.blooms_level}</div>
                    <div><b>Status:</b> {q.status}</div>
                  </div>
                  <div className="q-actions">
                    <span style={{fontSize:'0.8rem', color:'#64748b'}}>Add to Section:</span>
                    {sections.map(s => (
                      <button key={s.client_id} className="btn-add" style={{padding:'4px 8px'}} onClick={() => addQuestion(q, s.client_id)}>{s.name}</button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && <div style={{textAlign:'center', color:'#94a3b8', marginTop:'20px'}}>No questions match filters.</div>}
            </div>
          </div>

          {/* Right Panel: Current Paper Sections */}
          <div className="panel no-print" style={{flex: '1.2', background: '#f8fafc'}}>
            <div className="live-stats-header">
              <div className="live-stat-item">
                <span className="ls-label">Marks</span>
                <span className={`ls-val ${liveTotalMarks === paper.total_marks ? 'ls-green' : 'ls-red'}`}>{liveTotalMarks} / {paper.total_marks}</span>
              </div>
              <div className="live-stat-item">
                <span className="ls-label">Selected</span>
                <span className="ls-val">{paperQuestions.length} Qs</span>
              </div>
              <div className="live-stat-item">
                <span className="ls-label">Difficulty</span>
                <span className="ls-val">{diffLabel} ({avgDiff})</span>
              </div>
              <div className="live-stat-item">
                <span className="ls-label">Bloom Top</span>
                <span className="ls-val">{Object.entries(bloomCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A'}</span>
              </div>
            </div>

            <div className="panel-content" style={{padding: '15px'}}>
              {sections.map(sec => {
                const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
                const secMarks = secQs.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
                
                const isCollapsed = collapsedSections[sec.client_id];
                
                return (
                  <div key={sec.client_id} className="section-container" style={{background:'white', borderRadius:'8px', padding:'15px', marginBottom:'15px', border:'1px solid #e2e8f0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <button 
                          onClick={() => toggleSectionCollapse(sec.client_id)} 
                          style={{background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#64748b'}}
                        >
                          {isCollapsed ? '▶' : '▼'}
                        </button>
                        <h3 style={{margin:0, color:'#1e293b'}}>{sec.name}</h3>
                      </div>
                      <span style={{fontWeight:'bold', color: secMarks === sec.total_marks ? '#10b981' : '#ef4444'}}>Marks: {secMarks}/{sec.total_marks}</span>
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        {sec.config?.instructions && <p style={{fontStyle:'italic', color:'#64748b', margin:'0 0 15px 25px'}}>{sec.config.instructions}</p>}
                        
                        {secQs.length === 0 && <div style={{color:'#94a3b8', textAlign:'center', padding:'10px'}}>Empty Section</div>}
                    
                    {secQs.map((q, index) => (
                      <div key={q.client_id} style={{position: 'relative'}}>
                        {q.optional_group_id && index > 0 && secQs[index-1].optional_group_id === q.optional_group_id && (
                          <div style={{textAlign:'center', fontWeight:'bold', color:'#3b82f6', margin:'5px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                            <hr style={{flex:1, borderColor:'#bfdbfe'}}/> 
                            <span className="or-badge">OR Pair</span>
                            <hr style={{flex:1, borderColor:'#bfdbfe'}}/>
                          </div>
                        )}
                        
                        <div 
                          className="question-card draggable" 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index, sec.client_id)}
                          style={{borderColor: q.optional_group_id ? '#93c5fd' : '#e2e8f0', margin:'5px 0', cursor: 'grab'}}
                        >
                          <div className="q-header">
                            <span className="q-code">
                              <span style={{color:'#94a3b8', marginRight:'8px'}}>≡</span>
                              Q{index + 1}. {q.q_data.question_code}
                            </span>
                            <span className="q-marks">{q.q_data.marks} M</span>
                          </div>
                          <div className="q-text">{q.q_data.question_text}</div>
                          
                          <div className="q-actions" style={{justifyContent: 'flex-start', flexWrap:'wrap', marginTop:'10px'}}>
                            
                            {!q.optional_group_id && (
                              <button className="btn-move" style={{color:'#2563eb', borderColor:'#bfdbfe'}} onClick={() => openOrModal(index, sec.client_id, q.q_data)}>
                                + Create Internal Choice
                              </button>
                            )}
                            
                            {q.optional_group_id && (
                              <button className="btn-move" style={{color:'#d97706', borderColor:'#fde68a'}} onClick={() => unlinkOrChoice(q.client_id)}>
                                Remove Internal Choice
                              </button>
                            )}
                            
                            <button className="btn-remove" style={{marginLeft:'auto'}} onClick={() => removeQuestion(q.client_id)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {secMarks < sec.total_marks && (
                      <div className="smart-suggestion">
                        💡 Suggestion: Need {sec.total_marks - secMarks} more marks to complete {sec.name}.
                        <button className="btn-add" style={{marginLeft:'10px'}} onClick={() => setFilters({...filters, marks: (sec.total_marks - secMarks).toString()})}>Find Questions</button>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL CHOICE MODAL */}
      {orModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '700px', maxWidth:'90vw'}}>
            <div className="modal-header">
              <h3>Select Internal Choice (OR Pair)</h3>
              <button className="btn-remove" onClick={() => setOrModal({isOpen:false})}>Close</button>
            </div>
            <div className="modal-body">
              <p>Showing unused questions matching exactly <b>{orModal.marks} Marks</b> for this section.</p>
              <div className="modal-scroll-area">
                {availableQuestions
                  .filter(q => q.marks === orModal.marks && !usedQuestionIds.has(q.id) && q.id !== orModal.targetQuestionId)
                  .map(q => (
                    <div key={q.id} className="adv-question-card" style={{cursor:'pointer'}} onClick={() => selectOrChoice(q)}>
                      <div className="adv-q-header">
                        <span className="q-code">{q.question_code}</span>
                        <span className="q-marks">{q.marks} M</span>
                      </div>
                      <div className="q-text">{q.question_text}</div>
                      <div className="adv-q-meta-grid">
                        <div><b>Unit:</b> {q.unit}</div>
                        <div><b>Type:</b> {q.question_type}</div>
                        <div><b>Difficulty:</b> {q.difficulty_level}</div>
                      </div>
                      <div style={{marginTop:'10px', textAlign:'right'}}>
                        <button className="btn-add">Select as OR</button>
                      </div>
                    </div>
                  ))}
                  {availableQuestions.filter(q => q.marks === orModal.marks && !usedQuestionIds.has(q.id) && q.id !== orModal.targetQuestionId).length === 0 && (
                    <div style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No unused matching questions found for {orModal.marks} marks.</div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default QuestionPaperBuilder;
