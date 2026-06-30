import React, { useState, useEffect } from 'react';
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
  const [subjectList, setSubjectList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
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
    status: 'Active'
  });

  const fetchData = async () => {
    try {
      // Fetch subjects and faculty in parallel
      const [subjectsRes, facultyRes] = await Promise.all([
        fetch('http://localhost:5000/api/subjects'),
        fetch('http://localhost:5000/api/faculty')
      ]);
      
      const subjects = await subjectsRes.json();
      const faculty = await facultyRes.json();
      
      setSubjectList(subjects);
      setFacultyList(faculty);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course') {
      setFormData({ ...formData, [name]: value, program: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
        const response = await fetch(`http://localhost:5000/api/subjects/${currentSubjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          resetForm();
          fetchData();
        } else {
          alert('Failed to update subject.');
        }
      } catch (error) {
        console.error('Error updating subject:', error);
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          resetForm();
          fetchData();
        } else {
          alert('Failed to add subject. Ensure Subject Code is unique.');
        }
      } catch (error) {
        console.error('Error adding subject:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      subject_code: '', subject_name: '', course: '', program: '',
      school: '', semester: '', credits: '', faculty_id: '', status: 'Active'
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
      status: subject.status || 'Active'
    });
    setIsEditing(true);
    setCurrentSubjectId(subject.id);
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/subjects/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (isEditing && currentSubjectId === id) {
           resetForm();
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
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
            <select name="faculty_id" value={formData.faculty_id} onChange={handleInputChange}>
              <option value="">Select Assigned Faculty (Optional)</option>
              {facultyList.map(faculty => (
                <option key={faculty.id} value={faculty.id}>{faculty.name} ({faculty.department})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
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
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Course & Program</th>
                <th>Sem</th>
                <th>Credits</th>
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
      </section>
    </div>
  );
}

export default SubjectManagement;
