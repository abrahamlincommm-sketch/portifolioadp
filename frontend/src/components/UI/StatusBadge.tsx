import React from 'react';
import './StatusBadge.css';

export type StatusType = 'success' | 'pending' | 'processing' | 'error' | 'draft';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot"></span>
      {label}
    </span>
  );
};
