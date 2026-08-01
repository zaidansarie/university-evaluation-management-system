import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import './Results.css';

function ResultGeneration() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    academic_year: '',
    exam_type: '',
    program: '',
    course: '',
    semester: '',
    subject: '', // stores paper_id
    section: ''
  });

  const [options, setOptions] = useState({
    academic_year: [],
    exam_type: [],
    program: [],
    course: [],
    semester: [],
    subject: [] // array of {paper_id, subject}
  });

  const [validation, setValidation] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOptions({});
  }, []);

  const fetchOptions = async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const data = await fetchWithHandling(`http://localhost:5000/api/results/options?${query}`);
      
      if (!params.academic_year) setOptions(o => ({...o, academic_year: data}));
      else if (!params.exam_type) setOptions(o => ({...o, exam_type: data}));
      else if (!params.program) setOptions(o => ({...o, program: data}));
      else if (!params.course) setOptions(o => ({...o, course: data}));
      else if (!params.semester) setOptions(o => ({...o, semester: data}));
      else setOptions(o => ({...o, subject: data}));
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const validateSubject = async (paper_id) => {
    setValidation(null);
    try {
      const data = await fetchWithHandling(`http://localhost:5000/api/results/validate-generation?paper_id=${paper_id}`);
      setValidation(data);
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...formData, [name]: value };
    
    if (name === 'academic_year') {
      newForm.exam_type = ''; newForm.program = ''; newForm.course = ''; newForm.semester = ''; newForm.subject = '';
      if (value) fetchOptions({ academic_year: value });
    }
    else if (name === 'exam_type') {
      newForm.program = ''; newForm.course = ''; newForm.semester = ''; newForm.subject = '';
      if (value) fetchOptions({ academic_year: newForm.academic_year, exam_type: value });
    }
    else if (name === 'program') {
      newForm.course = ''; newForm.semester = ''; newForm.subject = '';
      if (value) fetchOptions({ academic_year: newForm.academic_year, exam_type: newForm.exam_type, program: value });
    }
    else if (name === 'course') {
      newForm.semester = ''; newForm.subject = '';
      if (value) fetchOptions({ academic_year: newForm.academic_year, exam_type: newForm.exam_type, program: newForm.program, course: value });
    }
    else if (name === 'semester') {
      newForm.subject = '';
      if (value) fetchOptions({ academic_year: newForm.academic_year, exam_type: newForm.exam_type, program: newForm.program, course: newForm.course, semester: value });
    }
    else if (name === 'subject') {
      if (value) validateSubject(value);
      else setValidation(null);
    }

    setFormData(newForm);
    setPreview(null);
    setError(null);
  };

  const isReadyForGeneration = validation && validation.uploaded > 0 && validation.uploaded === validation.linked && validation.linked === validation.assigned && validation.assigned === validation.completed;

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      alert('Please select a subject');
      return;
    }
    
    if (!isReadyForGeneration) {
      alert('Cannot generate results until all answer sheets have been evaluated.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithHandling('http://localhost:5000/api/results/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: formData.subject })
      });
      setPreview(res);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!preview || !preview.students || preview.students.length === 0) return;
    
    setSaving(true);
    try {
      const selectedSubjectData = options.subject.find(s => s.paper_id.toString() === formData.subject);
      const subjectName = selectedSubjectData ? selectedSubjectData.subject : '';
      
      const payload = {
        ...formData,
        paper_id: formData.subject,
        subject: subjectName,
        students: preview.students
      };
      
      await fetchWithHandling('http://localhost:5000/api/results/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Success, go back to dashboard
      navigate('/admin/results');
    } catch (err) {
      console.error('Generation error:', err);
      alert(err.message || 'Failed to generate results');
      setSaving(false);
    }
  };

  return (
    <div className="generation-container">
      <div className="generation-header">
        <Link to="/admin/results" className="back-btn">&larr;</Link>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Generate Results</h2>
      </div>

      <div className="generation-form">
        <form onSubmit={handlePreview}>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Academic Year *</label>
              <select name="academic_year" value={formData.academic_year} onChange={handleInputChange} required>
                <option value="">Select Academic Year</option>
                {options.academic_year.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Examination *</label>
              <select name="exam_type" value={formData.exam_type} onChange={handleInputChange} required disabled={!formData.academic_year}>
                <option value="">Select Exam</option>
                {options.exam_type.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Programme *</label>
              <select name="program" value={formData.program} onChange={handleInputChange} required disabled={!formData.exam_type}>
                <option value="">Select Programme</option>
                {options.program.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Course *</label>
              <select name="course" value={formData.course} onChange={handleInputChange} required disabled={!formData.program}>
                <option value="">Select Course</option>
                {options.course.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Semester *</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} required disabled={!formData.course}>
                <option value="">Select Semester</option>
                {options.semester.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Subject *</label>
              <select name="subject" value={formData.subject} onChange={handleInputChange} required disabled={!formData.semester}>
                <option value="">Select Subject</option>
                {options.subject.map(opt => <option key={opt.paper_id} value={opt.paper_id}>{opt.subject}</option>)}
              </select>
            </div>
          </div>
          
          {validation && (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', border: `1px solid ${isReadyForGeneration ? '#34d399' : '#f87171'}`, backgroundColor: isReadyForGeneration ? '#ecfdf5' : '#fef2f2' }}>
              <h4 style={{ margin: '0 0 12px 0', color: isReadyForGeneration ? '#065f46' : '#991b1b' }}>
                {isReadyForGeneration ? '✓ Ready for Result Generation' : '⚠ Evaluation Incomplete'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                <li><strong>{validation.uploaded}</strong> Answer Sheets Uploaded</li>
                <li><strong>{validation.linked}</strong> Answer Sheets Linked to Students</li>
                <li><strong>{validation.assigned}</strong> Evaluations Assigned to Faculty</li>
                <li><strong>{validation.completed}</strong> Evaluations Completed</li>
              </ul>
              {!isReadyForGeneration && (
                <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '13px', color: '#991b1b', fontWeight: '500' }}>
                  Please ensure all answer sheets are uploaded, linked, assigned, and completely evaluated before generating results.
                </p>
              )}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px', opacity: isReadyForGeneration ? 1 : 0.5 }} disabled={loading || !isReadyForGeneration}>
              {loading ? 'Processing...' : 'Preview Results'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ marginBottom: '24px' }}>
          <APIError error={error} onRetry={handlePreview} resourceName="Preview Data" />
        </div>
      )}

      {preview && (
        <div className="preview-section">
          <div className="preview-header">
            <div>
              <h3>Result Preview</h3>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                Found {preview.students.length} students for {preview.paper.paper_title}.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-outline" 
                style={{ padding: '8px 16px' }}
                onClick={() => setPreview(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-success" 
                style={{ padding: '8px 16px' }}
                onClick={handleGenerate}
                disabled={saving || preview.students.length === 0}
              >
                {saving ? 'Saving...' : 'Generate & Save Results'}
              </button>
            </div>
          </div>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subjects Eval.</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.students.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.roll_number}</td>
                    <td style={{ fontWeight: 500 }}>{student.student_name}</td>
                    <td>{student.subjects_evaluated} / 1</td>
                    <td>{student.total_marks}</td>
                    <td>{student.percentage}%</td>
                    <td className={student.status.toLowerCase()}>{student.status}</td>
                  </tr>
                ))}
                {preview.students.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No students found to generate results for.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultGeneration;
