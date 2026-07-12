import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../pages/AdminDashboard.css'; // Reusing existing styling for consistency

function StudentLayout() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>UEMS Student</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/student/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/subjects" className={({ isActive }) => (isActive ? 'active' : '')}>
              My Subjects
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/results" className={({ isActive }) => (isActive ? 'active' : '')}>
              Results
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/answer-sheets" className={({ isActive }) => (isActive ? 'active' : '')}>
              Answer Sheets
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/rechecking" className={({ isActive }) => (isActive ? 'active' : '')}>
              Rechecking Requests
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              Notifications
            </NavLink>
          </li>
          <li style={{ marginTop: 'auto' }}>
            <NavLink to="/student/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/student/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Logout</a>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Student Portal</h1>
            <span className="university-name">Demo University</span>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="profile-icon" style={{ backgroundColor: '#3b82f6' }}>S</span>
              <span className="profile-name">Student Name</span>
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

export default StudentLayout;
