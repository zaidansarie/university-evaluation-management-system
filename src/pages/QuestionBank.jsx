import React, { useState, useEffect } from 'react';
import './QuestionBank.css';

// Master Data for Dropdowns
const UNITS = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
const QUESTION_TYPES = ['MCQ', 'Short Answer', 'Long Answer', 'Numerical'];
const BLOOMS_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const MARKS = [1, 2, 3, 5, 10, 15];

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

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
    status: 'Active',
    created_by: ''
  });

  // Filter State
  const [filters, setFilters] = useState({
    subject_id: '',
    unit: '',
    question_type: '',
    difficulty_level: '',
    blooms_level: '',
    status: '',
    searchQuery: ''
  });

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes, facultyRes] = await Promise.all([
        fetch('http://localhost:5000/api/questions'),
        fetch('http://localhost:5000/api/subjects'),
        fetch('http://localhost:5000/api/faculty')
      ]);

      const questionsData = await questionsRes.json();
      const subjectsData = await subjectsRes.json();
      const facultyData = await facultyRes.json();

      setQuestions(questionsData);
      setSubjects(subjectsData);
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

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
      status: 'Active',
      created_by: ''
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        resetForm();
        fetchData();
        alert(`Question ${isEditing ? 'updated' : 'added'} successfully!`);
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} question. Check for duplicate code.`);
      }
    } catch (error) {
      console.error('Error saving question:', error);
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
      status: question.status || 'Active',
      created_by: question.created_by || ''
    });
    setIsEditing(true);
    setCurrentQuestionId(question.id);
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (isEditing && currentQuestionId === id) {
           resetForm();
        }
        fetchData();
        alert('Question deleted successfully!');
      } else {
        alert('Failed to delete question.');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Derived state for filtered questions
  const filteredQuestions = questions.filter(q => {
    // Dropdown filters
    if (filters.subject_id && q.subject_id?.toString() !== filters.subject_id) return false;
    if (filters.unit && q.unit !== filters.unit) return false;
    if (filters.question_type && q.question_type !== filters.question_type) return false;
    if (filters.difficulty_level && q.difficulty_level !== filters.difficulty_level) return false;
    if (filters.blooms_level && q.blooms_level !== filters.blooms_level) return false;
    if (filters.status && q.status !== filters.status) return false;

    // Search query (code or text)
    if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      const codeMatch = q.question_code?.toLowerCase().includes(lowerQuery);
      const textMatch = q.question_text?.toLowerCase().includes(lowerQuery);
      if (!codeMatch && !textMatch) return false;
    }

    return true;
  });

  return (
    <div className="question-bank-management">
      <section className="add-question-section">
        <h2>{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
        <form className="add-question-form" onSubmit={handleAddOrUpdateQuestion}>
          <div className="form-group">
            <input type="text" name="question_code" placeholder="Question Code (e.g. CS101-Q1)" value={formData.question_code} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required>
              <option value="" disabled>Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="unit" value={formData.unit} onChange={handleInputChange} required>
              <option value="" disabled>Select Unit</option>
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="question_type" value={formData.question_type} onChange={handleInputChange} required>
              <option value="" disabled>Select Type</option>
              {QUESTION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="blooms_level" value={formData.blooms_level} onChange={handleInputChange} required>
              <option value="" disabled>Bloom's Level</option>
              {BLOOMS_LEVELS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="difficulty_level" value={formData.difficulty_level} onChange={handleInputChange} required>
              <option value="" disabled>Difficulty</option>
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="marks" value={formData.marks} onChange={handleInputChange} required>
              <option value="" disabled>Marks</option>
              {MARKS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="created_by" value={formData.created_by} onChange={handleInputChange}>
              <option value="">Created By (Optional)</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group full-width">
            <textarea name="question_text" placeholder="Enter question text here..." value={formData.question_text} onChange={handleInputChange} required />
          </div>
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
        <h2>Question Directory</h2>
        
        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <input type="text" name="searchQuery" placeholder="Search code or text..." value={filters.searchQuery} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="unit" value={filters.unit} onChange={handleFilterChange}>
              <option value="">All Units</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="question_type" value={filters.question_type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="blooms_level" value={filters.blooms_level} onChange={handleFilterChange}>
              <option value="">All Bloom's Levels</option>
              {BLOOMS_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="difficulty_level" value={filters.difficulty_level} onChange={handleFilterChange}>
              <option value="">All Difficulties</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject & Unit</th>
                <th>Question</th>
                <th>Type & Bloom's</th>
                <th>Diff. & Marks</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No questions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map(q => (
                  <tr key={q.id}>
                    <td><strong>{q.question_code}</strong></td>
                    <td>
                      <div>{q.subject_name || 'N/A'}</div>
                      <div className="badge" style={{marginTop: '4px'}}>{q.unit}</div>
                    </td>
                    <td className="question-text-cell-container">
                      <div className="question-text-cell" title={q.question_text}>
                        {q.question_text}
                      </div>
                    </td>
                    <td>
                      <div>{q.question_type}</div>
                      <div className="badge" style={{marginTop: '4px'}}>{q.blooms_level}</div>
                    </td>
                    <td>
                      <div>{q.difficulty_level}</div>
                      <div className="badge" style={{marginTop: '4px'}}>{q.marks} Marks</div>
                    </td>
                    <td>{q.creator_name || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${q.status?.toLowerCase()}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditClick(q)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default QuestionBank;
