import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import './QuestionPaperManagement.css';

const EXAM_TYPES = ['Mid Semester', 'End Semester', 'Quiz', 'Assignment', 'Practical'];
const ACADEMIC_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27', '2027-28'];

function QuestionPaperManagement() {
  const navigate = useNavigate();
  const { data: papers, loading: papersLoading, error: papersError, refetch: refetchPapers, setData: setPapers } = useApiData('/api/question-papers');
  const { data: subjects, loading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useApiData('/api/subjects');
  const { data: faculty, loading: facultyLoading, error: facultyError, refetch: refetchFaculty } = useApiData('/api/faculty');
  
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
    coverage_mode: 'All Units',
    custom_units: [],
    total_marks: 100,
    status: 'Active'
  });

  const defaultSectionConfig = {
    num_questions: 10, marks_per_question: 1, question_type: 'Mixed',
    diffDist: { Easy: 33, Medium: 33, Hard: 34 },
    bloomDist: { Remember: 16, Understand: 16, Apply: 17, Analyze: 17, Evaluate: 17, Create: 17 },
    internal_choice: 'No', optional_questions: 0, instructions: ''
  };

  const [sections, setSections] = useState([
    { name: 'Section A', description: '', total_marks: 10, config: { ...defaultSectionConfig } }
  ]);

  // Filter State
  const [filters, setFilters] = useState({
    academic_year: '',
    exam_type: '',
    subject_id: '',
    status: '',
    searchQuery: ''
  });

  // Form State
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
      setFormData({ ...formData, [name]: value, program: '', school: '', semester: '', subject_id: '', custom_units: [] });
    } else if (name === 'program') {
      setFormData({ ...formData, [name]: value, school: '', semester: '', subject_id: '', custom_units: [] });
    } else if (name === 'school') {
      setFormData({ ...formData, [name]: value, semester: '', subject_id: '', custom_units: [] });
    } else if (name === 'semester') {
      setFormData({ ...formData, [name]: value, subject_id: '', custom_units: [] });
    } else if (name === 'subject_id') {
      setFormData({ ...formData, [name]: value, custom_units: [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === 'total_marks' && sections.length === 1) {
      const newTotal = parseInt(value) || 0;
      setSections([{ ...sections[0], total_marks: newTotal }]);
    }
  };

  const handleUnitToggle = (unitName) => {
    setFormData(prev => {
      const currentUnits = prev.custom_units || [];
      if (currentUnits.includes(unitName)) {
        return { ...prev, custom_units: currentUnits.filter(u => u !== unitName) };
      } else {
        return { ...prev, custom_units: [...currentUnits, unitName] };
      }
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleNumSectionsChange = (e) => {
    let count = parseInt(e.target.value) || 1;
    if (count < 1) count = 1;
    if (count > 20) count = 20;
    
    const totalMarks = parseInt(formData.total_marks) || 0;
    const baseMarks = Math.floor(totalMarks / count);
    const remainder = totalMarks % count;
    
    const newSections = [];
    for (let i = 0; i < count; i++) {
      const existing = sections[i];
      const marks = baseMarks + (i === 0 ? remainder : 0);
      
      newSections.push({
        name: existing ? existing.name : `Section ${String.fromCharCode(65 + i)}`,
        description: existing ? existing.description : '',
        total_marks: marks,
        config: existing ? existing.config : { ...defaultSectionConfig }
      });
    }
    setSections(newSections);
  };

  const handleUpdateSection = (index, field, value) => {
    const updated = [...sections];
    if (field === 'num_questions' || field === 'question_type') {
      updated[index].config[field] = value;
    } else {
      updated[index][field] = value;
    }
    setSections(updated);
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
      coverage_mode: 'All Units',
      custom_units: [],
      total_marks: 100,
      status: 'Active'
    });
    setSections([
      { name: 'Section A', description: '', total_marks: 10, config: { ...defaultSectionConfig } }
    ]);
    setIsEditing(false);
    setCurrentPaperId(null);
  };

  const handleAddOrUpdatePaper = async (e) => {
    e.preventDefault();

    const calculatedTotal = sections.reduce((sum, sec) => sum + (parseInt(sec.total_marks) || 0), 0);
    const expectedTotal = parseInt(formData.total_marks) || 0;
    
    if (calculatedTotal !== expectedTotal) {
      alert(`Paper structure total is ${calculatedTotal} marks. It must equal the paper total of ${expectedTotal} marks.`);
      return;
    }

    const payload = { ...formData, sections };
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
        refetchPapers(true);
        alert(`Question paper ${isEditing ? 'updated' : 'added'} successfully!`);
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.error || 'A duplicate question paper already exists.');
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} question paper.`);
      }
    } catch (error) {
      console.error('Error saving question paper:', error);
      alert('Network error while saving question paper.');
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
      coverage_mode: paper.coverage_mode || 'All Units',
      custom_units: typeof paper.custom_units === 'string' ? JSON.parse(paper.custom_units) : (paper.custom_units || []),
      total_marks: paper.total_marks || 100,
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
        refetchPapers(true);
        alert('Question paper deleted successfully!');
      } else {
        alert('Failed to delete question paper.');
      }
    } catch (error) {
      console.error('Error deleting question paper:', error);
      alert('Network error while deleting question paper.');
    }
  };

  // Extract unique, dynamically populated lists from 'subjects' to ensure data consistency
  const availableCourses = [...new Set(subjects.map(s => s.course).filter(Boolean))];
  
  const availablePrograms = formData.course 
    ? [...new Set(subjects.filter(s => s.course === formData.course).map(s => s.program).filter(Boolean))] 
    : [];
    
  const availableSchools = formData.program 
    ? [...new Set(subjects.filter(s => s.course === formData.course && s.program === formData.program).map(s => s.school).filter(Boolean))] 
    : [];

  const availableSemesters = formData.school 
    ? [...new Set(subjects.filter(s => s.course === formData.course && s.program === formData.program && s.school === formData.school).map(s => s.semester).filter(Boolean))].sort((a,b)=>a-b)
    : [];

  const availableSubjects = formData.semester 
    ? subjects.filter(s => s.course === formData.course && s.program === formData.program && s.school === formData.school && s.semester?.toString() === formData.semester?.toString())
    : [];

  const selectedSubjectData = formData.subject_id 
    ? subjects.find(s => s.id.toString() === formData.subject_id.toString()) 
    : null;

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
            {subjectsLoading ? (
              <SkeletonLoader lines={1} height="38px" />
            ) : subjectsError ? (
              <APIError error={subjectsError} onRetry={() => refetchSubjects(true)} resourceName="Subjects" />
            ) : (
              <select name="course" value={formData.course} onChange={handleInputChange} required>
                <option value="" disabled>Select Course</option>
                {availableCourses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
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
            <select name="school" value={formData.school} onChange={handleInputChange} required disabled={!formData.program}>
              <option value="" disabled>{formData.program ? 'Select School' : 'Select Program First'}</option>
              {availableSchools.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="semester" value={formData.semester} onChange={handleInputChange} required disabled={!formData.school}>
              <option value="" disabled>{formData.school ? 'Select Semester' : 'Select School First'}</option>
              {availableSemesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            {subjectsLoading ? (
              <SkeletonLoader lines={1} height="38px" />
            ) : subjectsError ? (
              <APIError error={subjectsError} onRetry={() => refetchSubjects(true)} resourceName="Subjects" />
            ) : (
              <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required disabled={!formData.semester}>
                <option value="" disabled>{formData.semester ? 'Select Subject' : 'Select Semester First'}</option>
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="form-group">
            {facultyLoading ? (
              <SkeletonLoader lines={1} height="38px" />
            ) : facultyError ? (
              <APIError error={facultyError} onRetry={() => refetchFaculty(true)} resourceName="Faculty" />
            ) : (
              <select name="created_by" value={formData.created_by} onChange={handleInputChange}>
                <option value="">Created By (Optional)</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', color: '#1e293b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Total Marks</label>
              <input 
                type="number" 
                name="total_marks" 
                placeholder="100" 
                value={formData.total_marks} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', color: '#1e293b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Sections</label>
              <input 
                type="number" 
                value={sections.length} 
                onChange={handleNumSectionsChange} 
                min="1"
                max="20"
                required 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            {sections.map((sec, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>{`Section ${String.fromCharCode(65 + index)} Name`}</label>
                  <input type="text" value={sec.name} onChange={(e) => handleUpdateSection(index, 'name', e.target.value)} required />
                  
                  <label style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', marginBottom: '4px', display: 'block' }}>Section Title (Optional)</label>
                  <input type="text" value={sec.description} onChange={(e) => handleUpdateSection(index, 'description', e.target.value)} placeholder="e.g. Short Answer" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>{`Section ${String.fromCharCode(65 + index)} Marks`}</label>
                  <input type="number" value={sec.total_marks} onChange={(e) => handleUpdateSection(index, 'total_marks', e.target.value)} required min="1" />
                </div>
              </div>
            ))}
            
            {sections.reduce((sum, sec) => sum + (parseInt(sec.total_marks) || 0), 0) !== (parseInt(formData.total_marks) || 0) && (
              <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500', padding: '10px 0' }}>
                {(() => {
                  const calc = sections.reduce((sum, sec) => sum + (parseInt(sec.total_marks) || 0), 0);
                  const expected = parseInt(formData.total_marks) || 0;
                  if (calc < expected) return `Current Total = ${calc}. ${expected - calc} marks remaining.`;
                  return `Current Total = ${calc}. Reduce ${calc - expected} marks.`;
                })()}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <select name="coverage_mode" value={formData.coverage_mode} onChange={handleInputChange} required>
              <option value="All Units">All Units</option>
              <option value="Custom Units">Custom Unit Selection</option>
            </select>
          </div>
          
          {formData.coverage_mode === 'Custom Units' && selectedSubjectData && (
            <div className="form-group full-width" style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <label style={{display: 'block', marginBottom: '10px', fontWeight: '600', color: '#1e293b'}}>Select Units for Coverage</label>
              <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                {selectedSubjectData.units && selectedSubjectData.units.length > 0 ? (
                  selectedSubjectData.units.map(u => (
                    <label key={u.id} style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                      <input 
                        type="checkbox" 
                        checked={formData.custom_units.includes(u.unit_name)}
                        onChange={() => handleUnitToggle(u.unit_name)}
                      />
                      <span>Unit {u.unit_number}: {u.unit_name}</span>
                    </label>
                  ))
                ) : (
                  <span style={{color: '#64748b'}}>No units defined for this subject.</span>
                )}
              </div>
            </div>
          )}

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

        {papersLoading ? (
          <SkeletonLoader lines={5} height="45px" />
        ) : papersError ? (
          <APIError error={papersError} onRetry={() => refetchPapers(true)} resourceName="Question Papers" />
        ) : (
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
                        <button className="add-btn" style={{padding: '6px 12px', fontSize: '0.85rem'}} onClick={() => navigate(`/admin/question-papers/${p.id}/build`)}>Build Paper</button>
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
        )}
      </section>

    </div>
  );
}

export default QuestionPaperManagement;
