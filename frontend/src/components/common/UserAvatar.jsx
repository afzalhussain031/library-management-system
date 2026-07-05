import React from 'react';
import { getUserInitials } from '../../utils/avatarUtils';

// A predefined list of beautiful Tailwind background/text color combinations
const COLORS = [
  'bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 
  'bg-amber-200 text-amber-800', 'bg-green-200 text-green-800', 
  'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 
  'bg-cyan-200 text-cyan-800', 'bg-blue-200 text-blue-800', 
  'bg-indigo-200 text-indigo-800', 'bg-violet-200 text-violet-800', 
  'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800', 
  'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'
];

// Helper function to deterministically assign the same color to the same user
const getColorForName = (name) => {
  if (!name) return 'bg-gray-200 text-gray-700';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const UserAvatar = ({ name, size = "md", className = "" }) => {
  const initials = getUserInitials(name);
  const colorClass = getColorForName(name);
  
  // Pre-defined sizes
  const sizeClasses = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-[42px] h-[42px] text-sm", // 42px exactly matches MemberCard size
    lg: "w-14 h-14 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-[132px] h-[132px] text-4xl" // Matches MemberDetailsModal size
  };

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${colorClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
