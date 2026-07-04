import React, { useState } from 'react';
import './APIError.css';

const APIError = ({ error, onRetry, resourceName = 'data' }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  let title = `Unable to load ${resourceName}`;
  let message = 'An unexpected error occurred.';

  if (error.type === 'NETWORK') {
    message = 'Unable to connect to the backend server. Please make sure the backend server is running.';
  } else if (error.type === 'SERVER_ERROR') {
    message = 'The server encountered an unexpected error. Please try again.';
  } else if (error.type === 'NOT_FOUND') {
    message = 'The requested resource could not be found.';
  } else if (error.type === 'TIMEOUT') {
    message = 'The request timed out. Please try again.';
  } else if (error.message) {
    message = error.message;
  }

  return (
    <div className="api-error-container">
      <div className="api-error-header">
        <span className="api-error-icon">⚠️</span>
        <h3 className="api-error-title">{title}</h3>
      </div>
      
      <p className="api-error-message">{message}</p>
      
      {error.details && (
        <div className="api-error-details-section">
          <button 
            className="api-error-details-toggle" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▲' : '▼'} Details
          </button>
          
          {showDetails && (
            <div className="api-error-details-content">
              {typeof error.details === 'object' ? JSON.stringify(error.details, null, 2) : error.details.toString()}
            </div>
          )}
        </div>
      )}
      
      {onRetry && (
        <button className="api-error-retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default APIError;
