import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-6 text-center animate-fade-in-up">
      <div className="max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <i className="ri-error-warning-line text-4xl"></i>
        </div>
        <h1 className="text-6xl font-extrabold text-dark-900 tracking-tight mb-3">404</h1>
        <h2 className="text-xl font-bold text-dark-800 mb-2">Page Not Found</h2>
        <p className="text-dark-400 text-sm leading-relaxed mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white btn-primary inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <i className="ri-home-4-line text-base"></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
