import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradientTop?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', gradientTop = false }) => {
  return (
    <div className={`ui-card glass-effect ${gradientTop ? 'gradient-top' : ''} ${className}`}>
      {children}
    </div>
  );
};
