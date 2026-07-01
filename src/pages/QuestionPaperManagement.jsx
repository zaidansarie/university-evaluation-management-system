import React, { useState, useEffect } from 'react';
import './QuestionPaperManagement.css';

const EXAM_TYPES = ['Mid Semester', 'End Semester', 'Quiz', 'Assignment', 'Practical'];
const ACADEMIC_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27', '2027-28'];

function QuestionPaperManagement() {
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPaperId, setCurrentPaperId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    academic_year: '',
    exam_type: '',
    course: '',
    program: '',
    school: '',
    subject_id: '',
    semester: '',
    paper_title: '',
    created_by: '',
    status: 'Active'
  });

  // Filter State
  const [filters, setFilters] = useState({
    academic_year: '',
    exam_type: '',
    subject_id: '',
    status: '',
    searchQuery: ''
  });

  const fetchData = async () => {
    try {
      const [papersRes, subjectsRes, facultyRes] = await Promise.all([
        fetch('http://localhost:5000/api/question-papers'),
        fetch('http://localhost:5000/api/subjects'),
        fetch('http://localhost:5000/api/faculty')
      ]);

      const papersData = await papersRes.json();
      const subjectsData = await subjectsRes.json();
      const facultyData = await facultyRes.json();

      setPapers(papersData);
      setSubjects(subjectsData);
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Title Auto-Generation Logic
  useEffect(() => {
    if (formData.exam_type && formData.subject_id) {
      const selectedSubject = subjects.find(s => s.id.toString() === formData.subject_id.toString());
      if (selectedSubject) {
        let generatedTitle = `${formData.exam_type} - ${selectedSubject.subject_name} (${selectedSubject.subject_code})`;
        if (formData.semester) {
          generatedTitle += ` - Sem ${formData.semester}`;
        }
        if (formData.academic_year && (formData.exam_type === 'Mid Semester' || formData.exam_type === 'End Semester')) {
          generatedTitle += ` - AY ${formData.academic_year}`;
        }
        
        setFormData(prev => {
          // Only update if title actually changed to prevent infinite loops
          if (prev.paper_title !== generatedTitle) {
            return { ...prev, paper_title: generatedTitle };
          }
          return prev;
        });
      }
    } else {
      setFormData(prev => {
        if (prev.paper_title !== '') return { ...prev, paper_title: '' };
        return prev;
      });
    }
  }, [formData.academic_year, formData.exam_type, formData.subject_id, formData.semester, subjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Reset dependent fields when parent fields change
    if (name === 'course') {
      setFormData({ ...formData, [name]: value, program: '', subject_id: '' });
    } else if (name === 'program' || name === 'school') {
      setFormData({ ...formData, [name]: value, subject_id: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      academic_year: '',
      exam_type: '',
      course: '',
      program: '',
      school: '',
      subject_id: '',
      semester: '',
      paper_title: '',
      created_by: '',
      status: 'Active'
    });
    setIsEditing(false);
    setCurrentPaperId(null);
  };

  const handleAddOrUpdatePaper = async (e) => {
    e.preventDefault();

    const payload = { ...formData };
    if (!payload.created_by) payload.created_by = null;
    
    // Ensure semester is converted to number if possible, or null
    if (!payload.semester) payload.semester = null;

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/question-papers/${currentPaperId}` 
        : 'http://localhost:5000/api/question-papers';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        resetForm();
        fetchData();
        alert(`Question paper ${isEditing ? 'updated' : 'added'} successfully!`);
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.error || 'A duplicate question paper already exists.');
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} question paper.`);
      }
    } catch (error) {
      console.error('Error saving question paper:', error);
    }
  };

  const handleEditClick = (paper) => {
    setFormData({
      academic_year: paper.academic_year || '',
      exam_type: paper.exam_type || '',
      course: paper.course || '',
      program: paper.program || '',
      school: paper.school || '',
      subject_id: paper.subject_id || '',
      semester: paper.semester || '',
      paper_title: paper.paper_title || '',
      created_by: paper.created_by || '',
      status: paper.status || 'Active'
    });
    setIsEditing(true);
    setCurrentPaperId(paper.id);
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/question-papers/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (isEditing && currentPaperId === id) {
           resetForm();
        }
        fetchData();
        alert('Question paper deleted successfully!');
      } else {
        alert('Failed to delete question paper.');
      }
    } catch (error) {
      console.error('Error deleting question paper:', error);
    }
  };

  // Extract unique, dynamically populated lists from 'subjects' to avoid hardcoding
  const uniqueCourses = [...new Set(subjects.map(s => s.course).filter(Boolean))];
  const uniqueSchools = [...new Set(subjects.map(s => s.school).filter(Boolean))];
  const uniqueSemesters = [...new Set(subjects.map(s => s.semester).filter(Boolean))].sort((a,b)=>a-b);
  
  // Programs depend on selected course
  const availablePrograms = formData.course 
    ? [...new Set(subjects.filter(s => s.course === formData.course).map(s => s.program).filter(Boolean))] 
    : [];
    
  // Subjects depend on course, program, school
  const availableSubjects = subjects.filter(s => {
    if (formData.course && s.course !== formData.course) return false;
    if (formData.program && s.program !== formData.program) return false;
    if (formData.school && s.school !== formData.school) return false;
    return true;
  });

  // Derived state for filtered question papers
  const filteredPapers = papers.filter(p => {
    if (filters.academic_year && p.academic_year !== filters.academic_year) return false;
    if (filters.exam_type && p.exam_type !== filters.exam_type) return false;
    if (filters.subject_id && p.subject_id?.toString() !== filters.subject_id) return false;
    if (filters.status && p.status !== filters.status) return false;

    if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      const titleMatch = p.paper_title?.toLowerCase().includes(lowerQuery);
      if (!titleMatch) return false;
    }

    return true;
  });

  return (
    <div className="question-paper-management">
      <section className="add-paper-section">
        <h2>{isEditing ? 'Edit Question Paper' : 'Create New Question Paper'}</h2>
        <form className="add-paper-form" onSubmit={handleAddOrUpdatePaper}>
          <div className="form-group">
            <select name="academic_year" value={formData.academic_year} onChange={handleInputChange} required>
              <option value="" disabled>Select Academic Year</option>
              {ACADEMIC_YEARS.map(ay => (
                <option key={ay} value={ay}>{ay}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="exam_type" value={formData.exam_type} onChange={handleInputChange} required>
              <option value="" disabled>Select Exam Type</option>
              {EXAM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="course" value={formData.course} onChange={handleInputChange} required>
              <option value="" disabled>Select Course</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="program" value={formData.program} onChange={handleInputChange} required disabled={!formData.course}>
              <option value="" disabled>{formData.course ? 'Select Program' : 'Select Course First'}</option>
              {availablePrograms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="school" value={formData.school} onChange={handleInputChange} required>
              <option value="" disabled>Select School</option>
              {uniqueSchools.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="semester" value={formData.semester} onChange={handleInputChange} required>
              <option value="" disabled>Select Semester</option>
              {uniqueSemesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required>
              <option value="" disabled>Select Subject</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
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
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569'}}>Generated Paper Title (Auto-fills automatically)</label>
            <input 
              type="text" 
              name="paper_title" 
              placeholder="Paper Title will appear here..." 
              value={formData.paper_title} 
              readOnly 
              required 
            />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="add-btn">
              {isEditing ? 'Update Question Paper' : 'Create Question Paper'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="paper-list-section">
        <h2>Question Paper Directory</h2>
        
        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <input type="text" name="searchQuery" placeholder="Search by title..." value={filters.searchQuery} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange}>
              <option value="">All Academic Years</option>
              {ACADEMIC_YEARS.map(ay => <option key={ay} value={ay}>{ay}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="exam_type" value={filters.exam_type} onChange={handleFilterChange}>
              <option value="">All Exam Types</option>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
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
                <th>Paper Title</th>
                <th>AY & Sem</th>
                <th>Course Details</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No question papers found. Create one above!
                  </td>
                </tr>
              ) : (
                filteredPapers.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.paper_title}</strong></td>
                    <td>
                      <div>AY {p.academic_year}</div>
                      <div className="badge">Sem {p.semester}</div>
                    </td>
                    <td>
                      <div>{p.course} - {p.program}</div>
                      <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '4px'}}>{p.school}</div>
                    </td>
                    <td>{p.creator_name || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${p.status?.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditClick(p)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeletePaper(p.id)}>Delete</button>
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

export default QuestionPaperManagement;
