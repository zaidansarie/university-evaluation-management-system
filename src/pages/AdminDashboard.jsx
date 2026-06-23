import React from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>UEMS Admin</h2>
        </div>
        <ul className="sidebar-menu">
          <li className="active"><a href="#dashboard">Dashboard</a></li>
          <li><a href="#faculty">Faculty Management</a></li>
          <li><a href="#students">Student Management</a></li>
          <li><a href="#subjects">Subject Management</a></li>
          <li><a href="#qb">Question Bank</a></li>
          <li><a href="#qp">Question Papers</a></li>
          <li><a href="#evaluation">Evaluation</a></li>
          <li><a href="#results">Results</a></li>
          <li><a href="#rechecking">Rechecking Requests</a></li>
          <li><a href="#settings">Settings</a></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      </aside>

      {/* Main Content */}
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

        {/* Content Area */}
        <div className="admin-content">
          {/* Summary Cards */}
          <section className="summary-cards">
            <div className="card">
              <h3>Total Faculty</h3>
              <p className="card-value">85</p>
            </div>
            <div className="card">
              <h3>Total Students</h3>
              <p className="card-value">4200</p>
            </div>
            <div className="card">
              <h3>Total Subjects</h3>
              <p className="card-value">45</p>
            </div>
            <div className="card">
              <h3>Pending Rechecking Requests</h3>
              <p className="card-value highlight-red">12</p>
            </div>
          </section>

          <div className="dashboard-grid">
            {/* Recent Activities */}
            <section className="recent-activities">
              <h2>Recent Activities</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <p><strong>Dr. Amit Sharma</strong> added 15 questions to the DBMS Question Bank.</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
                <div className="activity-item">
                  <p><strong>Prof. Neha Verma</strong> generated the Operating Systems End Semester Question Paper.</p>
                  <span className="activity-time">4 hours ago</span>
                </div>
                <div className="activity-item">
                  <p><strong>Dr. Rahul Singh</strong> evaluated 35 DBMS answer sheets.</p>
                  <span className="activity-time">Yesterday</span>
                </div>
                <div className="activity-item">
                  <p><strong>Prof. Anjali Gupta</strong> published AIML examination results.</p>
                  <span className="activity-time">Yesterday</span>
                </div>
                <div className="activity-item">
                  <p>Student <strong>Rahul Kumar</strong> submitted a rechecking request for DBMS.</p>
                  <span className="activity-time">2 days ago</span>
                </div>
                <div className="activity-item">
                  <p>Admin <strong>Priya Sharma</strong> approved a rechecking request for Operating Systems.</p>
                  <span className="activity-time">2 days ago</span>
                </div>
              </div>
            </section>

            {/* Quick Access */}
            <section className="quick-access">
              <h2>Quick Access</h2>
              <div className="quick-buttons">
                <button className="quick-btn">Add Faculty</button>
                <button className="quick-btn">Add Student</button>
                <button className="quick-btn">Add Subject</button>
                <button className="quick-btn">View Rechecking Requests</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
