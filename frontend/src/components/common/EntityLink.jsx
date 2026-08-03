import React from 'react';

const EntityLink = ({ onClick, children, className = '' }) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent row click events if embedded in a table
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`font-extrabold text-[#334155] hover:text-[#D97706] transition-colors duration-200 border-b border-dashed border-transparent hover:border-[#D97706]/40 cursor-pointer text-left focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
};

export default EntityLink;
