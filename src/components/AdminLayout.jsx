import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; // HMR trigger
import { useAuth } from '../contexts/AuthContext';
import LogoutModal from './LogoutModal';
import '../pages/AdminDashboard.css';

function AdminLayout() {
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
          <li>
            <NavLink to="/admin/answer-sheet-uploads" className={({ isActive }) => (isActive ? 'active' : '')}>
              Answer Sheet Uploads
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/evaluation-assignment" className={({ isActive }) => (isActive ? 'active' : '')}>
              Evaluation Assignment
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/evaluation" className={({ isActive }) => (isActive ? 'active' : '')}>
              Evaluation Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/results" className={({ isActive }) => (isActive ? 'active' : '')}>
              Results
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/rechecking" className={({ isActive }) => (isActive ? 'active' : '')}>
              Rechecking Requests
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          </li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLogout(true); }}>Logout</a></li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <span className="university-name">{user?.universityName || 'No University'}</span>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <span className="profile-icon">A</span>
              <span className="profile-name">{user?.name || 'Admin'}</span>
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

export default AdminLayout;
