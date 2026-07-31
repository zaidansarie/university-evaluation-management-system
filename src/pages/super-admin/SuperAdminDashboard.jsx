import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, CheckCircle2, AlertCircle, TrendingUp, 
  BookOpen, FileText, Activity, ShieldCheck, Bell, Settings,
  Database, Server, HardDrive, Shield, ChevronRight, BarChart2, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import './SuperAdminDashboard.css';

function SuperAdminDashboard() {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const [stats, setStats] = useState({
    totalUniversities: 0,
    activeUniversities: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalEvaluations: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/super-admin/stats', {
          headers: {
            'x-user-role': user?.role
          }
        });
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  // Provide empty data arrays for charts so they render empty states
  const growthData = [];
  const activityData = [];

  return (
    <div className="sa-dashboard dashboard-content">
      {/* Header */}
      <div className="sa-header">
        <div>
          <h1>Welcome back, {user?.name || 'Platform Owner'}</h1>
          <p>Monitor and manage all universities from one central platform.</p>
        </div>
        <div className="sa-date-time">
          <strong style={{ margin: 0 }}>{currentDate}</strong>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="sa-overview-grid">
        <StatCard 
          title="Total Universities" 
          value={loading ? "..." : stats.totalUniversities} 
          icon={<Building2 size={24} color="#3b82f6" />} 
          bgColor="#eff6ff" 
          growth="Total on platform"
          trend="neutral"
        />
        <StatCard 
          title="Active Universities" 
          value={loading ? "..." : stats.activeUniversities} 
          icon={<CheckCircle2 size={24} color="#16a34a" />} 
          bgColor="#dcfce7" 
          growth="Fully operational"
          trend="neutral"
        />
        <StatCard 
          title="Total Students" 
          value={loading ? "..." : stats.totalStudents} 
          icon={<Users size={24} color="#8b5cf6" />} 
          bgColor="#f3e8ff" 
          growth="Across all universities"
          trend="neutral"
        />
        <StatCard 
          title="Total Faculty" 
          value={loading ? "..." : stats.totalFaculty} 
          icon={<Users size={24} color="#f59e0b" />} 
          bgColor="#fef3c7" 
          growth="Across all universities"
          trend="neutral"
        />
        <StatCard 
          title="Total Subjects" 
          value={loading ? "..." : stats.totalSubjects} 
          icon={<BookOpen size={24} color="#ef4444" />} 
          bgColor="#fee2e2" 
          growth="Across all universities"
          trend="neutral"
        />
        <StatCard 
          title="Total Evaluations" 
          value={loading ? "..." : stats.totalEvaluations} 
          icon={<FileText size={24} color="#0ea5e9" />} 
          bgColor="#e0f2fe" 
          growth="Across all universities"
          trend="neutral"
        />
      </div>

      <div className="sa-section-grid">
        {/* ROW 1: Growth Analytics & System Status */}
        <div className="sa-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '24px' }}>
              <h2 className="sa-card-title" style={{ margin: 0 }}>Platform Growth Analytics</h2>
              <select className="filter-select" style={{ fontSize: '0.85rem', width: '180px', flex: '0 0 auto', padding: '6px 12px' }}>
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div style={{ height: '300px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{color: '#94a3b8'}}>No historical growth data available</span>
            </div>
          </div>

          {/* Quick Actions (Moved from bottom) */}
          <div className="sa-card">
            <h2 className="sa-card-title">Quick Actions</h2>
            <div className="sa-quick-actions-cards">
              <Link to="/super-admin/universities" className="sa-qa-card theme-blue">
                <div className="sa-qa-icon"><Building2 size={20} /></div>
                <div className="sa-qa-details">
                  <span className="sa-qa-title">Manage Universities</span>
                  <span className="sa-qa-subtitle">Add or edit institutions</span>
                </div>
                <ChevronRight size={18} className="sa-qa-arrow" />
              </Link>
              <Link to="/super-admin/notifications" className="sa-qa-card theme-orange">
                <div className="sa-qa-icon"><Bell size={20} /></div>
                <div className="sa-qa-details">
                  <span className="sa-qa-title">Global Broadcast</span>
                  <span className="sa-qa-subtitle">Send platform-wide alerts</span>
                </div>
                <ChevronRight size={18} className="sa-qa-arrow" />
              </Link>
              <Link to="/super-admin/settings" className="sa-qa-card theme-purple">
                <div className="sa-qa-icon"><Settings size={20} /></div>
                <div className="sa-qa-details">
                  <span className="sa-qa-title">Settings</span>
                  <span className="sa-qa-subtitle">Configure platform settings</span>
                </div>
                <ChevronRight size={18} className="sa-qa-arrow" />
              </Link>
              <Link to="/super-admin/profile" className="sa-qa-card theme-green">
                <div className="sa-qa-icon"><User size={20} /></div>
                <div className="sa-qa-details">
                  <span className="sa-qa-title">Profile</span>
                  <span className="sa-qa-subtitle">View and update your account</span>
                </div>
                <ChevronRight size={18} className="sa-qa-arrow" />
              </Link>
            </div>
          </div>

        {/* ROW 2: Weekly Evaluation & Global Notifications */}
        <div className="sa-card">
            <h2 className="sa-card-title">Weekly Evaluation Activity</h2>
            <div style={{ height: '250px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{color: '#94a3b8'}}>No recent evaluation activity</span>
            </div>
          </div>

          {/* Global Notifications */}
          <div className="sa-card">
            <h2 className="sa-card-title">Global Notifications</h2>
            <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>
              No new notifications
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
                    <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>
                      No universities onboarded yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="sa-card">
            <h2 className="sa-card-title">Recent Activity</h2>
            <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>
              No recent activity found.
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
