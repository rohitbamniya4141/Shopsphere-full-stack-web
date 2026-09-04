import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md', // sm | md | lg
  className = '',
  fullWidth = false,
  isLoading = false,
  icon,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-500 shadow-md hover:shadow-lg shadow-brand-500/20 active:scale-[0.98]",
    secondary: "bg-dark-900 text-white hover:bg-dark-800 shadow-md hover:shadow-lg shadow-dark-900/20 active:scale-[0.98]",
    outline: "border border-gray-200 bg-white text-dark-900 hover:border-brand-500 hover:text-brand-600 active:bg-gray-50",
    ghost: "text-dark-600 hover:text-brand-600 hover:bg-brand-50 active:bg-brand-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs uppercase tracking-wider",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-sm uppercase tracking-widest",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
      ) : (
        <>
          {children}
          {icon && <i className={`${icon} ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'}`}></i>}
        </>
      )}
    </button>
  );
}
