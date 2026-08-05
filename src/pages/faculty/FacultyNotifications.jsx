import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithHandling } from '../../utils/api';
import '../AdminDashboard.css';
import './FacultyNotifications.css';

function FacultyNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications`);
    if (Array.isArray(res)) {
      const mapped = res.map(n => ({
        ...n,
        description: n.message,
        timestamp: n.created_at,
        category: n.type || n.related_module || 'System',
        isRead: !!n.is_read,
        priority: (n.type && n.type.toLowerCase().includes('deadline')) ? 'High' : 'Medium',
        icon: '📋'
      }));
      setNotifications(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotificationToDelete(null);
        setSelectedAnnouncement(null);
      }
    };
    
    if (notificationToDelete || selectedAnnouncement) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationToDelete, selectedAnnouncement]);

  const handleViewDetails = (notification) => {
    // Mark as read when viewing details
    if (!notification.isRead) {
      handleToggleRead(notification.id);
    }

    if (notification.title === 'New Evaluation Assigned' || notification.title === 'Evaluation Deadline') {
      navigate('/faculty/evaluations', { state: { tab: 'pending' } });
    } else if (notification.title === 'Draft Evaluation Reminder') {
      navigate('/faculty/evaluations', { state: { tab: 'draft' } });
    } else if (notification.category === 'Rechecking Requests') {
      navigate('/faculty/rechecking');
    } else if (notification.category === 'Question Bank') {
      navigate('/faculty/question-bank');
    } else if (notification.category === 'Announcements') {
      setSelectedAnnouncement(notification);
    }
  };

  const handleToggleRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    if (!notif.isRead) {
      await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/${id}/read`, { method: 'PUT' });
    }
  };


  const handleDelete = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/${id}`, { method: 'DELETE' });
  };


  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/read-all`, { method: 'PUT' });
  };


  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
    setSelectedIds([]);
    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/delete-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsToDelete })
    });
  };


  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...notifications];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Unread') {
        result = result.filter(n => !n.isRead);
      } else if (categoryFilter === 'Read') {
        result = result.filter(n => n.isRead);
      } else {
        result = result.filter(n => n.category === categoryFilter);
      }
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notifications, searchQuery, categoryFilter, sortOrder]);

  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    const highPriority = notifications.filter(n => n.priority === 'High').length;
    
    // Count today's notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysCount = notifications.filter(n => new Date(n.timestamp) >= today).length;

    return { total: notifications.length, unread, highPriority, todaysCount };
  }, [notifications]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px 30px', height: 'auto' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Notifications</h2>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
          Stay updated with your evaluation assignments, rechecking requests, deadlines, and system announcements.
        </p>
      </div>
      
      <div className="dashboard-content" style={{ marginTop: '20px' }}>
        
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Notifications</h3>
            <p className="card-value">{stats.total}</p>
          </div>
          <div className="card">
            <h3>Unread Notifications</h3>
            <p className="card-value" style={{color: stats.unread > 0 ? '#3b82f6' : 'inherit'}}>{stats.unread}</p>
          </div>
          <div className="card">
            <h3>High Priority</h3>
            <p className="card-value highlight-red">{stats.highPriority}</p>
          </div>
          <div className="card">
            <h3>Today's Notifications</h3>
            <p className="card-value" style={{color: '#10b981'}}>{stats.todaysCount}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="notifications-filters">
          <div className="notifications-search">
            <span className="notifications-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="notifications-controls">
            <select 
              className="filter-dropdown"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Notifications</option>
              <option value="Unread">Unread Only</option>
              <option value="Read">Read Only</option>
              <option value="Evaluation Assignments">Evaluation Assignments</option>
              <option value="Rechecking Requests">Rechecking Requests</option>
              <option value="Deadlines">Deadlines</option>
              <option value="Question Bank">Question Bank</option>
              <option value="Announcements">Announcements</option>
            </select>

            <select 
              className="filter-dropdown"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {notifications.length > 0 && (
          <div className="notifications-bulk-actions">
            <button className="bulk-btn primary" onClick={handleMarkAllRead}>
              <span>✓</span> Mark All as Read
            </button>
            <button 
              className="bulk-btn danger" 
              onClick={() => setNotificationToDelete('selected')}
              disabled={selectedIds.length === 0}
              style={{ opacity: selectedIds.length === 0 ? 0.5 : 1, cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <span>🗑️</span> Delete Selected ({selectedIds.length})
            </button>
            <button className="bulk-btn" onClick={handleRefresh}>
              <span>🔄</span> Refresh
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleViewDetails(notification)}
              >
                <div className="notification-select">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelect(notification.id);
                    }}
                  />
                </div>
                
                <div className={`notification-icon ${notification.iconType}`}>
                  {notification.icon}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
                  </div>
                  
                  <div className="notification-badges">
                    <span className="badge category">{notification.category}</span>
                    <span className={`badge priority-${notification.priority.toLowerCase()}`}>
                      {notification.priority} Priority
                    </span>
                  </div>

                  <p className="notification-description">{notification.description}</p>
                  
                  <div className="notification-actions">
                    <button 
                      className="action-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(notification);
                      }}
                    >
                      👁️ View Details
                    </button>
                    <button 
                      className={`action-btn ${notification.isRead ? 'muted' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(notification.id);
                      }}
                    >
                      {notification.isRead ? '✉️ Mark as Unread' : '📖 Mark as Read'}
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotificationToDelete(notification.id);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No notifications available</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>

      </div>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setSelectedAnnouncement(null)}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '8px',
            width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                {selectedAnnouncement.title}
              </h3>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6c757d', padding: 0, lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
              {new Date(selectedAnnouncement.timestamp).toLocaleString()}
            </p>
            <div style={{ color: '#475569', lineHeight: 1.6 }}>
              {selectedAnnouncement.description}
            </div>
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {notificationToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setNotificationToDelete(null)}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '8px',
            width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.25rem', color: '#0f172a' }}>
              Delete Notification
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>
              Are you sure you want to delete {notificationToDelete === 'selected' ? `these ${selectedIds.length} notifications` : 'this notification'}?
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '25px', fontWeight: '500' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setNotificationToDelete(null)}
                style={{ 
                  padding: '8px 16px', background: '#e2e8f0', border: 'none', 
                  borderRadius: '4px', cursor: 'pointer', fontWeight: '500', color: '#334155' 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (notificationToDelete === 'selected') {
                    handleDeleteSelected();
                  } else {
                    handleDelete(notificationToDelete);
                  }
                  setNotificationToDelete(null);
                }}
                style={{ 
                  padding: '8px 16px', background: '#ef4444', border: 'none', 
                  borderRadius: '4px', cursor: 'pointer', fontWeight: '500', color: 'white' 
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FacultyNotifications;
