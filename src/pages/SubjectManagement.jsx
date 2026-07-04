import React, { useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import './SubjectManagement.css';

// -- MASTER DATA (Static for now, can be fetched from DB later) --
const COURSES = ['B.Tech', 'B.Sc', 'BBA', 'MBA', 'M.Tech', 'MCA', 'PhD', 'Other'];

const SCHOOLS = [
  'School of Computer Science',
  'School of Engineering',
  'School of Business',
  'School of Law',
  'School of Design',
  'School of Health Sciences',
  'Other'
];

const PROGRAMS_BY_COURSE = {
  'B.Tech': [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics Engineering',
    'Electrical Engineering',
    'Chemical Engineering'
  ],
  'B.Sc': [
    'Computer Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biotechnology'
  ],
  'BBA': [
    'General',
    'Finance',
    'Marketing',
    'Human Resource'
  ],
  'MBA': [
    'General',
    'Finance',
    'Marketing',
    'Human Resource',
    'Information Technology'
  ],
  'M.Tech': [
    'Computer Science',
    'Embedded Systems',
    'VLSI',
    'Structural Engineering',
    'Thermal Engineering'
  ],
  'MCA': [
    'General',
    'Software Engineering',
    'AI & ML'
  ],
  'PhD': [
    'Computer Science',
    'Management',
    'Physics',
    'Chemistry',
    'Engineering'
  ],
  'Other': [
    'General'
  ]
};

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);
const CREDITS = [1, 2, 3, 4, 5, 6];
// -----------------------------------------------------------------

function SubjectManagement() {
  const { data: subjectList = [], loading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useApiData('/api/subjects');
  const { data: facultyList = [], loading: facultyLoading, error: facultyError, refetch: refetchFaculty } = useApiData('/api/faculty');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    course: '',
    program: '',
    school: '',
    semester: '',
    credits: '',
    faculty_id: '',
    status: 'Active',
    units: [{ unit_name: '' }] // Initialize with one empty unit
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course') {
      setFormData({ ...formData, [name]: value, program: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUnitChange = (index, value) => {
    const newUnits = [...formData.units];
    newUnits[index].unit_name = value;
    setFormData({ ...formData, units: newUnits });
  };

  const addUnitField = () => {
    setFormData({ ...formData, units: [...formData.units, { unit_name: '' }] });
  };

  const removeUnitField = (index) => {
    const newUnits = [...formData.units];
    newUnits.splice(index, 1);
    setFormData({ ...formData, units: newUnits });
  };

  const handleAddOrUpdateSubject = async (e) => {
    e.preventDefault();
    
    // Prepare payload (convert empty faculty_id string to null so DB constraint is happy)
    const payload = { ...formData };
    if (!payload.faculty_id) {
        payload.faculty_id = null;
    }
    
    if (isEditing) {
      try {
        const response = await fetchWithHandling(`http://localhost:5000/api/subjects/${currentSubjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        resetForm();
        refetchSubjects(true);
      } catch (error) {
        console.error('Error updating subject:', error);
        alert(error.message || 'Failed to update subject.');
      }
    } else {
      try {
        const response = await fetchWithHandling('http://localhost:5000/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        resetForm();
        refetchSubjects(true);
      } catch (error) {
        console.error('Error adding subject:', error);
        alert(error.message || 'Failed to add subject.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      subject_code: '', subject_name: '', course: '', program: '',
      school: '', semester: '', credits: '', faculty_id: '', status: 'Active', units: [{ unit_name: '' }]
    });
    setIsEditing(false);
    setCurrentSubjectId(null);
  };

  const handleEditClick = (subject) => {
    setFormData({
      subject_code: subject.subject_code || '',
      subject_name: subject.subject_name || '',
      course: subject.course || '',
      program: subject.program || '',
      school: subject.school || '',
      semester: subject.semester || '',
      credits: subject.credits || '',
      faculty_id: subject.faculty_id || '',
      status: subject.status || 'Active',
      units: subject.units && subject.units.length > 0 
        ? subject.units.map(u => ({ unit_name: u.unit_name })) 
        : [{ unit_name: '' }]
    });
    setIsEditing(true);
    setCurrentSubjectId(subject.id);
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/subjects/${id}`, {
        method: 'DELETE'
      });
      if (isEditing && currentSubjectId === id) {
         resetForm();
      }
      refetchSubjects(true);
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert(error.message || 'Failed to delete subject.');
    }
  };

  const availablePrograms = formData.course ? PROGRAMS_BY_COURSE[formData.course] || [] : [];

  return (
    <div className="subject-management">
      <section className="add-subject-section">
        <h2>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h2>
        <form className="add-subject-form" onSubmit={handleAddOrUpdateSubject}>
          <div className="form-group">
            <input type="text" name="subject_code" placeholder="Subject Code" value={formData.subject_code} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="subject_name" placeholder="Subject Name" value={formData.subject_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <select name="course" value={formData.course} onChange={handleInputChange} required>
              <option value="" disabled>Select Course</option>
              {COURSES.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="program" value={formData.program} onChange={handleInputChange} required disabled={!formData.course}>
              <option value="" disabled>
                {!formData.course ? 'Select Course First' : 'Select Program'}
              </option>
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="school" value={formData.school} onChange={handleInputChange} required>
              <option value="" disabled>Select School</option>
              {SCHOOLS.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="semester" value={formData.semester} onChange={handleInputChange} required>
              <option value="" disabled>Select Semester</option>
              {SEMESTERS.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="credits" value={formData.credits} onChange={handleInputChange} required>
              <option value="" disabled>Select Credits</option>
              {CREDITS.map(credit => (
                <option key={credit} value={credit}>{credit}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            {facultyLoading ? (
              <SkeletonLoader lines={1} height="38px" />
            ) : facultyError ? (
              <APIError error={facultyError} onRetry={() => refetchFaculty(true)} resourceName="Faculty" />
            ) : (
              <select name="faculty_id" value={formData.faculty_id} onChange={handleInputChange}>
                <option value="">Select Assigned Faculty (Optional)</option>
                {facultyList.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name} ({faculty.department})</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Subject Units</h3>
              <button type="button" onClick={addUnitField} style={{ padding: '4px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                + Add Unit
              </button>
            </div>
            {formData.units.map((unit, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '80px', padding: '10px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
                  Unit {index + 1}
                </div>
                <input 
                  type="text" 
                  placeholder="Unit Name (e.g. Introduction to DBMS)" 
                  value={unit.unit_name} 
                  onChange={(e) => handleUnitChange(index, e.target.value)} 
                  required 
                  style={{ flex: 1 }}
                />
                {formData.units.length > 1 && (
                  <button type="button" onClick={() => removeUnitField(index)} style={{ padding: '0 15px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="add-btn">
              {isEditing ? 'Update Subject' : 'Add Subject'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="subject-list-section">
        <h2>Subject Directory</h2>
        {subjectsLoading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : subjectsError ? (
          <APIError error={subjectsError} onRetry={() => refetchSubjects(true)} resourceName="Subjects" />
        ) : (
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Course & Program</th>
                <th>Sem</th>
                <th>Credits</th>
                <th>Units</th>
                <th>Assigned Faculty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No subjects found. Add one above!
                  </td>
                </tr>
              ) : (
                subjectList.map(subject => (
                  <tr key={subject.id}>
                    <td>{subject.subject_code}</td>
                    <td>{subject.subject_name}</td>
                    <td>{subject.course} - {subject.program}</td>
                    <td>Sem {subject.semester}</td>
                    <td>{subject.credits}</td>
                    <td>{subject.units ? subject.units.length : 0} Units</td>
                    <td>{subject.assigned_faculty_name || 'Not Assigned'}</td>
                    <td>
                      <span className={`status-badge ${subject.status?.toLowerCase()}`}>
                        {subject.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditClick(subject)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteSubject(subject.id)}>
                          Delete
                        </button>
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

export default SubjectManagement;
