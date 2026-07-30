import React, { useState, useEffect } from 'react';
import { fetchWithHandling } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUniversity, setCurrentUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    status: 'active'
  });
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const data = await fetchWithHandling('http://localhost:5000/api/universities');
      setUniversities(data);
    } catch (error) {
      showToast('Failed to fetch universities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (university = null) => {
    if (university) {
      setCurrentUniversity(university);
      setFormData(university);
    } else {
      setCurrentUniversity(null);
      setFormData({
        name: '', code: '', email: '', phone: '', website: '',
        address: '', city: '', state: '', country: '', status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUniversity(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUniversity) {
        await fetchWithHandling(`http://localhost:5000/api/universities/${currentUniversity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('University updated successfully', 'success');
      } else {
        const res = await fetchWithHandling('http://localhost:5000/api/universities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast(`University created successfully. Admin: ${res.adminEmail} (Pwd: ${res.tempPassword})`, 'success');
      }
      handleCloseModal();
      fetchUniversities();
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this university? This will also remove the default admin.')) {
      try {
        await fetchWithHandling(`http://localhost:5000/api/universities/${id}`, {
          method: 'DELETE'
        });
        showToast('University deleted successfully', 'success');
        fetchUniversities();
      } catch (error) {
        showToast('Failed to delete university', 'error');
      }
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>University Management</h2>
          <p className="text-secondary">Manage universities, default admins, and global platform status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Create University</button>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading universities...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Admin Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.code}</strong></td>
                  <td>{u.name}</td>
                  <td>{u.admin_email || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(u)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} style={{ marginLeft: '8px' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {universities.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No universities found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{currentUniversity ? 'Edit University' : 'Create New University'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>University Name *</label>
                    <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>University Code</label>
                    <input type="text" name="code" className="form-control" value={formData.code} onChange={handleInputChange} placeholder="Auto-generated if empty" disabled={!!currentUniversity} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Email *</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Phone</label>
                    <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input type="url" name="website" className="form-control" value={formData.website} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea name="address" className="form-control" value={formData.address} onChange={handleInputChange} rows="2"></textarea>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>City</label>
                    <input type="text" name="city" className="form-control" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>State</label>
                    <input type="text" name="state" className="form-control" value={formData.state} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{currentUniversity ? 'Save Changes' : 'Create University'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityManagement;
