import React, { useState, useEffect, useRef } from 'react';
import { fetchWithHandling } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { 
  Search, Filter, MoreVertical, Edit, Trash2, 
  Building, CheckCircle, XCircle, Copy, Plus, 
  ChevronLeft, ChevronRight, School, AlertCircle
} from 'lucide-react';
import Select from 'react-select';
import { Country, State } from 'country-state-city';
import './UniversityManagement.css';

function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUniversity, setCurrentUniversity] = useState(null);
  
  // Action Menu
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const menuRef = useRef(null);

  // Success Dialog
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, data: null });

  const [formData, setFormData] = useState({
    name: '', code: '', email: '', phone: '', website: '',
    address: '', city: '', state: '', country: 'India', status: 'active'
  });
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchUniversities();
    
    // Close action menu on click outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        address: '', city: '', state: '', country: 'India', status: 'active'
      });
    }
    setIsModalOpen(true);
    setActionMenuOpen(null);
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
      // Format website to prepend https:// if missing
      let finalWebsite = formData.website?.trim() || '';
      if (finalWebsite && !/^https?:\/\//i.test(finalWebsite)) {
        finalWebsite = 'https://' + finalWebsite;
      }
      
      const dataToSubmit = { ...formData, website: finalWebsite };

      if (currentUniversity) {
        await fetchWithHandling(`http://localhost:5000/api/universities/${currentUniversity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit)
        });
        showToast('University updated successfully', 'success');
        handleCloseModal();
      } else {
        const res = await fetchWithHandling('http://localhost:5000/api/universities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit)
        });
        handleCloseModal();
        setSuccessDialog({
          isOpen: true,
          data: { adminEmail: res.adminEmail, tempPassword: res.tempPassword, name: res.name }
        });
      }
      fetchUniversities();
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    setActionMenuOpen(null);
    if (window.confirm('Are you sure you want to delete this university? This will also remove the default admin account.')) {
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  // Derived State
  const totalUniversities = universities.length;
  const activeUniversities = universities.filter(u => u.status === 'active').length;
  const inactiveUniversities = universities.filter(u => u.status === 'inactive').length;
  const totalAdmins = universities.filter(u => u.admin_email).length;

  const filteredUniversities = universities.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? u.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUniversities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredUniversities.slice(startIndex, startIndex + rowsPerPage);

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
  };

  // Dropdown Configuration
  const countryOptions = Country.getAllCountries().map(c => ({
    value: c.name,
    label: c.name,
    isoCode: c.isoCode
  }));

  const getStatesForCountry = (countryName) => {
    if (!countryName) return [];
    const country = Country.getAllCountries().find(c => c.name === countryName);
    if (!country) return [];
    return State.getStatesOfCountry(country.isoCode).map(s => ({
      value: s.name,
      label: s.name
    }));
  };

  const stateOptions = getStatesForCountry(formData.country);

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
      },
      padding: '2px',
      borderRadius: '6px'
    })
  };

  return (
    <div className="university-management-container dashboard-content">
      <div className="um-header-container">
        <div className="um-header-row">
          <div className="um-header-left">
            <h2>University Management</h2>
            <p className="text-secondary" style={{ marginTop: '6px' }}>
              Manage platform tenants, university profiles, and default administrative accounts.
            </p>
          </div>
          <div className="um-header-right">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search universities by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>
        <div className="um-header-row" style={{ marginTop: '16px' }}>
          <div className="um-header-left"></div>
          <div className="um-header-right">
            <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Create University
            </button>
          </div>
        </div>
      </div>

      <section className="summary-cards">
        <div className="card">
          <h3>Total Universities</h3>
          <p className="card-value">{totalUniversities}</p>
        </div>
        <div className="card">
          <h3>Active Universities</h3>
          <p className="card-value" style={{ color: '#16a34a' }}>{activeUniversities}</p>
        </div>
        <div className="card">
          <h3>Inactive Universities</h3>
          <p className="card-value" style={{ color: '#dc2626' }}>{inactiveUniversities}</p>
        </div>
        <div className="card">
          <h3>Total Univ. Admins</h3>
          <p className="card-value">{totalAdmins}</p>
        </div>
      </section>

      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading universities...
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="empty-state modern-empty-state">
          <div className="empty-state-icon-wrapper">
            <Building className="empty-state-icon" />
          </div>
          <h3>No Universities Found</h3>
          <p className="empty-state-text">{searchTerm || statusFilter ? "No universities match your current filters. Try adjusting your search criteria." : "You haven't added any universities yet."}</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> Add First University
          </button>
        </div>
      ) : (
        <div className="modern-table-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>University</th>
                <th>Code</th>
                <th>Admin Contact</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="university-cell">
                      <div className="avatar-placeholder">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.website || 'No website provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                      {u.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: '#1e293b' }}>{u.admin_email || 'No admin provisioned'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.phone || 'No phone'}</div>
                  </td>
                  <td>
                    {u.city && u.state ? `${u.city}, ${u.state}` : (u.city || u.state || 'N/A')}
                  </td>
                  <td>
                    <span className={`badge badge-${u.status}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-menu" ref={actionMenuOpen === u.id ? menuRef : null}>
                      <button className="action-btn" onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}>
                        <MoreVertical size={18} />
                      </button>
                      {actionMenuOpen === u.id && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => handleOpenModal(u)}>
                            <Edit size={16} /> Edit
                          </button>
                          <button className="dropdown-item danger" onClick={() => handleDelete(u.id)}>
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls">
            <div className="rows-per-page">
              <span>Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="filter-select"
                style={{ padding: '4px 8px' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span style={{ marginLeft: '12px' }}>
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredUniversities.length)} of {filteredUniversities.length}
              </span>
            </div>
            <div className="page-buttons">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-large" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{currentUniversity ? 'Edit University Profile' : 'Create New University'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
              <form id="university-form" onSubmit={handleSubmit}>
                <div className="form-section">
                  <h4 className="form-section-title">University Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>University Name *</label>
                      <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Stanford University" />
                    </div>
                    <div className="form-group">
                      <label>University Code</label>
                      <input type="text" name="code" className="form-control" value={formData.code} onChange={handleInputChange} placeholder="Auto-generated if left empty" disabled={!!currentUniversity} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Primary Contact Email *</label>
                      <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required placeholder="contact@university.edu" />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 8900" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Official Website</label>
                      <input 
                        type="text" 
                        name="website" 
                        className="form-control" 
                        value={formData.website} 
                        onChange={handleInputChange} 
                        placeholder="e.g. university.edu or https://www.university.edu" 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Location & Address</h4>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Street Address</label>
                    <textarea name="address" className="form-control" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Full street address"></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Country</label>
                      <Select
                        options={countryOptions}
                        value={countryOptions.find(c => c.value === formData.country) || null}
                        onChange={(option) => setFormData({ ...formData, country: option ? option.value : '', state: '' })}
                        isClearable
                        placeholder="Select country..."
                        styles={customSelectStyles}
                      />
                    </div>
                    <div className="form-group">
                      <label>State / Province</label>
                      {stateOptions.length > 0 ? (
                        <Select
                          options={stateOptions}
                          value={stateOptions.find(s => s.value === formData.state) || null}
                          onChange={(option) => setFormData({ ...formData, state: option ? option.value : '' })}
                          isClearable
                          placeholder="Select state..."
                          styles={customSelectStyles}
                        />
                      ) : (
                        <input 
                          type="text" 
                          name="state" 
                          className="form-control" 
                          value={formData.state} 
                          onChange={handleInputChange} 
                          placeholder="e.g. California"
                        />
                      )}
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" className="form-control" value={formData.city} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Platform Configuration</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Platform Status</label>
                      <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                        <option value="active">Active (Full Access)</option>
                        <option value="inactive">Inactive (Suspended)</option>
                        <option value="trial">Trial Period</option>
                      </select>
                    </div>
                    {!currentUniversity && (
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '6px', color: '#0369a1', fontSize: '0.85rem' }}>
                          <strong>Note:</strong> A default University Admin account will be automatically provisioned using the Primary Contact Email provided above.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button type="submit" form="university-form" className="btn btn-primary">{currentUniversity ? 'Save Changes' : 'Provision University'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog for New University */}
      {successDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px', maxWidth: '90vw' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                <CheckCircle size={48} color="#16a34a" />
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '16px 0 8px 0', color: '#1e293b' }}>University Provisioned!</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                {successDialog.data.name} has been successfully added to the platform. 
                A default administrative account has been created.
              </p>

              <div className="credentials-box">
                <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#334155', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Admin Credentials
                </p>
                <div className="credential-item">
                  <span className="credential-label">Email</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="credential-value" style={{ fontSize: '0.95rem' }}>{successDialog.data.adminEmail}</span>
                    <button className="copy-btn" onClick={() => copyToClipboard(successDialog.data.adminEmail)} title="Copy Email">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="credential-item">
                  <span className="credential-label">Temporary Password</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="credential-value">{successDialog.data.tempPassword}</span>
                    <button className="copy-btn" onClick={() => copyToClipboard(successDialog.data.tempPassword)} title="Copy Password">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '6px', color: '#92400e', fontSize: '0.85rem', textAlign: 'left' }}>
                <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Please securely share these credentials with the university representative. The password should be changed on first login.
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: '0', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={() => setSuccessDialog({ isOpen: false, data: null })} style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityManagement;
