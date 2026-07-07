import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import APIError from '../../components/common/APIError';
import './Results.css';

function ResultGeneration() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    academic_year: '2023-24',
    exam_type: '',
    program: '',
    course: '',
    semester: '',
    section: ''
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear preview if criteria changes
    if (preview) setPreview(null);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!formData.academic_year || !formData.exam_type || !formData.program || !formData.course || !formData.semester) {
      alert('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithHandling('http://localhost:5000/api/results/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      const payload = {
        ...formData,
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
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Examination *</label>
              <select name="exam_type" value={formData.exam_type} onChange={handleInputChange} required>
                <option value="">Select Exam</option>
                <option value="Mid Semester">Mid Semester</option>
                <option value="End Semester">End Semester</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Programme *</label>
              <select name="program" value={formData.program} onChange={handleInputChange} required>
                <option value="">Select Programme</option>
                <option value="Computer Science Engineering (CSE)">Computer Science Engineering (CSE)</option>
                <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Course *</label>
              <select name="course" value={formData.course} onChange={handleInputChange} required>
                <option value="">Select Course</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="BCA">BCA</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Semester *</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} required>
                <option value="">Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Section (Optional)</label>
              <select name="section" value={formData.section} onChange={handleInputChange}>
                <option value="">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
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
                Found {preview.students.length} students across {preview.total_papers} subjects for this examination.
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
                  <th>Candidate Code</th>
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
                    <td>{student.candidate_code || '-'}</td>
                    <td>{student.subjects_evaluated} / {preview.total_papers}</td>
                    <td>{student.total_marks}</td>
                    <td>{student.percentage}%</td>
                    <td className={student.status.toLowerCase()}>{student.status}</td>
                  </tr>
                ))}
                {preview.students.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
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
