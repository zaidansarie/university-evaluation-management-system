import React, { useState } from 'react';
import './AdminDashboard.css';

function AdminEvaluationManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Mock Data for Admin Evaluation Oversight
  const stats = {
    totalAssignments: 1250,
    pending: 450,
    inProgress: 320,
    completed: 480
  };

  const facultyProgress = [
    {
      id: 'FAC-2023-001',
      name: 'Dr. John Smith',
      department: 'Computer Science',
      assignedPapers: 120,
      completed: 45,
      pending: 75,
      progress: 37.5,
      lastActivity: '2 hours ago',
      status: 'In Progress'
    },
    {
      id: 'FAC-2023-042',
      name: 'Prof. Sarah Jenkins',
      department: 'Mechanical Eng.',
      assignedPapers: 85,
      completed: 85,
      pending: 0,
      progress: 100,
      lastActivity: '1 day ago',
      status: 'Completed'
    },
    {
      id: 'FAC-2023-018',
      name: 'Dr. Alan Turing',
      department: 'Computer Science',
      assignedPapers: 200,
      completed: 180,
      pending: 20,
      progress: 90,
      lastActivity: '15 mins ago',
      status: 'In Progress'
    },
    {
      id: 'FAC-2023-099',
      name: 'Dr. Emily Chen',
      department: 'Electrical Eng.',
      assignedPapers: 60,
      completed: 0,
      pending: 60,
      progress: 0,
      lastActivity: 'Not started',
      status: 'Pending'
    }
  ];

  const filteredData = facultyProgress.filter(f => {
    if (activeTab !== 'All' && f.status !== activeTab) return false;
    if (departmentFilter !== 'All' && f.department !== departmentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline">
        <h2>Evaluation Management</h2>
        <button className="primary-btn">Assign New Evaluator</button>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Assignments</h3>
          <p className="card-value">{stats.totalAssignments}</p>
        </div>
        <div className="card">
          <h3>Pending Evaluations</h3>
          <p className="card-value">{stats.pending}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p className="card-value highlight-yellow">{stats.inProgress}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p className="card-value highlight-green">{stats.completed}</p>
        </div>
      </div>

      <div className="dashboard-content" style={{ marginTop: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Faculty Evaluation Status</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '250px' }}
            />
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical Eng.">Mechanical Eng.</option>
              <option value="Electrical Eng.">Electrical Eng.</option>
            </select>
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Department</th>
                <th>Assigned</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Progress</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No faculty evaluation records found.</td>
                </tr>
              ) : (
                filteredData.map(faculty => (
                  <tr key={faculty.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: '#334155' }}>{faculty.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{faculty.id}</div>
                    </td>
                    <td>{faculty.department}</td>
                    <td>{faculty.assignedPapers}</td>
                    <td style={{ color: '#10b981', fontWeight: '500' }}>{faculty.completed}</td>
                    <td style={{ color: '#f59e0b', fontWeight: '500' }}>{faculty.pending}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${faculty.progress}%`, height: '100%', backgroundColor: faculty.progress === 100 ? '#10b981' : '#3b82f6' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '500', width: '35px' }}>{faculty.progress}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>{faculty.lastActivity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }} title="View Workload">View</button>
                        <button style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }} title="Reassign">Reassign</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminEvaluationManagement;
