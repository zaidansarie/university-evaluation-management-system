import React, { useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { fetchWithHandling } from '../utils/api';
import APIError from '../components/common/APIError';
import SkeletonLoader from '../components/common/SkeletonLoader';
import './FacultyManagement.css';

function FacultyManagement() {
  const { data: facultyList = [], loading, error, refetch: fetchFaculty } = useApiData('/api/faculty');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone_number: '',
    status: 'Active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithHandling('http://localhost:5000/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      // Clear form
      setFormData({ name: '', email: '', department: '', phone_number: '', status: 'Active' });
      // Refresh table
      fetchFaculty(true);
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert(error.message || 'Failed to add faculty.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const response = await fetchWithHandling(`http://localhost:5000/api/faculty/${id}`, {
        method: 'DELETE'
      });
      // Refresh table
      fetchFaculty(true);
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert(error.message || 'Failed to delete faculty.');
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
        {loading ? (
          <div style={{padding: '20px'}}>
            <SkeletonLoader lines={5} height="40px" />
          </div>
        ) : error ? (
          <APIError error={error} onRetry={() => fetchFaculty(true)} resourceName="Faculty" />
        ) : (
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
        )}
      </section>
    </div>
  );
}

export default FacultyManagement;
