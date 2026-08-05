import re

with open('b:/Samarth/University Evaluation Management System/src/pages/faculty/FacultyNotifications.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Delete INITIAL_NOTIFICATIONS and add imports
content = re.sub(
    r"import React, \{ useState, useMemo, useEffect \} from 'react';\nimport \{ useNavigate \} from 'react-router-dom';\nimport '\.\./AdminDashboard\.css'; // Reuse existing layout styles\nimport '\./FacultyNotifications\.css';.*?function FacultyNotifications\(\) \{",
    "import React, { useState, useMemo, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../../contexts/AuthContext';\nimport { fetchWithHandling } from '../../utils/api';\nimport '../AdminDashboard.css';\nimport './FacultyNotifications.css';\n\nfunction FacultyNotifications() {",
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
    "const handleRefresh = () => {\n    // In a real app, this would fetch from an API\n    console.log(\"Refreshing notifications...\");\n    // For demo, we just restore the initial state if empty or show a toast\n    if (notifications.length === 0) {\n      setNotifications(INITIAL_NOTIFICATIONS);\n    }\n  };",
    "const handleRefresh = () => {\n    fetchNotifications();\n  };"
)

with open('b:/Samarth/University Evaluation Management System/src/pages/faculty/FacultyNotifications.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("FacultyNotifications.jsx fixed successfully")
