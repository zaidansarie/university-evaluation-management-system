import React, { useState, useEffect } from 'react';
import { fetchWithHandling } from '../utils/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [dateRange, setDateRange] = useState('');
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    totalSubjects: 0,
    pendingRechecking: 0
  });
  const [activities, setActivities] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsData = await fetchWithHandling('http://localhost:5000/api/admin/dashboard/stats');
        if (statsData.success) {
          setStats(statsData.data);
        }
        
        const activitiesData = await fetchWithHandling('http://localhost:5000/api/admin/dashboard/activities');
        if (activitiesData.success) {
          setActivities(activitiesData.data);
        }

        const facultyData = await fetchWithHandling('http://localhost:5000/api/faculty');
        setFacultyList(facultyData);

        const subjectsData = await fetchWithHandling('http://localhost:5000/api/subjects');
        setSubjectList(subjectsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <>
      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card">
          <h3>Total Faculty</h3>
          <p className="card-value">{loading ? '...' : stats.totalFaculty}</p>
        </div>
        <div className="card">
          <h3>Total Students</h3>
          <p className="card-value">{loading ? '...' : stats.totalStudents}</p>
        </div>
        <div className="card">
          <h3>Total Subjects</h3>
          <p className="card-value">{loading ? '...' : stats.totalSubjects}</p>
        </div>
        <div className="card">
          <h3>Pending Rechecking Requests</h3>
          <p className="card-value highlight-red">{loading ? '...' : stats.pendingRechecking}</p>
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
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select className="filter-select">
              <option value="">All Subjects</option>
              {subjectList.map(s => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
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
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading activities...</td>
                  </tr>
                ) : activities.length > 0 ? (
                  activities.map((act, idx) => (
                    <tr key={idx}>
                      <td>{act.date}</td>
                      <td>{act.faculty}</td>
                      <td>{act.subject}</td>
                      <td>{act.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <p style={{ fontWeight: '500', marginBottom: '8px' }}>No activity found.</p>
                      <p style={{ fontSize: '0.9rem' }}>Activities will appear here once users start using the system.</p>
                    </td>
                  </tr>
                )}
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
    </>
  );
}

export default AdminDashboard;
