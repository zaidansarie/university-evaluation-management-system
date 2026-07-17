import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css'; // Reusing dashboard styles

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Demo Authentication - Fetch first student to act as logged in user
      const studentRes = await fetch('http://localhost:5000/api/students');
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const students = await studentRes.json();
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the database.');
      }
      
      const loggedInStudent = students[0];
      setStudent(loggedInStudent);

      // Fetch Notifications
      const notifRes = await fetch(`http://localhost:5000/api/students/${loggedInStudent.id}/notifications`);
      if (!notifRes.ok) throw new Error('Failed to fetch notifications');
      const notifData = await notifRes.json();
      
      setNotifications(notifData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      if (!student) return;
      const res = await fetch(`http://localhost:5000/api/students/${student.id}/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!student) return;
      const res = await fetch(`http://localhost:5000/api/students/${student.id}/notifications/read-all`, {
        method: 'PUT'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (!student) return;
      if (!window.confirm('Are you sure you want to delete this notification?')) return;
      const res = await fetch(`http://localhost:5000/api/students/${student.id}/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  // Derived state
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  const getIconAndColor = (type) => {
    if (type.toLowerCase().includes('result')) return { icon: '🟢', color: '#10b981', bg: '#ecfdf5' }; // Emerald
    if (type.toLowerCase().includes('evaluat')) return { icon: '🔵', color: '#3b82f6', bg: '#eff6ff' }; // Blue
    if (type.toLowerCase().includes('recheck')) return { icon: '🟠', color: '#f59e0b', bg: '#fffbeb' }; // Amber
    return { icon: '🔴', color: '#ef4444', bg: '#fef2f2' }; // Red for Important/System
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || n.related_module === typeFilter || n.type.includes(typeFilter);
    let matchesStatus = true;
    if (statusFilter === 'Unread') matchesStatus = !n.is_read;
    if (statusFilter === 'Read') matchesStatus = !!n.is_read;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Extract unique types for the filter dropdown
  const uniqueTypes = [...new Set(notifications.map(n => n.related_module || n.type))].filter(Boolean);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="admin-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Notifications</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>
            Stay updated with your academic events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="primary-button" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total</h3>
          <p className="stat-value">{notifications.length}</p>
        </div>
        <div className="stat-card">
          <h3>Unread</h3>
          <p className="stat-value" style={{ color: '#f59e0b' }}>{unreadCount}</p>
        </div>
        <div className="stat-card">
          <h3>Read</h3>
          <p className="stat-value" style={{ color: '#10b981' }}>{readCount}</p>
        </div>
      </div>

      <div className="controls-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search notifications..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Unread">Unread</option>
          <option value="Read">Read</option>
        </select>
      </div>

      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredNotifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No notifications available.
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon, color, bg } = getIconAndColor(notification.type);
            const isUnread = !notification.is_read;
            
            return (
              <div 
                key={notification.id} 
                className="notification-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '20px',
                  backgroundColor: isUnread ? '#f8fafc' : '#fff',
                  border: '1px solid #e2e8f0',
                  borderLeft: isUnread ? `4px solid ${color}` : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '24px',
                  marginRight: '20px',
                  backgroundColor: bg,
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px'
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' }}>
                      {notification.title}
                      {isUnread && (
                        <span style={{
                          marginLeft: '10px',
                          fontSize: '11px',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}>New</span>
                      )}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                    {notification.message}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isUnread && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentNotifications;
