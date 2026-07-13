import React from 'react';

// For text lines (names, titles, numbers)
export const SkeletonText = ({ className = "h-4 w-3/4", rounded = "rounded" }) => (
  <div className={`bg-gray-200 animate-pulse ${rounded} ${className}`}></div>
);
// For profile pictures or circular icons
export const SkeletonAvatar = ({ className = "h-10 w-10", rounded = "rounded-full" }) => (
  <div className={`bg-gray-200 animate-pulse ${rounded} ${className}`}></div>
);
// For entire cards (stats, book covers)
export const SkeletonCard = ({ className = "h-32 w-full", rounded = "rounded-xl" }) => (
  <div className={`bg-gray-200 animate-pulse ${rounded} ${className}`}></div>
);