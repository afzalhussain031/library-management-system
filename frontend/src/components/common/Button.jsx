import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, isLoading, disabled, className = "", type = "button", ...props }) => {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`relative inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
