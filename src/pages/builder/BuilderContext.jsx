import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWithHandling } from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';

const BuilderContext = createContext();

export const useBuilder = () => useContext(BuilderContext);

export const BuilderProvider = ({ children }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  
  // Active State
  const [sections, setSections] = useState([]);
  const [paperQuestions, setPaperQuestions] = useState([]);
  
  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Modals / Dialogs
  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceTargetClient, setReplaceTargetClient] = useState(null);
  const [isInternalChoiceModalOpen, setInternalChoiceModalOpen] = useState(false);
  const [internalChoiceTargetClient, setInternalChoiceTargetClient] = useState(null);
  const [isAutoGenerateModalOpen, setAutoGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    search: '', unit: '', difficulty: '', bloom: '', 
    type: '', marks: '', status: '', usage: '', sortBy: 'Newest'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPapers = await fetchWithHandling(`http://localhost:5000/api/question-papers`);
      const currentPaper = allPapers.find(p => p.id.toString() === id);
      setPaper(currentPaper);

      if (currentPaper) {
        const availQ = await fetchWithHandling(`http://localhost:5000/api/question-papers/${id}/available-questions`);
        setAvailableQuestions(availQ);
        
        if (currentPaper.coverage_mode === 'Custom Unit Selection' && currentPaper.custom_units) {
          let units = [];
          try { units = JSON.parse(currentPaper.custom_units); } 
          catch(e) { units = typeof currentPaper.custom_units === 'string' ? currentPaper.custom_units.split(',').map(u=>u.trim()) : []; }
          
          if (units.length === 1) {
            setFilters(prev => ({ ...prev, unit: units[0] }));
          }
        }
      }

      const savedData = await fetchWithHandling(`http://localhost:5000/api/question-papers/${id}/builder-data`);
      if (savedData) {
        let initialSections = [];
        let initialPaperQs = [];

        if (savedData.sections && savedData.sections.length > 0) {
          initialSections = savedData.sections.map(s => {
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
        } else if (currentPaper && currentPaper.num_sections > 0) {
          for (let i = 0; i < currentPaper.num_sections; i++) {
            initialSections.push({
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
        }
        
        if (savedData.paperQuestions && savedData.paperQuestions.length > 0) {
          initialPaperQs = savedData.paperQuestions.map(q => ({
            client_id: `db_q_${q.id}_${Date.now()}_${Math.random()}`,
            section_client_id: `db_${q.section_id}`,
            question_id: q.id,
            optional_group_id: q.optional_group_id,
            q_data: q
          }));
        }

        setSections(initialSections);
        setPaperQuestions(initialPaperQs);
        commitHistory(initialSections, initialPaperQs, true);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      setLoading(false);
    }
  };

  // --- UNDO / REDO LOGIC ---
  const commitHistory = (newSections, newPaperQs, isInitial = false) => {
    const newState = { sections: JSON.parse(JSON.stringify(newSections)), paperQuestions: JSON.parse(JSON.stringify(newPaperQs)) };
    
    if (isInitial) {
      setHistory([newState]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
      return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Cap history to 50 items
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setSections(prevState.sections);
      setPaperQuestions(prevState.paperQuestions);
      setHistoryIndex(historyIndex - 1);
      setHasUnsavedChanges(true);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSections(nextState.sections);
      setPaperQuestions(nextState.paperQuestions);
      setHistoryIndex(historyIndex + 1);
      setHasUnsavedChanges(true);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // --- MUTATION HELPERS ---
  const updateState = (newSections, newPaperQs) => {
    setSections(newSections);
    setPaperQuestions(newPaperQs);
    commitHistory(newSections, newPaperQs);
  };

  const addQuestion = (q, sectionId, insertAfterIndex = null, forceGroupId = null) => {
    const newQ = {
      client_id: `man_${Date.now()}_${Math.random()}`,
      section_client_id: sectionId,
      question_id: q.id,
      optional_group_id: forceGroupId,
      q_data: q
    };
    
    let arr = [...paperQuestions];
    if (insertAfterIndex !== null) {
      const secQs = arr.filter(pq => pq.section_client_id === sectionId);
      const targetSecClient = secQs[insertAfterIndex].client_id;
      const absoluteIdx = arr.findIndex(pq => pq.client_id === targetSecClient);
      arr.splice(absoluteIdx + 1, 0, newQ);
    } else {
      arr.push(newQ);
    }
    updateState(sections, arr);
  };

  const removeQuestion = (clientId) => {
    updateState(sections, paperQuestions.filter(q => q.client_id !== clientId));
  };

  const reorderQuestions = (startIndex, endIndex, sectionClientId) => {
    const arr = [...paperQuestions];
    const secQs = arr.filter(pq => pq.section_client_id === sectionClientId);
    
    const draggedSecQ = secQs[startIndex];
    const targetSecQ = secQs[endIndex];
    
    const absDragIdx = arr.findIndex(pq => pq.client_id === draggedSecQ.client_id);
    
    const [movedItem] = arr.splice(absDragIdx, 1);
    
    const newTargetIdx = arr.findIndex(pq => pq.client_id === targetSecQ.client_id);
    arr.splice(endIndex > startIndex ? newTargetIdx + 1 : newTargetIdx, 0, movedItem);
    
    updateState(sections, arr);
  };

  const replaceQuestion = (oldClientId, newQData) => {
    const arr = [...paperQuestions];
    const idx = arr.findIndex(q => q.client_id === oldClientId);
    if (idx !== -1) {
      arr[idx] = { ...arr[idx], question_id: newQData.id, q_data: newQData };
      updateState(sections, arr);
    }
    setReplaceModalOpen(false);
    setReplaceTargetClient(null);
  };

  const createInternalChoice = (targetClientId, newQData) => {
    const arr = [...paperQuestions];
    const targetIdx = arr.findIndex(q => q.client_id === targetClientId);
    if (targetIdx !== -1) {
      const groupId = Date.now();
      arr[targetIdx].optional_group_id = groupId;
      
      const targetSectionId = arr[targetIdx].section_client_id;
      
      const newQ = {
        client_id: `man_${Date.now()}_${Math.random()}`,
        section_client_id: targetSectionId,
        question_id: newQData.id,
        optional_group_id: groupId,
        q_data: newQData
      };
      arr.splice(targetIdx + 1, 0, newQ);
      updateState(sections, arr);
    }
    setInternalChoiceModalOpen(false);
    setInternalChoiceTargetClient(null);
  };

  const unlinkInternalChoice = (clientId) => {
    const arr = [...paperQuestions];
    const idx = arr.findIndex(q => q.client_id === clientId);
    if (idx !== -1) {
      arr[idx].optional_group_id = null;
      updateState(sections, arr);
    }
  };

  const openReplaceModal = (clientId) => {
    setReplaceTargetClient(clientId);
    setReplaceModalOpen(true);
  };

  const openInternalChoiceModal = (clientId) => {
    setInternalChoiceTargetClient(clientId);
    setInternalChoiceModalOpen(true);
  };

  const savePaper = async () => {
    // Validation
    const errors = [];
    let currentTotal = sections.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
    if (currentTotal !== paper.total_marks) {
      errors.push(`Total section marks (${currentTotal}) must equal paper target marks (${paper.total_marks}).`);
    }

    sections.forEach(sec => {
      const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
      const secMarks = secQs.reduce((sum, q) => sum + (q.q_data.marks || 0), 0);
      if (secMarks !== sec.total_marks) {
        errors.push(`${sec.name} requires ${sec.total_marks} marks, but has ${secMarks}.`);
      }
    });

    if (errors.length > 0) {
      alert("Validation Failed:\n- " + errors.join('\n- '));
      return;
    }

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
        setHasUnsavedChanges(false);
        alert('Question Paper saved successfully!');
        navigate('/admin/question-papers');
      } else {
        alert('Failed to save question paper.');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  const executeAutoGenerate = async (updatedSections) => {
    setIsGenerating(true);
    
    // Simulate generation steps for UX
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
      const payload = {
        sections: updatedSections,
        availableQuestions: availableQuestions
      };
      
      const res = await fetch(`http://localhost:5000/api/question-papers/${id}/generate-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // Refetch builder data to populate Context with the new DB state
        await fetchData(); 
        setHasUnsavedChanges(false);
        setAutoGenerateModalOpen(false);
      } else {
        const errorData = await res.json();
        alert(`Generation Failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error generating paper:', err);
      alert('A network error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const value = {
    paper, availableQuestions,
    sections, paperQuestions,
    loading, error, fetchData, filters, setFilters,
    currentPage, setCurrentPage, questionsPerPage,
    undo, redo, canUndo, canRedo,
    addQuestion, removeQuestion, reorderQuestions,
    replaceQuestion, createInternalChoice, unlinkInternalChoice,
    openReplaceModal, isReplaceModalOpen, setReplaceModalOpen, replaceTargetClient,
    openInternalChoiceModal, isInternalChoiceModalOpen, setInternalChoiceModalOpen, internalChoiceTargetClient,
    savePaper, hasUnsavedChanges,
    isAutoGenerateModalOpen, setAutoGenerateModalOpen, isGenerating, executeAutoGenerate
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};
