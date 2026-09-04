import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: "bg-brand-50 text-brand-600 border-brand-200",
    secondary: "bg-dark-50 text-dark-600 border-dark-200",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    danger: "bg-rose-50 text-rose-600 border-rose-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
