import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function EmptyState({
  icon = 'ri-inbox-line',
  title = 'No Items Found',
  description = 'There are no items to display at this moment.',
  actionText,
  actionLink,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full bg-ivory-200 flex items-center justify-center mb-6 text-dark-300">
        <i className={`${icon} text-4xl`}></i>
      </div>
      <h3 className="text-2xl font-serif font-semibold text-dark-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-dark-500 text-sm mb-8 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link to={actionLink}>
          <Button icon="ri-arrow-right-line" size="lg">{actionText}</Button>
        </Link>
      )}
      
      {actionText && onAction && !actionLink && (
        <Button onClick={onAction} icon="ri-arrow-right-line" size="lg">
          {actionText}
        </Button>
      )}
    </div>
  );
}
