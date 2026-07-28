import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutModal from './LogoutModal';
import '../pages/AdminDashboard.css';

function SuperAdminLayout() {
  const [showLogout, setShowLogout] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>Super Admin</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/super-admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/super-admin/universities" className={({ isActive }) => (isActive ? 'active' : '')}>
              University Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/super-admin/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="/super-admin/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/super-admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogout(true); }}>Logout</a>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Platform Administration</h1>
            <span className="university-name">Multi-University Platform</span>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="profile-icon" style={{ backgroundColor: '#8b5cf6' }}>SA</span>
              <span className="profile-name">{user?.name || 'Super Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content Area - Rendered dynamically based on route */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogout} 
        onCancel={() => setShowLogout(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
}

export default SuperAdminLayout;
