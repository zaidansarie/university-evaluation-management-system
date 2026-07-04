import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ lines = 3, width = '100%', height = '20px', gap = '12px' }) => {
  return (
    <div className="skeleton-container" style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="skeleton-line" 
          style={{ width: typeof width === 'object' ? width[i % width.length] : width, height }} 
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
