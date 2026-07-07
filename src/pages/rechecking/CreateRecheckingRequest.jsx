import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithHandling } from '../../utils/api';
import './Rechecking.css';

function CreateRecheckingRequest() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [papers, setPapers] = useState([]);
  
  const [formData, setFormData] = useState({
    student_id: '',
    paper_id: '',
    reason: '',
    priority: 'Normal',
    remarks: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, papersRes] = await Promise.all([
          fetchWithHandling('http://localhost:5000/api/students'),
          fetchWithHandling('http://localhost:5000/api/question-papers')
        ]);
        setStudents(studentsRes);
        setPapers(papersRes);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.paper_id || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      await fetchWithHandling('http://localhost:5000/api/rechecking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Rechecking request created successfully');
      navigate('/admin/rechecking');
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rechecking-form-container">Loading form data...</div>;
  }

  return (
    <div className="rechecking-form-container">
      <div className="rechecking-form-header">
        <Link to="/admin/rechecking" className="back-btn">&larr;</Link>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Create Rechecking Request</h2>
      </div>

      <div className="form-card">
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Manually create a rechecking request on behalf of a student. The student must have an evaluated answer sheet for the selected subject.
        </p>
        
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="filter-group" style={{ marginBottom: '20px' }}>
            <label>Student *</label>
            <select name="student_id" value={formData.student_id} onChange={handleInputChange} required style={{ width: '100%', maxWidth: '500px' }}>
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll_number})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ marginBottom: '20px' }}>
            <label>Subject / Examination *</label>
            <select name="paper_id" value={formData.paper_id} onChange={handleInputChange} required style={{ width: '100%', maxWidth: '500px' }}>
              <option value="">-- Select Subject --</option>
              {papers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.paper_title} - {p.exam_type} ({p.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ marginBottom: '20px' }}>
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleInputChange} style={{ width: '100%', maxWidth: '500px' }}>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="filter-group" style={{ marginBottom: '20px' }}>
            <label>Reason for Rechecking *</label>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleInputChange} 
              required
              rows="4"
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
              placeholder="Enter the student's reason for requesting rechecking..."
            />
          </div>

          <div className="filter-group" style={{ marginBottom: '32px' }}>
            <label>Additional Remarks (Optional)</label>
            <textarea 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleInputChange} 
              rows="2"
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRecheckingRequest;
