import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, CheckCircle2, AlertCircle, TrendingUp, 
  BookOpen, FileText, Activity, ShieldCheck, Bell, Settings,
  Database, Server, HardDrive, Shield
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import './SuperAdminDashboard.css';

// Dummy Data for Charts
const growthData = [
  { month: 'Jan', universities: 4, users: 1200 },
  { month: 'Feb', universities: 6, users: 2100 },
  { month: 'Mar', universities: 8, users: 3500 },
  { month: 'Apr', universities: 12, users: 5800 },
  { month: 'May', universities: 15, users: 8400 },
  { month: 'Jun', universities: 18, users: 12500 }
];

const activityData = [
  { day: 'Mon', evaluations: 450, requests: 120 },
  { day: 'Tue', evaluations: 520, requests: 145 },
  { day: 'Wed', evaluations: 610, requests: 110 },
  { day: 'Thu', evaluations: 480, requests: 90 },
  { day: 'Fri', evaluations: 750, requests: 180 },
  { day: 'Sat', evaluations: 890, requests: 220 },
  { day: 'Sun', evaluations: 300, requests: 50 }
];

function SuperAdminDashboard() {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="sa-dashboard dashboard-content">
      {/* Header */}
      <div className="sa-header">
        <div>
          <h1>Welcome back, {user?.name || 'Platform Owner'}</h1>
          <p>Monitor and manage all universities from one central platform.</p>
        </div>
        <div className="sa-date-time">
          <strong>{currentDate}</strong>
          Platform Status: <span style={{color: '#16a34a', fontWeight: '600'}}>All Systems Operational</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="sa-overview-grid">
        <StatCard 
          title="Total Universities" 
          value="18" 
          icon={<Building2 size={24} color="#3b82f6" />} 
          bgColor="#eff6ff" 
          growth="+12% this month"
          trend="up"
        />
        <StatCard 
          title="Active Universities" 
          value="15" 
          icon={<CheckCircle2 size={24} color="#16a34a" />} 
          bgColor="#dcfce7" 
          growth="3 in trial phase"
          trend="neutral"
        />
        <StatCard 
          title="Total Students" 
          value="12.5k" 
          icon={<Users size={24} color="#8b5cf6" />} 
          bgColor="#f3e8ff" 
          growth="+8% this week"
          trend="up"
        />
        <StatCard 
          title="Total Faculty" 
          value="840" 
          icon={<Users size={24} color="#f59e0b" />} 
          bgColor="#fef3c7" 
          growth="+2% this month"
          trend="up"
        />
        <StatCard 
          title="Total Subjects" 
          value="450" 
          icon={<BookOpen size={24} color="#ef4444" />} 
          bgColor="#fee2e2" 
          growth="Across all universities"
          trend="neutral"
        />
        <StatCard 
          title="Total Evaluations" 
          value="45.2k" 
          icon={<FileText size={24} color="#0ea5e9" />} 
          bgColor="#e0f2fe" 
          growth="+15% this week"
          trend="up"
        />
      </div>

      <div className="sa-section-grid">
        {/* ROW 1: Growth Analytics & System Status */}
        <div className="sa-card">
            <h2 className="sa-card-title">
              Platform Growth Analytics
              <select className="filter-select" style={{ fontSize: '0.85rem' }}>
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </h2>
            <div style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#2563eb" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Status */}
          <div className="sa-card">
            <h2 className="sa-card-title">System Status</h2>
            <div className="sa-status-list">
              <div className="sa-status-item">
                <div className="sa-status-label"><Database size={18} color="#64748b" /> Main Database</div>
                <div className="sa-status-badge sa-status-operational">Operational</div>
              </div>
              <div className="sa-status-item">
                <div className="sa-status-label"><Server size={18} color="#64748b" /> Backend API</div>
                <div className="sa-status-badge sa-status-operational">Operational</div>
              </div>
              <div className="sa-status-item">
                <div className="sa-status-label"><HardDrive size={18} color="#64748b" /> Document Storage</div>
                <div className="sa-status-badge sa-status-operational">Operational</div>
              </div>
              <div className="sa-status-item">
                <div className="sa-status-label"><Shield size={18} color="#64748b" /> Auth Service</div>
                <div className="sa-status-badge sa-status-operational">Operational</div>
              </div>
              <div className="sa-status-item">
                <div className="sa-status-label"><Activity size={18} color="#64748b" /> Background Workers</div>
                <div className="sa-status-badge sa-status-degraded">Degraded</div>
              </div>
            </div>
          </div>

        {/* ROW 2: Weekly Evaluation & Global Notifications */}
        <div className="sa-card">
            <h2 className="sa-card-title">Weekly Evaluation Activity</h2>
            <div style={{ height: '250px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="evaluations" name="Completed Evaluations" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="requests" name="Rechecking Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Global Notifications */}
          <div className="sa-card">
            <h2 className="sa-card-title">Global Notifications</h2>
            <div className="sa-notification-list">
              <div className="sa-notification-item">
                <div className="sa-notification-icon info"><Building2 size={16} /></div>
                <div className="sa-notification-content">
                  <p>4 Universities awaiting verification</p>
                  <span>10 minutes ago</span>
                </div>
              </div>
              <div className="sa-notification-item">
                <div className="sa-notification-icon warning"><AlertCircle size={16} /></div>
                <div className="sa-notification-content">
                  <p>2 Trial licenses expiring soon</p>
                  <span>Today</span>
                </div>
              </div>
              <div className="sa-notification-item">
                <div className="sa-notification-icon critical"><Database size={16} /></div>
                <div className="sa-notification-content">
                  <p>1 Database backup failed</p>
                  <span>Yesterday</span>
                </div>
              </div>
              <div className="sa-notification-item">
                <div className="sa-notification-icon success"><CheckCircle2 size={16} /></div>
                <div className="sa-notification-content">
                  <p>5 New University registrations</p>
                  <span>Yesterday</span>
                </div>
              </div>
            </div>
          </div>

        {/* ROW 3: Recently Onboarded & Recent Activity */}
        <div className="sa-card">
            <h2 className="sa-card-title">
              Recently Onboarded Universities
              <Link to="/super-admin/universities" className="btn btn-secondary btn-sm" style={{textDecoration: 'none'}}>View All</Link>
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>University Name</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="sa-univ-cell">
                        <div className="sa-univ-avatar bg-blue">SU</div>
                        <div>
                          <strong>Stanford University</strong><br/>
                          <span style={{fontSize:'0.8rem', color: '#64748b'}}>admin@stanford.edu</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:'monospace'}}>UNIV-STAN</span></td>
                    <td><span className="sa-status-badge sa-status-operational" style={{display:'inline-block'}}>Active</span></td>
                    <td>Oct 24, 2026</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="sa-univ-cell">
                        <div className="sa-univ-avatar bg-purple">MIT</div>
                        <div>
                          <strong>MIT</strong><br/>
                          <span style={{fontSize:'0.8rem', color: '#64748b'}}>admin@mit.edu</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:'monospace'}}>UNIV-MIT</span></td>
                    <td><span className="sa-status-badge sa-status-operational" style={{display:'inline-block'}}>Active</span></td>
                    <td>Oct 20, 2026</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="sa-univ-cell">
                        <div className="sa-univ-avatar bg-orange">OU</div>
                        <div>
                          <strong>Oxford University</strong><br/>
                          <span style={{fontSize:'0.8rem', color: '#64748b'}}>admin@oxford.edu</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:'monospace'}}>UNIV-OXF</span></td>
                    <td><span className="sa-status-badge sa-status-degraded" style={{display:'inline-block'}}>Trial</span></td>
                    <td>Oct 15, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="sa-card">
            <h2 className="sa-card-title">Recent Activity</h2>
            <div className="sa-timeline">
              <div className="sa-timeline-item">
                <div className="sa-timeline-icon"><Building2 size={16} color="#3b82f6" /></div>
                <div className="sa-timeline-content">
                  <p><strong>Stanford University</strong> was provisioned.</p>
                  <span>2 hours ago</span>
                </div>
              </div>
              <div className="sa-timeline-item">
                <div className="sa-timeline-icon"><Users size={16} color="#10b981" /></div>
                <div className="sa-timeline-content">
                  <p>1,200 new students synced via API.</p>
                  <span>5 hours ago</span>
                </div>
              </div>
              <div className="sa-timeline-item">
                <div className="sa-timeline-icon"><AlertCircle size={16} color="#f59e0b" /></div>
                <div className="sa-timeline-content">
                  <p>High memory usage detected on Worker Node 3.</p>
                  <span>Yesterday at 4:30 PM</span>
                </div>
              </div>
              <div className="sa-timeline-item">
                <div className="sa-timeline-icon"><FileText size={16} color="#8b5cf6" /></div>
                <div className="sa-timeline-content">
                  <p>MIT published Fall 2026 final results.</p>
                  <span>Oct 23, 2026</span>
                </div>
              </div>
            </div>
          </div>

        {/* ROW 4: Quick Actions (Full Width) */}
        <div className="sa-card" style={{ gridColumn: '1 / -1' }}>
            <h2 className="sa-card-title">Quick Actions</h2>
            <div className="sa-quick-actions-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <Link to="/super-admin/universities" className="sa-action-card">
                <div className="sa-action-icon" style={{color: '#3b82f6'}}><Building2 size={24} /></div>
                Manage Universities
              </Link>
              <Link to="/super-admin/notifications" className="sa-action-card">
                <div className="sa-action-icon" style={{color: '#f59e0b'}}><Bell size={24} /></div>
                Global Broadcast
              </Link>
              <Link to="/super-admin/settings" className="sa-action-card">
                <div className="sa-action-icon" style={{color: '#8b5cf6'}}><Settings size={24} /></div>
                Platform Settings
              </Link>
              <Link to="/super-admin/dashboard" className="sa-action-card">
                <div className="sa-action-icon" style={{color: '#10b981'}}><ShieldCheck size={24} /></div>
                Security Logs
              </Link>
            </div>
          </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor, growth, trend }) {
  return (
    <div className="sa-stat-card">
      <div className="sa-stat-icon" style={{ backgroundColor: bgColor }}>
        {icon}
      </div>
      <div className="sa-stat-content">
        <h3 className="sa-stat-title">{title}</h3>
        <p className="sa-stat-value">{value}</p>
        <div className={`sa-stat-growth sa-growth-${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral'}`}>
          {trend === 'up' && <TrendingUp size={14} />}
          {growth}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
