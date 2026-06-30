import React, { useState, useEffect } from 'react';
import './StudentManagement.css';

function StudentManagement() {
  const [studentList, setStudentList] = useState([]);
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

  // Fetch all students from backend
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      const data = await response.json();
      setStudentList(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing student
      try {
        const response = await fetch(`http://localhost:5000/api/students/${currentStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          resetForm();
          fetchStudents();
        } else {
          alert('Failed to update student.');
        }
      } catch (error) {
        console.error('Error updating student:', error);
      }
    } else {
      // Add new student
      try {
        const response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          resetForm();
          fetchStudents();
        } else {
          alert('Failed to add student. Ensure Roll Number and Email are unique.');
        }
      } catch (error) {
        console.error('Error adding student:', error);
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
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // If the deleted student is currently being edited, reset the form
        if (isEditing && currentStudentId === id) {
           resetForm();
        }
        // Refresh table
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

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
            <input type="text" name="course" placeholder="Course (e.g. B.Tech)" value={formData.course} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="program" placeholder="Program / Branch" value={formData.program} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="school" placeholder="School (e.g. School of CS)" value={formData.school} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="number" name="semester" placeholder="Semester" value={formData.semester} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="section" placeholder="Section/Batch" value={formData.section} onChange={handleInputChange} required />
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
      </section>
    </div>
  );
}

export default StudentManagement;
