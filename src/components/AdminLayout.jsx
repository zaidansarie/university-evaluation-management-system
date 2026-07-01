import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../pages/AdminDashboard.css';

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>UEMS Admin</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/faculty" className={({ isActive }) => (isActive ? 'active' : '')}>
              Faculty Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/students" className={({ isActive }) => (isActive ? 'active' : '')}>
              Student Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/subjects" className={({ isActive }) => (isActive ? 'active' : '')}>
              Subject Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/question-bank" className={({ isActive }) => (isActive ? 'active' : '')}>
              Question Bank
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/question-papers" className={({ isActive }) => (isActive ? 'active' : '')}>
              Question Papers
            </NavLink>
          </li>
          <li><a href="#evaluation">Evaluation</a></li>
          <li><a href="#results">Results</a></li>
          <li><a href="#rechecking">Rechecking Requests</a></li>
          <li><a href="#settings">Settings</a></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <span className="university-name">Demo University</span>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="profile-icon">A</span>
              <span className="profile-name">Admin</span>
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

export default AdminLayout;
