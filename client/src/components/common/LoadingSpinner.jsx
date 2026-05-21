import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className={`${sizeClasses[size]} border-slate-200 border-t-cyan-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
