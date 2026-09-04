import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white rounded-3xl shadow-xl shadow-dark-900/5 border border-gray-100/80 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
