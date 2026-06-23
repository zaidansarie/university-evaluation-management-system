import React, { useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [dateRange, setDateRange] = useState('');

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
            {/* Activity Logs */}
            <section className="recent-activities">
              <h2>Activity Logs</h2>
              
              {/* Filters */}
              <div className="activity-filters">
                <select className="filter-select">
                  <option value="">All Faculty</option>
                  <option value="sharma">Dr. Sharma</option>
                  <option value="khan">Dr. Khan</option>
                  <option value="singh">Dr. Singh</option>
                </select>

                <select className="filter-select">
                  <option value="">All Subjects</option>
                  <option value="dbms">DBMS</option>
                  <option value="os">Operating Systems</option>
                  <option value="aiml">AIML</option>
                  <option value="math">Mathematics</option>
                </select>

                <select className="filter-select">
                  <option value="">All Activities</option>
                  <option value="add_q">Added Question</option>
                  <option value="upd_q">Updated Question</option>
                  <option value="del_q">Deleted Question</option>
                  <option value="gen_p">Generated Paper</option>
                  <option value="eval_a">Evaluated Answer Sheet</option>
                  <option value="pub_r">Published Result</option>
                  <option value="app_r">Approved Rechecking Request</option>
                </select>

                <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="">Select Date Range</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last 1 Year</option>
                  <option value="alltime">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRange === 'custom' && (
                  <div className="custom-date-range">
                    <input type="date" className="filter-input" title="From Date" />
                    <span className="date-separator">to</span>
                    <input type="date" className="filter-input" title="To Date" />
                  </div>
                )}
              </div>

              {/* Activity Table */}
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Faculty</th>
                      <th>Subject</th>
                      <th>Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Oct 24, 10:30 AM</td>
                      <td>Dr. Sharma</td>
                      <td>DBMS</td>
                      <td>Added 15 questions to the DBMS Question Bank</td>
                    </tr>
                    <tr>
                      <td>Oct 24, 09:15 AM</td>
                      <td>Dr. Khan</td>
                      <td>Operating Systems</td>
                      <td>Evaluated 35 OS answer sheets</td>
                    </tr>
                    <tr>
                      <td>Oct 23, 04:45 PM</td>
                      <td>Dr. Singh</td>
                      <td>AIML</td>
                      <td>Generated the AIML End Semester Question Paper</td>
                    </tr>
                  </tbody>
                </table>
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
