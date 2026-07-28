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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo Accounts
    const demoAccounts = {
      'admin@university.edu': { role: 'admin', password: 'Admin@123', name: 'System Admin' },
      'faculty@university.edu': { role: 'faculty', password: 'Faculty@123', name: 'Dr. Sarah Connor' },
      'student@university.edu': { role: 'student', password: 'Student@123', name: 'Rahul Sharma' }
    };

    const account = demoAccounts[email];

    if (account && account.password === password) {
      const userData = { email, role: account.role, name: account.name };
      setUser(userData);
      
      if (rememberMe) {
        localStorage.setItem('uems_user', JSON.stringify(userData));
      } else {
        // If not remembering, we might just use session storage or rely on state. 
        // For this demo, we'll store it but mark it session only if needed, 
        // or just let it stay in React state and clear on refresh.
        sessionStorage.setItem('uems_user', JSON.stringify(userData));
      }
      return { success: true, role: account.role };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uems_user');
    sessionStorage.removeItem('uems_user');
  };

  const verifyEmailForReset = (email) => {
    const validEmails = ['admin@university.edu', 'faculty@university.edu', 'student@university.edu'];
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
