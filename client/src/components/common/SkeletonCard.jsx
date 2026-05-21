import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden p-3 border border-white/10 shadow-lg">
      <div className="aspect-square w-full rounded-2xl skeleton-shimmer mb-4"></div>
      <div className="px-2 space-y-3 pb-2">
        <div className="h-4 w-1/3 rounded skeleton-shimmer"></div>
        <div className="h-6 w-3/4 rounded skeleton-shimmer"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-1/4 rounded skeleton-shimmer"></div>
          <div className="h-8 w-1/3 rounded-full skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
