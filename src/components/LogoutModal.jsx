import React from 'react';
import '../pages/AdminDashboard.css';

function LogoutModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Logout</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>
            Are you sure you want to logout?
          </p>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button 
            className="primary-btn" 
            style={{ backgroundColor: '#dc2626', color: '#fff' }} 
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
