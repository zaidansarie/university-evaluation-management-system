import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('uems_user') || sessionStorage.getItem('uems_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Note: We don't need the useEffect to load the session on mount anymore 
  // because we're initializing the state synchronously above.

  const login = async (email, password, universityCode, rememberMe) => {
    // Attempt backend authentication
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, universityCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const userData = data.user;
        setUser(userData);
        if (rememberMe) {
          localStorage.setItem('uems_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('uems_user', JSON.stringify(userData));
        }
        return { success: true, role: userData.role };
      } else {
        return { success: false, error: data.error || 'Invalid email or password.' };
      }
    } catch (err) {
      console.error('Backend auth error:', err);
      return { success: false, error: 'Authentication service unavailable.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uems_user');
    sessionStorage.removeItem('uems_user');
  };

  const verifyEmailForReset = (email) => {
    const validEmails = ['admin@university.edu', 'faculty@university.edu', 'student@university.edu', 'superadmin@uems.com'];
    return validEmails.includes(email);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (localStorage.getItem('uems_user')) {
      localStorage.setItem('uems_user', JSON.stringify(newUserData));
    } else if (sessionStorage.getItem('uems_user')) {
      sessionStorage.setItem('uems_user', JSON.stringify(newUserData));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    verifyEmailForReset,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
