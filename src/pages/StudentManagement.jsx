import React, { useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import './StudentManagement.css';

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
// -----------------------------------------------------------------

function StudentManagement() {
  const { data: studentList = [], loading, error, refetch: fetchStudents } = useApiData('/api/students');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  
  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    course: '',
    program: '',
    school: '',
    semester: '',
    section: '',
    phone_number: '',
    status: 'Active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course') {
      // Reset program if course changes
      setFormData({ ...formData, [name]: value, program: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing student
      try {
        await fetchWithHandling(`http://localhost:5000/api/students/${currentStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        resetForm();
        fetchStudents(true);
      } catch (error) {
        console.error('Error updating student:', error);
        alert(error.message || 'Error updating student');
      }
    } else {
      // Add new student
      try {
        await fetchWithHandling('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        resetForm();
        fetchStudents(true);
      } catch (error) {
        console.error('Error adding student:', error);
        alert(error.message || 'Error adding student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      roll_number: '', name: '', email: '', course: '', program: '',
      school: '', semester: '', section: '', phone_number: '', status: 'Active'
    });
    setIsEditing(false);
    setCurrentStudentId(null);
  };

  const handleEditClick = (student) => {
    setFormData({
      roll_number: student.roll_number || '',
      name: student.name || '',
      email: student.email || '',
      course: student.course || '',
      program: student.program || '',
      school: student.school || '',
      semester: student.semester || '',
      section: student.section || '',
      phone_number: student.phone_number || '',
      status: student.status || 'Active'
    });
    setIsEditing(true);
    setCurrentStudentId(student.id);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE'
      });
      // If the deleted student is currently being edited, reset the form
      if (isEditing && currentStudentId === id) {
         resetForm();
      }
      // Refresh table
      fetchStudents(true);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.message || 'Error deleting student');
    }
  };

  // Derived state for the dependent Program dropdown
  const availablePrograms = formData.course ? PROGRAMS_BY_COURSE[formData.course] || [] : [];

  return (
    <div className="student-management">
      {/* Add/Edit Student Form */}
      <section className="add-student-section">
        <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form className="add-student-form" onSubmit={handleAddOrUpdateStudent}>
          <div className="form-group">
            <input type="text" name="roll_number" placeholder="Roll Number / ID" value={formData.roll_number} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
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
            <select 
              name="program" 
              value={formData.program} 
              onChange={handleInputChange} 
              required 
              disabled={!formData.course}
            >
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
            <input type="text" name="section" placeholder="Section" value={formData.section} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="phone_number" placeholder="Phone Number (Optional)" value={formData.phone_number} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="add-btn">
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Student Directory Table */}
      <section className="student-list-section">
        <h2>Student Directory</h2>
        {loading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : error ? (
          <APIError error={error} onRetry={() => fetchStudents(true)} resourceName="Students" />
        ) : (
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course & Program</th>
                <th>Sem/Sec</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No students found. Add one above!
                  </td>
                </tr>
              ) : (
                studentList.map(student => (
                  <tr key={student.id}>
                    <td>{student.roll_number}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.course} - {student.program}</td>
                    <td>Sem {student.semester} / {student.section}</td>
                    <td>
                      <span className={`status-badge ${student.status?.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditClick(student)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>
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

export default StudentManagement;
