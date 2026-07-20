import React, { useState, useEffect } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import './QuestionBank.css';

const QUESTION_TYPES = ['MCQ', 'Short Answer', 'Long Answer', 'Numerical'];
const BLOOMS_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const MARKS = [1, 2, 3, 5, 10, 15];

function QuestionBank({ mode = 'admin' }) {
  const facultyId = mode === 'faculty' ? 1 : null;
  const questionsEndpoint = mode === 'faculty' ? '/api/questions?faculty_id=1' : '/api/questions';
  
  const { data: questions = [], loading: questionsLoading, error: questionsError, refetch: refetchQuestions } = useApiData(questionsEndpoint);
  const { data: subjects = [], loading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useApiData('/api/subjects');
  const { data: faculty = [], loading: facultyLoading, error: facultyError, refetch: refetchFaculty } = useApiData('/api/faculty');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  // Review Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTargetQuestion, setViewTargetQuestion] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    question_code: '',
    subject_id: '',
    unit: '',
    question_text: '',
    question_type: '',
    blooms_level: '',
    difficulty_level: '',
    marks: '',
    status: mode === 'faculty' ? 'Pending Review' : 'Approved',
    created_by: mode === 'faculty' ? 1 : '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: ''
  });

  const [filters, setFilters] = useState({
    subject_id: '',
    unit: '',
    question_type: '',
    difficulty_level: '',
    blooms_level: '',
    status: '',
    searchQuery: '',
    faculty_id: '' 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Auto-generate Question Code when Subject or Unit changes
  useEffect(() => {
    if (!isEditing && formData.subject_id && formData.unit) {
      const selectedSubject = subjects.find(s => s.id.toString() === formData.subject_id.toString());
      if (selectedSubject) {
        // Find unit number. If not strictly available, we'll try to parse it or just use an index
        let unitNumber = '1';
        const unitObj = selectedSubject.units?.find(u => u.unit_name === formData.unit);
        if (unitObj && unitObj.unit_number) {
          unitNumber = unitObj.unit_number;
        } else {
          // Fallback if unit_number isn't strictly there
          const index = selectedSubject.units?.findIndex(u => u.unit_name === formData.unit);
          unitNumber = (index !== -1 ? index + 1 : 1).toString();
        }

        const prefix = `${selectedSubject.subject_code}-U${unitNumber}-Q`;
        
        // Find existing questions with this prefix to determine next sequence
        const existingSeqNumbers = questions
          .filter(q => q.question_code && q.question_code.startsWith(prefix))
          .map(q => {
            const parts = q.question_code.split('-Q');
            if (parts.length === 2) {
              const num = parseInt(parts[1], 10);
              return isNaN(num) ? 0 : num;
            }
            return 0;
          });
          
        const maxSeq = existingSeqNumbers.length > 0 ? Math.max(...existingSeqNumbers) : 0;
        const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
        
        setFormData(prev => ({ ...prev, question_code: `${prefix}${nextSeq}` }));
      }
    }
  }, [formData.subject_id, formData.unit, subjects, questions, isEditing]);

  const resetForm = () => {
    setFormData({
      question_code: '',
      subject_id: '',
      unit: '',
      question_text: '',
      question_type: '',
      blooms_level: '',
      difficulty_level: '',
      marks: '',
      status: mode === 'faculty' ? 'Pending Review' : 'Approved',
      created_by: mode === 'faculty' ? 1 : '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      explanation: ''
    });
    setIsEditing(false);
    setCurrentQuestionId(null);
  };

  const handleAddOrUpdateQuestion = async (e) => {
    e.preventDefault();

    const payload = { ...formData };
    if (!payload.subject_id) payload.subject_id = null;
    if (!payload.created_by) payload.created_by = null;

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/questions/${currentQuestionId}` 
        : 'http://localhost:5000/api/questions';
      
      const method = isEditing ? 'PUT' : 'POST';

      await fetchWithHandling(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      resetForm();
      refetchQuestions(true);
      alert(`Question ${isEditing ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving question:', error);
      alert(error.message || `Failed to ${isEditing ? 'update' : 'add'} question.`);
    }
  };

  const handleEditClick = (question) => {
    setFormData({
      question_code: question.question_code || '',
      subject_id: question.subject_id || '',
      unit: question.unit || '',
      question_text: question.question_text || '',
      question_type: question.question_type || '',
      blooms_level: question.blooms_level || '',
      difficulty_level: question.difficulty_level || '',
      marks: question.marks || '',
      status: question.status || (mode === 'faculty' ? 'Pending Review' : 'Approved'),
      created_by: question.created_by || (mode === 'faculty' ? 1 : ''),
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || '',
      explanation: question.explanation || ''
    });
    setIsEditing(true);
    setCurrentQuestionId(question.id);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await fetchWithHandling(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE'
      });
      if (isEditing && currentQuestionId === id) {
         resetForm();
      }
      refetchQuestions(true);
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert(error.message || 'Failed to delete question.');
    }
  };

  const handleReviewAction = async (id, newStatus, remarks = null) => {
    if (newStatus === 'Rejected' && !remarks) {
      setRejectTargetId(id);
      setReviewRemarks('');
      setIsRejectModalOpen(true);
      return;
    }
    
    if (newStatus === 'Archived') {
       if (!window.confirm('Are you sure you want to archive this question? It will no longer be available for papers.')) return;
    }

    try {
      setIsSubmittingReview(true);
      await fetchWithHandling(`http://localhost:5000/api/questions/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          review_remarks: remarks,
          reviewed_by: 99 // Mock admin user ID
        })
      });
      
      setIsRejectModalOpen(false);
      refetchQuestions(true);
      if (newStatus === 'Approved') alert('Question Approved!');
    } catch (error) {
      console.error('Error reviewing question:', error);
      alert('Failed to update question status.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const submitReject = () => {
    if (!reviewRemarks.trim()) {
      alert("Review remarks are mandatory for rejection.");
      return;
    }
    handleReviewAction(rejectTargetId, 'Rejected', reviewRemarks);
  };

  const openViewModal = (question) => {
    setViewTargetQuestion(question);
    setIsViewModalOpen(true);
  };

  // Derived state for filtered questions
  const filteredQuestions = questions.filter(q => {
    if (filters.subject_id && q.subject_id?.toString() !== filters.subject_id) return false;
    if (filters.unit && q.unit !== filters.unit) return false;
    if (filters.question_type && q.question_type !== filters.question_type) return false;
    if (filters.difficulty_level && q.difficulty_level !== filters.difficulty_level) return false;
    if (filters.blooms_level && q.blooms_level !== filters.blooms_level) return false;
    if (filters.status && q.status !== filters.status) return false;
    if (mode === 'admin' && filters.faculty_id && q.created_by?.toString() !== filters.faculty_id) return false;

    if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      const codeMatch = q.question_code?.toLowerCase().includes(lowerQuery);
      const textMatch = q.question_text?.toLowerCase().includes(lowerQuery);
      if (!codeMatch && !textMatch) return false;
    }

    return true;
  });

  const selectedFormSubject = subjects.find(s => s.id.toString() === formData.subject_id?.toString());
  const availableFormUnits = selectedFormSubject?.units || [];

  let availableFilterUnits = [];
  if (filters.subject_id) {
    const selectedFilterSubject = subjects.find(s => s.id.toString() === filters.subject_id?.toString());
    availableFilterUnits = selectedFilterSubject?.units || [];
  } else {
    const allUnitNames = new Set();
    subjects.forEach(s => {
      s.units?.forEach(u => allUnitNames.add(u.unit_name));
    });
    availableFilterUnits = Array.from(allUnitNames).map(name => ({ unit_name: name }));
  }
  
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Approved': return 'green';
      case 'Pending Review': return 'orange';
      case 'Rejected': return 'red';
      case 'Archived': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="question-bank-management">
      <section className="add-question-section">
        <h2>{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
        <form className="add-question-form" onSubmit={handleAddOrUpdateQuestion}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Subject</label>
            {subjectsLoading ? (
              <SkeletonLoader lines={1} height="38px" />
            ) : subjectsError ? (
              <APIError error={subjectsError} onRetry={() => refetchSubjects(true)} resourceName="Subjects" />
            ) : (
              <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required>
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Unit</label>
            <select name="unit" value={formData.unit} onChange={handleInputChange} required disabled={!formData.subject_id}>
              <option value="" disabled>{formData.subject_id ? 'Select Unit' : 'Select Subject First'}</option>
              {availableFormUnits.map(u => (
                <option key={u.id || u.unit_name} value={u.unit_name}>{u.unit_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Question Type</label>
            <select name="question_type" value={formData.question_type} onChange={handleInputChange} required>
              <option value="" disabled>Select Type</option>
              {QUESTION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Bloom's Level</label>
            <select name="blooms_level" value={formData.blooms_level} onChange={handleInputChange} required>
              <option value="" disabled>Bloom's Level</option>
              {BLOOMS_LEVELS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Difficulty</label>
            <select name="difficulty_level" value={formData.difficulty_level} onChange={handleInputChange} required>
              <option value="" disabled>Difficulty</option>
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Marks</label>
            <select name="marks" value={formData.marks} onChange={handleInputChange} required>
              <option value="" disabled>Marks</option>
              {MARKS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          {mode === 'admin' && (
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Created By (Optional)</label>
              {facultyLoading ? (
                <SkeletonLoader lines={1} height="38px" />
              ) : (
                <select name="created_by" value={formData.created_by} onChange={handleInputChange}>
                  <option value="">Created By (Optional)</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {mode === 'admin' && (
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          )}

          <div className="form-group full-width">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Question Text</label>
            <textarea name="question_text" placeholder="Enter question text here..." value={formData.question_text} onChange={handleInputChange} required />
          </div>
          
          {formData.question_type === 'MCQ' && (
            <>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Option A</label>
                <input type="text" name="option_a" placeholder="Option A" value={formData.option_a} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Option B</label>
                <input type="text" name="option_b" placeholder="Option B" value={formData.option_b} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Option C</label>
                <input type="text" name="option_c" placeholder="Option C" value={formData.option_c} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Option D</label>
                <input type="text" name="option_d" placeholder="Option D" value={formData.option_d} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Correct Answer</label>
                <select name="correct_answer" value={formData.correct_answer} onChange={handleInputChange} required>
                  <option value="" disabled>Select Correct Answer</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Explanation (Optional)</label>
                <input type="text" name="explanation" placeholder="Explanation (Optional)" value={formData.explanation || ''} onChange={handleInputChange} />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="submit" className="add-btn">
              {isEditing ? 'Update Question' : 'Add Question'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="question-list-section">
        <h2>{mode === 'faculty' ? 'My Questions' : 'Question Directory'}</h2>
        
        <div className="modern-filters-container">
          <div className="filter-search-row">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" name="searchQuery" placeholder="Search by question code or text..." value={filters.searchQuery} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Subject</label>
              <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Unit</label>
              <select name="unit" value={filters.unit} onChange={handleFilterChange}>
                <option value="">All Units</option>
                {availableFilterUnits.map(u => (
                  <option key={u.id || u.unit_name} value={u.unit_name}>{u.unit_name}</option>
                ))}
              </select>
            </div>
            
            {mode === 'admin' && (
              <div className="filter-group">
                <label>Faculty</label>
                <select name="faculty_id" value={filters.faculty_id} onChange={handleFilterChange}>
                  <option value="">All Faculty</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {questionsLoading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : questionsError ? (
          <APIError error={questionsError} onRetry={() => refetchQuestions(true)} resourceName="Questions" />
        ) : (
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Subject & Unit</th>
                <th style={{ width: 'auto' }}>Question</th>
                {mode === 'admin' && <th style={{ width: '12%' }}>Created By</th>}
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: mode === 'admin' ? '120px' : '110px', minWidth: mode === 'admin' ? '120px' : '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'admin' ? 5 : 4} style={{ textAlign: 'center', padding: '20px' }}>
                    No questions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map(q => {
                  const truncateLength = mode === 'admin' ? 120 : 250;
                  const displayQuestion = q.question_text?.length > truncateLength 
                    ? q.question_text.substring(0, truncateLength) + '...' 
                    : q.question_text;

                  return (
                    <tr key={q.id}>
                      <td>
                        <div>{q.subject_name || 'N/A'}</div>
                        <div className="badge" style={{marginTop: '4px'}}>{q.unit}</div>
                      </td>
                      <td className="question-text-cell-container">
                        <div className="question-text-cell" title={q.question_text} style={{ maxWidth: '100%', whiteSpace: 'normal' }}>
                          {displayQuestion}
                        </div>
                        {mode === 'admin' && q.status === 'Rejected' && q.review_remarks && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '6px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                            <strong>Rejection Remarks:</strong> {q.review_remarks}
                          </div>
                        )}
                      </td>
                      {mode === 'admin' && <td>{q.creator_name || 'Admin'}</td>}
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: getBadgeColor(q.status) === 'green' ? '#d1fae5' : getBadgeColor(q.status) === 'red' ? '#fee2e2' : getBadgeColor(q.status) === 'orange' ? '#fef3c7' : '#f3f4f6',
                          color: getBadgeColor(q.status) === 'green' ? '#065f46' : getBadgeColor(q.status) === 'red' ? '#991b1b' : getBadgeColor(q.status) === 'orange' ? '#92400e' : '#374151'
                        }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-buttons" style={{ display: 'flex', flexDirection: mode === 'admin' ? 'column' : 'row', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                          {mode === 'faculty' ? (
                            <button className="secondary-btn" style={{ padding: '6px 14px', fontSize: '13px', width: '90px' }} onClick={() => openViewModal(q)}>View</button>
                          ) : (
                            <>
                              <button className="secondary-btn" style={{ padding: '6px 14px', fontSize: '12px', borderColor: '#cbd5e1', width: '90px' }} onClick={() => openViewModal(q)}>View</button>
                              {q.status === 'Pending Review' && (
                                <>
                                  <button className="primary-btn" style={{ padding: '6px 14px', fontSize: '12px', width: '90px' }} onClick={() => handleReviewAction(q.id, 'Approved')}>Approve</button>
                                  <button className="delete-btn" style={{ padding: '6px 14px', fontSize: '12px', width: '90px' }} onClick={() => handleReviewAction(q.id, 'Rejected')}>Reject</button>
                                </>
                              )}
                              <button className="edit-btn" style={{ padding: '6px 14px', fontSize: '12px', width: '90px' }} onClick={() => handleEditClick(q)}>Edit</button>
                              {q.status !== 'Archived' && (
                                 <button className="secondary-btn" style={{ padding: '6px 14px', fontSize: '12px', borderColor: '#cbd5e1', width: '90px' }} onClick={() => handleReviewAction(q.id, 'Archived')}>Archive</button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>

      {/* Reject Remarks Modal */}
      {isRejectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Reject Question</h3>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Review Remarks (Mandatory)</label>
              <textarea 
                rows={4} 
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                placeholder="E.g., Question is too ambiguous. Please rewrite..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={() => setIsRejectModalOpen(false)} disabled={isSubmittingReview}>Cancel</button>
              <button className="delete-btn" onClick={submitReject} disabled={isSubmittingReview}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {isViewModalOpen && viewTargetQuestion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px' }}>Question Details</h3>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                  backgroundColor: getBadgeColor(viewTargetQuestion.status) === 'green' ? '#d1fae5' : getBadgeColor(viewTargetQuestion.status) === 'red' ? '#fee2e2' : getBadgeColor(viewTargetQuestion.status) === 'orange' ? '#fef3c7' : '#f3f4f6',
                  color: getBadgeColor(viewTargetQuestion.status) === 'green' ? '#065f46' : getBadgeColor(viewTargetQuestion.status) === 'red' ? '#991b1b' : getBadgeColor(viewTargetQuestion.status) === 'orange' ? '#92400e' : '#374151'
                }}>
                  {viewTargetQuestion.status}
                </span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            {viewTargetQuestion.status === 'Rejected' && viewTargetQuestion.review_remarks && (
              <div style={{ marginBottom: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px' }}>Review Remarks</h4>
                <p style={{ margin: 0, color: '#dc2626', fontSize: '14px', lineHeight: '1.5' }}>{viewTargetQuestion.review_remarks}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Question Code</label>
                <div style={{ fontWeight: '500', color: '#0f172a' }}>{viewTargetQuestion.question_code}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Subject</label>
                <div style={{ fontWeight: '500', color: '#0f172a' }}>{viewTargetQuestion.subject_name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Unit</label>
                <div style={{ fontWeight: '500', color: '#0f172a' }}>{viewTargetQuestion.unit}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Submission Date</label>
                <div style={{ fontWeight: '500', color: '#0f172a' }}>{new Date(viewTargetQuestion.created_at).toLocaleDateString()}</div>
              </div>
              {mode === 'admin' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Created By</label>
                  <div style={{ fontWeight: '500', color: '#0f172a' }}>{viewTargetQuestion.creator_name || 'Admin'}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</label>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>{viewTargetQuestion.question_type}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Bloom's</label>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>{viewTargetQuestion.blooms_level}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Difficulty</label>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>{viewTargetQuestion.difficulty_level}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Marks</label>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>{viewTargetQuestion.marks}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Question Text</label>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {viewTargetQuestion.question_text}
              </div>
            </div>

            {viewTargetQuestion.question_type === 'MCQ' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Options</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: viewTargetQuestion.correct_answer === 'A' ? '#f0fdf4' : '#fff', borderColor: viewTargetQuestion.correct_answer === 'A' ? '#bbf7d0' : '#e2e8f0' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: viewTargetQuestion.correct_answer === 'A' ? '#166534' : '#64748b' }}>A.</span> {viewTargetQuestion.option_a}
                  </div>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: viewTargetQuestion.correct_answer === 'B' ? '#f0fdf4' : '#fff', borderColor: viewTargetQuestion.correct_answer === 'B' ? '#bbf7d0' : '#e2e8f0' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: viewTargetQuestion.correct_answer === 'B' ? '#166534' : '#64748b' }}>B.</span> {viewTargetQuestion.option_b}
                  </div>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: viewTargetQuestion.correct_answer === 'C' ? '#f0fdf4' : '#fff', borderColor: viewTargetQuestion.correct_answer === 'C' ? '#bbf7d0' : '#e2e8f0' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: viewTargetQuestion.correct_answer === 'C' ? '#166534' : '#64748b' }}>C.</span> {viewTargetQuestion.option_c}
                  </div>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: viewTargetQuestion.correct_answer === 'D' ? '#f0fdf4' : '#fff', borderColor: viewTargetQuestion.correct_answer === 'D' ? '#bbf7d0' : '#e2e8f0' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: viewTargetQuestion.correct_answer === 'D' ? '#166534' : '#64748b' }}>D.</span> {viewTargetQuestion.option_d}
                  </div>
                </div>
                {viewTargetQuestion.explanation && (
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Explanation:</strong> <span style={{ color: '#475569' }}>{viewTargetQuestion.explanation}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              {mode === 'faculty' && ['Pending Review', 'Rejected'].includes(viewTargetQuestion.status) && (
                <div style={{ display: 'flex', gap: '12px', marginRight: 'auto' }}>
                  <button className="edit-btn" onClick={() => { setIsViewModalOpen(false); handleEditClick(viewTargetQuestion); }}>Edit Question</button>
                  <button className="delete-btn" onClick={() => { setIsViewModalOpen(false); handleDeleteQuestion(viewTargetQuestion.id); }}>Delete</button>
                </div>
              )}
              <button className="secondary-btn" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default QuestionBank;
