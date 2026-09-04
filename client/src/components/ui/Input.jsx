import React from 'react';

export default function Input({
  label,
  icon,
  error,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-dark-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
            <i className={`${icon} text-base`}></i>
          </div>
        )}
        <input
          className={`
            w-full py-3 rounded-xl bg-ivory-100 border border-gray-200 text-sm text-dark-900 
            placeholder-dark-300 focus:outline-none focus:border-brand-500 focus:bg-white 
            focus:ring-2 focus:ring-brand-500/15 transition-all
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
