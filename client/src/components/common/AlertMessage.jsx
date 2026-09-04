import React from 'react';

export default function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const bgClasses = isError
    ? 'bg-white border-l-4 border-l-rose-500 shadow-xl shadow-rose-500/10'
    : 'bg-white border-l-4 border-l-emerald-500 shadow-xl shadow-emerald-500/10';

  const iconColor = isError ? 'text-rose-500' : 'text-emerald-500';
  const iconClass = isError ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill';

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl ${bgClasses} text-dark-900 animate-slide-down flex items-start gap-3 max-w-md w-[90%] border border-gray-100`}>
      <i className={`${iconClass} ${iconColor} text-xl mt-0.5`}></i>
      <div className="flex-1">
        <h4 className="text-sm font-bold tracking-wide">{isError ? 'Error' : 'Success'}</h4>
        <span className="text-xs text-dark-500 font-medium tracking-wide mt-0.5 block leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-dark-900 transition-colors cursor-pointer p-1"
        >
          <i className="ri-close-line text-lg"></i>
        </button>
      )}
    </div>
  );
}
