import re

with open('b:/Samarth/University Evaluation Management System/src/pages/AdminNotifications.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Delete INITIAL_NOTIFICATIONS and add imports
content = re.sub(
    r"import React, \{ useState, useMemo, useEffect \} from 'react';\nimport \{ useNavigate \} from 'react-router-dom';\nimport '\./AdminDashboard\.css'; // Reuse existing layout styles\nimport '\./faculty/FacultyNotifications\.css'; // Reuse exact styles from faculty for consistency.*?function AdminNotifications\(\) \{",
    "import React, { useState, useMemo, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\nimport { fetchWithHandling } from '../utils/api';\nimport './AdminDashboard.css';\nimport './faculty/FacultyNotifications.css';\n\nfunction AdminNotifications() {",
    content,
    flags=re.DOTALL
)

# Fix 2: Array.isArray
content = content.replace(
    "if (res.success) {\n      const mapped = res.data.map",
    "if (Array.isArray(res)) {\n      const mapped = res.map"
)

# Fix 3: handleRefresh
content = content.replace(
    "const handleRefresh = () => {\n    console.log(\"Refreshing admin notifications...\");\n    if (notifications.length === 0) {\n      setNotifications(INITIAL_NOTIFICATIONS);\n    }\n  };",
    "const handleRefresh = () => {\n    fetchNotifications();\n  };"
)

with open('b:/Samarth/University Evaluation Management System/src/pages/AdminNotifications.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminNotifications.jsx fixed successfully")
