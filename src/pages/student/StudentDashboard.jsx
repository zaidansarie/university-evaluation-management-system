import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithHandling } from '../../utils/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import APIError from '../../components/common/APIError';
import { useApiData } from '../../hooks/useApiData';
import { getGrade } from '../../utils/gradeCalculator';
import '../AdminDashboard.css'; // Reusing dashboard styles

function StudentDashboard() {
  const { user } = useAuth();
  
  // Use the standard hook which handles the base URL (http://localhost:5000) internally
  const { data: dashboardData, loading, error } = useApiData(
    user?.id ? `/api/students/${user.id}/dashboard` : null, 
    null, 
    [user?.id]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SkeletonLoader count={1} type="header" />
        <SkeletonLoader count={4} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <APIError message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!dashboardData) return null;

  const { profile, stats, recentResults, recentNotifications } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="welcome-section" style={{ marginBottom: '30px' }}>
        <h2>Welcome back, {profile?.name || 'Student'}!</h2>
        <p>Here's an overview of your academic progress.</p>
        
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '40px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll Number</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{profile?.roll_number || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programme</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
              {profile?.course ? `${profile.course} ${profile.program || ''}` : (profile?.program || 'N/A')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{profile?.semester || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Registered Subjects</h3>
          <div className="stat-value">{stats?.registeredSubjects || 0}</div>
          <div className="stat-desc">Current Semester</div>
        </div>
        <div className="stat-card">
          <h3>Published Results</h3>
          <div className="stat-value">{stats?.publishedResults || 0}</div>
          <div className="stat-desc">Overall</div>
        </div>
        <div className="stat-card">
          <h3>Pending Rechecking</h3>
          <div className="stat-value">{stats?.pendingRechecking || 0}</div>
          <div className="stat-desc">Awaiting finalization</div>
        </div>
        <div className="stat-card">
          <h3>Notifications</h3>
          <div className="stat-value">{stats?.unreadNotifications || 0}</div>
          <div className="stat-desc">Unread messages</div>
        </div>
      </div>

      <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        
        {/* Recent Results Section */}
        <div className="dashboard-section" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Recent Results</h3>
          
          {recentResults && recentResults.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentResults.map((result, index) => (
                <li key={result.result_id} style={{ 
                  padding: '10px 0', 
                  borderBottom: index < recentResults.length - 1 ? '1px solid #f1f5f9' : 'none', 
                  display: 'flex', 
                  justifyContent: 'space-between' 
                }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '15px' }}>
                    <strong style={{ display: 'block', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.subject_name}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Published on {formatDate(result.published_at)}</span>
                  </div>
                  <div style={{ fontWeight: 'bold', color: parseFloat(result.percentage) >= 60 ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                    Grade: {getGrade(result.percentage)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '20px 0', color: '#64748b', textAlign: 'center' }}>
              No recent results available.
            </div>
          )}
        </div>

        {/* Recent Notifications Section */}
        <div className="dashboard-section" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Recent Notifications</h3>
          
          {recentNotifications && recentNotifications.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentNotifications.map((notification, index) => (
                <li key={notification.id} style={{ 
                  padding: '10px 0', 
                  borderBottom: index < recentNotifications.length - 1 ? '1px solid #f1f5f9' : 'none' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: notification.is_read ? '#e2e8f0' : '#3b82f6' 
                    }}></span>
                    <strong style={{ color: '#334155' }}>{notification.title}</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '5px 0 0 18px' }}>
                    {notification.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '20px 0', color: '#64748b', textAlign: 'center' }}>
              No recent notifications available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
