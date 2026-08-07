import React from 'react';
import './Loading.css';

interface LoadingProps {
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return <div className="loading-spinner inline"></div>;
};
