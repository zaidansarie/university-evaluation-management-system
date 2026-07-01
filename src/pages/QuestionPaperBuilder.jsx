import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuestionPaperBuilder.css';

function QuestionPaperBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paper, setPaper] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  const [sections, setSections] = useState([
    { client_id: Date.now().toString(), name: 'Section A', description: '', total_marks: 0 }
  ]);
  const [paperQuestions, setPaperQuestions] = useState([]); // { client_id, section_client_id, question_id, optional_group_id, q_data }
  
  const [loading, setLoading] = useState(true);
  
  // Filter state for Question Bank
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    bloom: '',
    type: ''
  });

  // Auto Generate Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [genConfig, setGenConfig] = useState({
    totalQuestions: 10,
    avoidDuplicates: true,
    shuffle: true,
    diffDist: { Easy: 30, Medium: 50, Hard: 20 },
    bloomDist: {},
    typeDist: {},
    unitDist: {}
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch paper details
      const paperRes = await fetch(`http://localhost:5000/api/question-papers`);
      const allPapers = await paperRes.json();
      const currentPaper = allPapers.find(p => p.id.toString() === id);
      setPaper(currentPaper);

      if (currentPaper) {
        // Fetch available questions (already filtered by custom_units and history attached)
        const qRes = await fetch(`http://localhost:5000/api/question-papers/${id}/available-questions`);
        const availQ = await qRes.json();
        setAvailableQuestions(availQ);
      }

      // Fetch saved builder data (sections & mapped questions)
      const savedRes = await fetch(`http://localhost:5000/api/question-papers/${id}/builder-data`);
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        if (savedData.sections && savedData.sections.length > 0) {
          const loadedSections = savedData.sections.map(s => ({
            ...s, client_id: `db_${s.id}`
          }));
          setSections(loadedSections);
          
          if (savedData.paperQuestions) {
            const loadedQ = savedData.paperQuestions.map(q => ({
              client_id: `db_q_${q.id}_${Date.now()}_${Math.random()}`,
              section_client_id: `db_${q.section_id}`,
              question_id: q.id,
              optional_group_id: q.optional_group_id,
              q_data: q // store full question data
            }));
            setPaperQuestions(loadedQ);
          }
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

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/question-papers/${id}/generate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: genConfig,
          availableQuestions: availableQuestions
        })
      });
      
      if (res.ok) {
        const generated = await res.json();
        // Append generated questions to the active section
        const newQs = generated.map(q => ({
          client_id: `gen_${Date.now()}_${Math.random()}`,
          section_client_id: activeSectionId,
          question_id: q.id,
          optional_group_id: null,
          q_data: q
        }));
        
        setPaperQuestions([...paperQuestions, ...newQs]);
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to generate questions.');
      }
    } catch (err) {
      console.error('Error auto-generating:', err);
    }
  };

  const addQuestion = (q, sectionId) => {
    // Check if already in paper (avoid duplicate)
    // Optional: allow duplicates if teacher really wants, but usually we don't.
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

  const removeQuestion = (clientId) => {
    setPaperQuestions(paperQuestions.filter(q => q.client_id !== clientId));
  };

  const moveUp = (index, sectionQuestions) => {
    if (index === 0) return;
    const itemToMove = sectionQuestions[index];
    const prevItem = sectionQuestions[index - 1];
    
    // Find absolute indices in paperQuestions
    const idx1 = paperQuestions.findIndex(pq => pq.client_id === itemToMove.client_id);
    const idx2 = paperQuestions.findIndex(pq => pq.client_id === prevItem.client_id);
    
    const newArr = [...paperQuestions];
    [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
    setPaperQuestions(newArr);
  };

  const moveDown = (index, sectionQuestions) => {
    if (index === sectionQuestions.length - 1) return;
    const itemToMove = sectionQuestions[index];
    const nextItem = sectionQuestions[index + 1];
    
    const idx1 = paperQuestions.findIndex(pq => pq.client_id === itemToMove.client_id);
    const idx2 = paperQuestions.findIndex(pq => pq.client_id === nextItem.client_id);
    
    const newArr = [...paperQuestions];
    [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
    setPaperQuestions(newArr);
  };

  const linkAsOrChoice = (index, sectionQuestions) => {
    if (index === 0) return;
    const current = sectionQuestions[index];
    const prev = sectionQuestions[index - 1];
    
    const groupId = prev.optional_group_id || Date.now();
    
    const newArr = paperQuestions.map(pq => {
      if (pq.client_id === current.client_id || pq.client_id === prev.client_id) {
        return { ...pq, optional_group_id: groupId };
      }
      return pq;
    });
    setPaperQuestions(newArr);
  };
  
  const unlinkOrChoice = (clientId) => {
    setPaperQuestions(paperQuestions.map(pq => {
      if (pq.client_id === clientId) return { ...pq, optional_group_id: null };
      return pq;
    }));
  };

  const addSection = () => {
    setSections([...sections, {
      client_id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`, // Section B, C etc.
      description: '',
      total_marks: 0
    }]);
  };
  
  const removeSection = (id) => {
    if(window.confirm('Remove section and all its questions?')) {
      setSections(sections.filter(s => s.client_id !== id));
      setPaperQuestions(paperQuestions.filter(pq => pq.section_client_id !== id));
    }
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.client_id === id ? { ...s, [field]: value } : s));
  };

  const openGenerateModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setShowModal(true);
  };

  // Compute Live Stats Overall
  const totalMarks = paperQuestions.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
  const easyCount = paperQuestions.filter(q => q.q_data.difficulty_level === 'Easy').length;
  const mediumCount = paperQuestions.filter(q => q.q_data.difficulty_level === 'Medium').length;
  const hardCount = paperQuestions.filter(q => q.q_data.difficulty_level === 'Hard').length;
  const totalQ = paperQuestions.length || 1; 
  const diffString = `E:${Math.round((easyCount/totalQ)*100)}% M:${Math.round((mediumCount/totalQ)*100)}% H:${Math.round((hardCount/totalQ)*100)}%`;

  // Filter bank questions
  const filteredBank = availableQuestions.filter(q => {
    if (filters.difficulty && q.difficulty_level !== filters.difficulty) return false;
    if (filters.bloom && q.blooms_level !== filters.bloom) return false;
    if (filters.type && q.question_type !== filters.type) return false;
    if (filters.search && !q.question_text.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div>Loading Builder...</div>;
  if (!paper) return <div>Paper not found.</div>;

  return (
    <div className="builder-container">
      <div className="builder-header">
        <div>
          <h2>Builder: {paper.paper_title}</h2>
          <div className="paper-meta">
            {paper.course} - {paper.program} | Sem {paper.semester} <br/> 
            Coverage: {paper.coverage_mode === 'All Units' ? 'All Units' : 'Custom Selection'} 
          </div>
        </div>
        <div className="builder-stats">
          <div className="stat-item">
            <div className="stat-value">{paperQuestions.length}</div>
            <div className="stat-label">Total Qs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalMarks}</div>
            <div className="stat-label">Total Marks</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{fontSize: '1rem', marginTop: '4px'}}>{paperQuestions.length === 0 ? 'N/A' : diffString}</div>
            <div className="stat-label">Difficulty</div>
          </div>
        </div>
        <div className="builder-actions">
          <button className="btn-back" onClick={() => navigate('/admin/question-papers')}>Cancel</button>
          <button className="btn-save" onClick={handleSavePaper}>Save Paper</button>
        </div>
      </div>

      <div className="builder-main">
        {/* Left Panel: Question Bank */}
        <div className="panel" style={{flex: '0.8'}}>
          <div className="panel-header">
            Question Bank ({filteredBank.length} Valid)
          </div>
          <div className="panel-filters">
            <input 
              type="text" 
              placeholder="Search text..." 
              value={filters.search} 
              onChange={e => setFilters({...filters, search: e.target.value})} 
            />
            <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})}>
              <option value="">All Diff</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
              <option value="">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="Short Answer">Short Answer</option>
              <option value="Long Answer">Long Answer</option>
              <option value="Numerical">Numerical</option>
            </select>
          </div>
          <div className="panel-content">
            {filteredBank.map(q => (
              <div key={q.id} className="question-card">
                <div className="q-header">
                  <span className="q-code">{q.question_code} (Unit {q.unit})</span>
                  <span className="q-marks">{q.marks} Marks</span>
                </div>
                <div className="q-text">{q.question_text}</div>
                <div className="q-tags">
                  <span className={`q-tag tag-diff ${q.difficulty_level?.toLowerCase()}`}>{q.difficulty_level}</span>
                  <span className="q-tag tag-type">{q.question_type}</span>
                  {q.history && q.history.length > 0 ? (
                    <span className="q-tag" style={{background: '#fef3c7', color: '#92400e'}} title={q.history.join('\n')}>Used {q.history.length}x</span>
                  ) : (
                    <span className="q-tag" style={{background: '#dcfce7', color: '#166534'}}>Never Used</span>
                  )}
                </div>
                <div className="q-actions">
                  <span style={{fontSize:'0.8rem', color:'#64748b', marginRight:'8px'}}>Add to:</span>
                  {sections.map(s => (
                    <button key={s.client_id} className="btn-add" style={{padding:'4px 8px'}} onClick={() => addQuestion(q, s.client_id)}>{s.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Current Paper Sections */}
        <div className="panel" style={{flex: '1.2', background: '#f1f5f9'}}>
          <div className="panel-header">
            Paper Structure
            <button className="btn-generate" style={{padding: '6px 12px', fontSize:'0.85rem'}} onClick={addSection}>+ Add Section</button>
          </div>
          <div className="panel-content" style={{padding: '10px'}}>
            {sections.map(sec => {
              const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
              const secMarks = secQs.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
              
              return (
                <div key={sec.client_id} className="section-container" style={{background:'white', borderRadius:'8px', padding:'15px', marginBottom:'15px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
                    <input 
                      type="text" 
                      value={sec.name} 
                      onChange={e => updateSection(sec.client_id, 'name', e.target.value)}
                      style={{fontWeight:'bold', fontSize:'1.1rem', border:'1px solid transparent', padding:'4px', width:'150px'}}
                    />
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      <span style={{fontSize:'0.9rem', color:'#475569'}}>Marks: {secMarks}</span>
                      <button className="btn-generate" style={{padding:'4px 8px', fontSize:'0.8rem'}} onClick={() => openGenerateModal(sec.client_id)}>Auto-Generate</button>
                      <button className="btn-remove" style={{padding:'4px 8px', fontSize:'0.8rem'}} onClick={() => removeSection(sec.client_id)}>X</button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Section Instructions (Optional)" 
                    value={sec.description}
                    onChange={e => updateSection(sec.client_id, 'description', e.target.value)}
                    style={{width:'100%', marginBottom:'15px', padding:'6px', border:'1px solid #e2e8f0', borderRadius:'4px'}}
                  />
                  
                  {secQs.length === 0 && <div style={{color:'#94a3b8', fontSize:'0.9rem', padding:'10px', textAlign:'center'}}>Empty Section</div>}
                  
                  {secQs.map((q, index) => (
                    <div key={q.client_id} style={{position: 'relative'}}>
                      {q.optional_group_id && index > 0 && secQs[index-1].optional_group_id === q.optional_group_id && (
                        <div style={{textAlign:'center', fontWeight:'bold', color:'#3b82f6', margin:'-5px 0 5px 0'}}>OR</div>
                      )}
                      
                      <div className="question-card" style={{borderColor: q.optional_group_id ? '#93c5fd' : '#e2e8f0', marginBottom:'10px'}}>
                        <div className="q-header">
                          <span className="q-code">Q{index + 1}. {q.q_data.question_code}</span>
                          <span className="q-marks">{q.q_data.marks} Marks</span>
                        </div>
                        <div className="q-text">{q.q_data.question_text}</div>
                        
                        <div className="q-actions" style={{justifyContent: 'flex-start', flexWrap:'wrap', marginTop:'10px'}}>
                          <button className="btn-move" onClick={() => moveUp(index, secQs)} disabled={index === 0}>↑</button>
                          <button className="btn-move" onClick={() => moveDown(index, secQs)} disabled={index === secQs.length - 1}>↓</button>
                          
                          {index > 0 && (!q.optional_group_id || q.optional_group_id !== secQs[index-1].optional_group_id) && (
                            <button className="btn-move" style={{color:'#2563eb'}} onClick={() => linkAsOrChoice(index, secQs)}>Link OR with prev</button>
                          )}
                          {q.optional_group_id && (
                            <button className="btn-move" style={{color:'#d97706'}} onClick={() => unlinkOrChoice(q.client_id)}>Unlink OR</button>
                          )}
                          
                          <button className="btn-remove" style={{marginLeft:'auto'}} onClick={() => removeQuestion(q.client_id)}>Remove</button>
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

      {/* Auto-Generate Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>Auto-Generate Section</h3>
            <form className="modal-form" onSubmit={handleAutoGenerate}>
              
              <div className="dist-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'15px'}}>
                <div className="form-group">
                  <label>Total Questions to Generate</label>
                  <input type="number" min="1" max="50" value={genConfig.totalQuestions} onChange={e => setGenConfig({...genConfig, totalQuestions: e.target.value})} required />
                </div>
                <div className="form-group" style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:'10px'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                    <input type="checkbox" checked={genConfig.avoidDuplicates} onChange={e => setGenConfig({...genConfig, avoidDuplicates: e.target.checked})} style={{width:'auto'}} />
                    Avoid Questions with History
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                    <input type="checkbox" checked={genConfig.shuffle} onChange={e => setGenConfig({...genConfig, shuffle: e.target.checked})} style={{width:'auto'}} />
                    Shuffle Selected Questions
                  </label>
                </div>
              </div>

              <hr style={{borderColor:'#e2e8f0', margin:'15px 0'}}/>
              
              <label>Difficulty Distribution (%)</label>
              <div className="dist-grid">
                <div className="form-group"><label>Easy %</label><input type="number" value={genConfig.diffDist.Easy || ''} onChange={e => setGenConfig({...genConfig, diffDist: {...genConfig.diffDist, Easy: e.target.value}})} /></div>
                <div className="form-group"><label>Medium %</label><input type="number" value={genConfig.diffDist.Medium || ''} onChange={e => setGenConfig({...genConfig, diffDist: {...genConfig.diffDist, Medium: e.target.value}})} /></div>
                <div className="form-group"><label>Hard %</label><input type="number" value={genConfig.diffDist.Hard || ''} onChange={e => setGenConfig({...genConfig, diffDist: {...genConfig.diffDist, Hard: e.target.value}})} /></div>
              </div>

              <hr style={{borderColor:'#e2e8f0', margin:'15px 0'}}/>

              <label>Type Distribution (%)</label>
              <div className="dist-grid" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                <div className="form-group"><label>MCQ %</label><input type="number" value={genConfig.typeDist['MCQ'] || ''} onChange={e => setGenConfig({...genConfig, typeDist: {...genConfig.typeDist, 'MCQ': e.target.value}})} /></div>
                <div className="form-group"><label>Short %</label><input type="number" value={genConfig.typeDist['Short Answer'] || ''} onChange={e => setGenConfig({...genConfig, typeDist: {...genConfig.typeDist, 'Short Answer': e.target.value}})} /></div>
                <div className="form-group"><label>Long %</label><input type="number" value={genConfig.typeDist['Long Answer'] || ''} onChange={e => setGenConfig({...genConfig, typeDist: {...genConfig.typeDist, 'Long Answer': e.target.value}})} /></div>
                <div className="form-group"><label>Numeric %</label><input type="number" value={genConfig.typeDist['Numerical'] || ''} onChange={e => setGenConfig({...genConfig, typeDist: {...genConfig.typeDist, 'Numerical': e.target.value}})} /></div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-generate">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionPaperBuilder;
