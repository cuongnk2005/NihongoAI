import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, style }) => {
  return (
    <div
      className={`glass-panel ${hoverable ? 'glass-panel-hover' : ''} ${className}`}
      style={{ padding: '20px', ...style }}
    >
      {children}
    </div>
  );
};
