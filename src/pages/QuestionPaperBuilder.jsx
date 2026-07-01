import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  
  // Filter state for Question Bank (Review Mode)
  const [filters, setFilters] = useState({
    search: '', difficulty: '', bloom: '', type: ''
  });

  // Derived Mode: If paperQuestions is empty, we are in Blueprint Mode. Otherwise, Review Mode.
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
      }

      const savedRes = await fetch(`http://localhost:5000/api/question-papers/${id}/builder-data`);
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        
        if (savedData.sections && savedData.sections.length > 0) {
          const loadedSections = savedData.sections.map(s => {
            let parsedConfig = {
              num_questions: 10, marks_per_question: 1, question_type: 'Mixed',
              diffDist: { Easy: 33, Medium: 33, Hard: 34 },
              bloomDist: { Remember: 50, Understand: 50 },
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
          // Initialize default sections based on num_sections
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
                bloomDist: { Remember: 50, Understand: 50 },
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
    // Blueprint Validation
    let currentTotal = sections.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
    if (currentTotal !== paper.total_marks) {
      alert(`Validation Failed: Section marks sum to ${currentTotal}, but paper total is ${paper.total_marks}.`);
      return;
    }
    
    for (let s of sections) {
      let calcMarks = (parseInt(s.config.num_questions) || 0) * (parseInt(s.config.marks_per_question) || 0);
      if (calcMarks !== parseInt(s.total_marks)) {
        alert(`Validation Failed in ${s.name}: ${s.config.num_questions} Qs * ${s.config.marks_per_question} Marks = ${calcMarks}, but section total is ${s.total_marks}.`);
        return;
      }
    }

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
        // Refetch to enter Review Mode
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

  const updateSectionConfig = (secId, field, value) => {
    setSections(sections.map(s => {
      if (s.client_id === secId) {
        return { ...s, config: { ...s.config, [field]: value } };
      }
      return s;
    }));
  };

  const updateSectionDist = (secId, distName, key, value) => {
    setSections(sections.map(s => {
      if (s.client_id === secId) {
        return { 
          ...s, 
          config: { 
            ...s.config, 
            [distName]: { ...s.config[distName], [key]: parseInt(value) || 0 } 
          } 
        };
      }
      return s;
    }));
  };

  const updateSectionBase = (secId, field, value) => {
    setSections(sections.map(s => s.client_id === secId ? { ...s, [field]: value } : s));
  };

  // --- REVIEW MODE METHODS ---
  const addQuestion = (q, sectionId) => {
    if (paperQuestions.find(pq => pq.question_id === q.id)) {
      if(!window.confirm('This question is already in the paper. Add again?')) return;
    }
    setPaperQuestions([...paperQuestions, {
      client_id: `man_${Date.now()}_${Math.random()}`,
      section_client_id: sectionId,
      question_id: q.id,
      optional_group_id: null,
      q_data: q
    }]);
  };
  const removeQuestion = (clientId) => setPaperQuestions(paperQuestions.filter(q => q.client_id !== clientId));
  const moveUp = (index, secQs) => {
    if (index === 0) return;
    const newArr = [...paperQuestions];
    const idx1 = paperQuestions.findIndex(pq => pq.client_id === secQs[index].client_id);
    const idx2 = paperQuestions.findIndex(pq => pq.client_id === secQs[index - 1].client_id);
    [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
    setPaperQuestions(newArr);
  };
  const moveDown = (index, secQs) => {
    if (index === secQs.length - 1) return;
    const newArr = [...paperQuestions];
    const idx1 = paperQuestions.findIndex(pq => pq.client_id === secQs[index].client_id);
    const idx2 = paperQuestions.findIndex(pq => pq.client_id === secQs[index + 1].client_id);
    [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
    setPaperQuestions(newArr);
  };
  const linkAsOrChoice = (index, secQs) => {
    if (index === 0) return;
    const current = secQs[index];
    const prev = secQs[index - 1];
    const groupId = prev.optional_group_id || Date.now();
    setPaperQuestions(paperQuestions.map(pq => (pq.client_id === current.client_id || pq.client_id === prev.client_id) ? { ...pq, optional_group_id: groupId } : pq));
  };
  const unlinkOrChoice = (clientId) => setPaperQuestions(paperQuestions.map(pq => pq.client_id === clientId ? { ...pq, optional_group_id: null } : pq));

  // Compute Current Stats
  let currentConfigTotal = sections.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
  let liveTotalMarks = paperQuestions.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Builder...</div>;
  if (!paper) return <div>Paper not found.</div>;

  return (
    <div className="builder-container">
      <div className="builder-header">
        <div>
          <h2>Builder: {paper.paper_title}</h2>
          <div className="paper-meta">
            {paper.course} - {paper.program} | Target Marks: {paper.total_marks} | Sections: {paper.num_sections}
          </div>
        </div>
        <div className="builder-actions">
          {!isBlueprintMode && <button className="btn-back" style={{color:'#dc2626', background:'#fee2e2'}} onClick={resetToBlueprint}>Reset to Blueprint</button>}
          <button className="btn-back" onClick={() => navigate('/admin/question-papers')}>Exit</button>
          <button className="btn-save" onClick={handleSavePaper}>Save Paper</button>
        </div>
      </div>

      {isBlueprintMode ? (
        // --- BLUEPRINT MODE ---
        <div className="blueprint-mode">
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
                          <option value="Mixed">Mixed</option>
                          <option value="MCQ">MCQ</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Long Answer">Long Answer</option>
                          <option value="Numerical">Numerical</option>
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
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      {conf.internal_choice === 'Yes' && (
                        <div className="bp-group">
                          <label>Optional Qs Count</label>
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
                        <div style={{display:'flex', gap:'10px'}}>
                          <input type="number" placeholder="Easy" value={conf.diffDist?.Easy} onChange={e => updateSectionDist(sec.client_id, 'diffDist', 'Easy', e.target.value)} title="Easy %" />
                          <input type="number" placeholder="Medium" value={conf.diffDist?.Medium} onChange={e => updateSectionDist(sec.client_id, 'diffDist', 'Medium', e.target.value)} title="Medium %" />
                          <input type="number" placeholder="Hard" value={conf.diffDist?.Hard} onChange={e => updateSectionDist(sec.client_id, 'diffDist', 'Hard', e.target.value)} title="Hard %" />
                        </div>
                      </div>
                      <div className="bp-group full-width">
                        <label>Bloom's Priorities (%)</label>
                        <div style={{display:'flex', gap:'10px'}}>
                          <input type="number" placeholder="Remember" value={conf.bloomDist?.Remember || ''} onChange={e => updateSectionDist(sec.client_id, 'bloomDist', 'Remember', e.target.value)} title="Remember" />
                          <input type="number" placeholder="Understand" value={conf.bloomDist?.Understand || ''} onChange={e => updateSectionDist(sec.client_id, 'bloomDist', 'Understand', e.target.value)} title="Understand" />
                          <input type="number" placeholder="Apply" value={conf.bloomDist?.Apply || ''} onChange={e => updateSectionDist(sec.client_id, 'bloomDist', 'Apply', e.target.value)} title="Apply" />
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
              disabled={generating || currentConfigTotal !== paper.total_marks}
            >
              {generating ? 'Generating Paper...' : 'Generate Entire Question Paper'}
            </button>
          </div>
        </div>
      ) : (
        // --- REVIEW MODE ---
        <div className="builder-main">
          {/* Left Panel: Question Bank */}
          <div className="panel" style={{flex: '0.8'}}>
            <div className="panel-header">
              Question Bank ({availableQuestions.length} Valid)
            </div>
            <div className="panel-filters">
              <input type="text" placeholder="Search text..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
            </div>
            <div className="panel-content">
              {availableQuestions.filter(q => !filters.search || q.question_text.toLowerCase().includes(filters.search.toLowerCase())).map(q => (
                <div key={q.id} className="question-card">
                  <div className="q-header">
                    <span className="q-code">{q.question_code}</span>
                    <span className="q-marks">{q.marks} M</span>
                  </div>
                  <div className="q-text">{q.question_text}</div>
                  <div className="q-tags">
                    <span className={`q-tag tag-diff ${q.difficulty_level?.toLowerCase()}`}>{q.difficulty_level}</span>
                    <span className="q-tag tag-type">{q.question_type}</span>
                  </div>
                  <div className="q-actions">
                    <span style={{fontSize:'0.8rem', color:'#64748b'}}>Add:</span>
                    {sections.map(s => (
                      <button key={s.client_id} className="btn-add" style={{padding:'4px 8px'}} onClick={() => addQuestion(q, s.client_id)}>{s.name}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Current Paper Sections */}
          <div className="panel" style={{flex: '1.2', background: '#f8fafc'}}>
            <div className="panel-header" style={{display:'flex', justifyContent:'space-between'}}>
              <span>Generated Paper</span>
              <span style={{color: liveTotalMarks === paper.total_marks ? '#10b981' : '#ef4444'}}>Live Marks: {liveTotalMarks} / {paper.total_marks}</span>
            </div>
            <div className="panel-content" style={{padding: '15px'}}>
              {sections.map(sec => {
                const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
                const secMarks = secQs.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
                
                return (
                  <div key={sec.client_id} className="section-container" style={{background:'white', borderRadius:'8px', padding:'15px', marginBottom:'15px', border:'1px solid #e2e8f0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                      <h3 style={{margin:0, color:'#1e293b'}}>{sec.name}</h3>
                      <span style={{fontWeight:'bold', color: secMarks === sec.total_marks ? '#10b981' : '#f59e0b'}}>Marks: {secMarks}/{sec.total_marks}</span>
                    </div>
                    {sec.config?.instructions && <p style={{fontStyle:'italic', color:'#64748b', margin:'0 0 15px 0'}}>{sec.config.instructions}</p>}
                    
                    {secQs.length === 0 && <div style={{color:'#94a3b8', textAlign:'center', padding:'10px'}}>Empty</div>}
                    
                    {secQs.map((q, index) => (
                      <div key={q.client_id} style={{position: 'relative'}}>
                        {q.optional_group_id && index > 0 && secQs[index-1].optional_group_id === q.optional_group_id && (
                          <div style={{textAlign:'center', fontWeight:'bold', color:'#3b82f6', margin:'5px 0'}}>OR</div>
                        )}
                        
                        <div className="question-card" style={{borderColor: q.optional_group_id ? '#93c5fd' : '#e2e8f0', margin:'5px 0'}}>
                          <div className="q-header">
                            <span className="q-code">Q{index + 1}. {q.q_data.question_code}</span>
                            <span className="q-marks">{q.q_data.marks} M</span>
                          </div>
                          <div className="q-text">{q.q_data.question_text}</div>
                          
                          <div className="q-actions" style={{justifyContent: 'flex-start', flexWrap:'wrap', marginTop:'10px'}}>
                            <button className="btn-move" onClick={() => moveUp(index, secQs)} disabled={index === 0}>↑</button>
                            <button className="btn-move" onClick={() => moveDown(index, secQs)} disabled={index === secQs.length - 1}>↓</button>
                            
                            {index > 0 && (!q.optional_group_id || q.optional_group_id !== secQs[index-1].optional_group_id) && (
                              <button className="btn-move" style={{color:'#2563eb'}} onClick={() => linkAsOrChoice(index, secQs)}>Link OR</button>
                            )}
                            {q.optional_group_id && (
                              <button className="btn-move" style={{color:'#d97706'}} onClick={() => unlinkOrChoice(q.client_id)}>Unlink</button>
                            )}
                            
                            <button className="btn-remove" style={{marginLeft:'auto'}} onClick={() => removeQuestion(q.client_id)}>X</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionPaperBuilder;
