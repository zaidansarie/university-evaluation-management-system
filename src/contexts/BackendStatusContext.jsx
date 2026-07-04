import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const BackendStatusContext = createContext();

export const useBackendStatus = () => useContext(BackendStatusContext);

export const BackendStatusProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);

  const reportOffline = useCallback(() => {
    setIsOffline(true);
  }, []);

  const reportOnline = useCallback(() => {
    setIsOffline(false);
  }, []);

  return (
    <BackendStatusContext.Provider value={{ isOffline, reportOffline, reportOnline }}>
      {children}
      {isOffline && (
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 500
        }}>
          ⚠️ The application is currently operating offline. Some features may be unavailable.
        </div>
      )}
    </BackendStatusContext.Provider>
  );
};
