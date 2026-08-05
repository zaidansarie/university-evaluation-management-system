import re

with open('b:/Samarth/University Evaluation Management System/src/pages/faculty/FacultyNotifications.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports and INITIAL_NOTIFICATIONS
content = re.sub(
    r"import \{ useNavigate \} from 'react-router-dom';\nimport '\.\./AdminDashboard\.css';\nimport '\./FacultyNotifications\.css';.*?(?=function FacultyNotifications\(\) \{)",
    "import { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../../contexts/AuthContext';\nimport { fetchWithHandling } from '../../utils/api';\nimport '../AdminDashboard.css';\nimport './FacultyNotifications.css';\n\n",
    content,
    flags=re.DOTALL
)

# 2. State
content = content.replace(
    "const navigate = useNavigate();\n  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);",
    "const navigate = useNavigate();\n  const { user } = useAuth();\n  const [notifications, setNotifications] = useState([]);\n  const [loading, setLoading] = useState(true);"
)

# 3. Fetch Notifications
fetch_logic = """const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications`);
    if (res.success) {
      const mapped = res.data.map(n => ({
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

  useEffect(() => {"""
content = content.replace("useEffect(() => {", fetch_logic, 1)

# 4. Handlers
content = content.replace(
    "const handleToggleRead = (id) => {\n    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));\n  };",
    "const handleToggleRead = async (id) => {\n    const notif = notifications.find(n => n.id === id);\n    if (!notif) return;\n    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));\n    if (!notif.isRead) {\n      await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/${id}/read`, { method: 'PUT' });\n    }\n  };\n"
)

content = content.replace(
    "const handleDelete = (id) => {\n    setNotifications(prev => prev.filter(n => n.id !== id));\n    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));\n  };",
    "const handleDelete = async (id) => {\n    setNotifications(prev => prev.filter(n => n.id !== id));\n    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));\n    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/${id}`, { method: 'DELETE' });\n  };\n"
)

content = content.replace(
    "const handleMarkAllRead = () => {\n    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));\n  };",
    "const handleMarkAllRead = async () => {\n    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));\n    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/read-all`, { method: 'PUT' });\n  };\n"
)

content = content.replace(
    "const handleDeleteSelected = () => {\n    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));\n    setSelectedIds([]);\n  };",
    "const handleDeleteSelected = async () => {\n    const idsToDelete = [...selectedIds];\n    setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));\n    setSelectedIds([]);\n    await fetchWithHandling(`http://localhost:5000/api/faculty/${user.id}/notifications/delete-multiple`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ ids: idsToDelete })\n    });\n  };\n"
)

content = content.replace(
    "const handleRefresh = () => {\n    // In a real app, this would fetch from an API\n    console.log(\"Refreshing notifications...\");\n    // For demo, we just restore the initial state if empty or show a toast\n    if (notifications.length === 0) {\n      setNotifications(INITIAL_NOTIFICATIONS);\n    }\n  };",
    "const handleRefresh = () => {\n    fetchNotifications();\n  };"
)

with open('b:/Samarth/University Evaluation Management System/src/pages/faculty/FacultyNotifications.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("FacultyNotifications.jsx updated successfully")
