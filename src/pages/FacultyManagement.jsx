import React, { useState, useEffect } from 'react';
import './FacultyManagement.css';

function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone_number: '',
    status: 'Active'
  });

  // Fetch all faculty from backend
  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faculty');
      const data = await response.json();
      setFacultyList(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Clear form
        setFormData({ name: '', email: '', department: '', phone_number: '', status: 'Active' });
        // Refresh table
        fetchFaculty();
      } else {
        alert('Failed to add faculty. Make sure the email is unique.');
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/faculty/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh table
        fetchFaculty();
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
    }
  };

  return (
    <div className="faculty-management">
      {/* Add Faculty Form */}
      <section className="add-faculty-section">
        <h2>Add New Faculty</h2>
        <form className="add-faculty-form" onSubmit={handleAddFaculty}>
          <div className="form-group">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="add-btn">Add Faculty</button>
        </form>
      </section>

      {/* Faculty Directory Table */}
      <section className="faculty-list-section">
        <h2>Faculty Directory</h2>
        <div className="table-responsive">
          {/* Reusing AdminDashboard.css table styles */}
          <table className="activity-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No faculty found. Add one above!
                  </td>
                </tr>
              ) : (
                facultyList.map(faculty => (
                  <tr key={faculty.id}>
                    <td>{faculty.name}</td>
                    <td>{faculty.email}</td>
                    <td>{faculty.department}</td>
                    <td>{faculty.phone_number}</td>
                    <td>
                      <span className={`status-badge ${faculty.status.toLowerCase()}`}>
                        {faculty.status}
                      </span>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteFaculty(faculty.id)}>
                        Delete
                      </button>
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

export default FacultyManagement;
