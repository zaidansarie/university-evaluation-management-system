import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../pages/AdminDashboard.css'; // Reusing Admin styling for layout

function FacultyLayout() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>UEMS Faculty</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/faculty/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/faculty/rechecking" className={({ isActive }) => (isActive ? 'active' : '')}>
              Rechecking Requests
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Back to Admin
            </NavLink>
          </li>
          <li><a href="#settings">Settings</a></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Faculty Portal</h1>
            <span className="university-name">Demo University</span>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="profile-icon" style={{ backgroundColor: '#10b981' }}>F</span>
              <span className="profile-name">Dr. Faculty</span>
            </div>
          </div>
        </header>

        {/* Content Area - Rendered dynamically based on route */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FacultyLayout;
