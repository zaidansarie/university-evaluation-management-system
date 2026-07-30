import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('uems_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe) => {
    // Demo Accounts
    const demoAccounts = {
      'admin@university.edu': { role: 'admin', password: 'Admin@123', name: 'System Admin' },
      'faculty@university.edu': { role: 'faculty', password: 'Faculty@123', name: 'Dr. Sarah Connor' },
      'student@university.edu': { role: 'student', password: 'Student@123', name: 'Rahul Sharma' }
    };

    const account = demoAccounts[email];

    if (account && account.password === password) {
      // Simulate API delay for demo accounts
      await new Promise(resolve => setTimeout(resolve, 800));

      const userData = { email, role: account.role, name: account.name };
      setUser(userData);
      
      if (rememberMe) {
        localStorage.setItem('uems_user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('uems_user', JSON.stringify(userData));
      }
      return { success: true, role: account.role };
    } else if (!account) {
      // Attempt backend authentication
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
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
    }

    // Attempted demo account but wrong password
    return { success: false, error: 'Invalid email or password.' };
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

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    verifyEmailForReset
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
