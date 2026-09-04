import React from 'react';

export default function LoadingSpinner({ fullScreen = false, text = 'Loading...' }) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-brand-200/50"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-brand-400 animate-spin-slow"></div>
      </div>
      {text && <p className="text-dark-500 text-xs font-semibold uppercase tracking-widest">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory-100/90 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-24">
      {spinnerContent}
    </div>
  );
}
