import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradientTop?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', gradientTop = false, style }) => {
  return (
    <div className={`ui-card glass-effect ${gradientTop ? 'gradient-top' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
};
