import React from 'react';

function PlaceholderPage({ title }) {
  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h2>{title}</h2>
        <p className="text-secondary" style={{ marginTop: '8px' }}>
          This module will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
