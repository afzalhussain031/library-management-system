import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50/50 rounded-[40px] border border-red-100 mt-4 w-full h-full min-h-[300px]">
    <AlertCircle className="text-red-500 w-12 h-12 mb-3" />
    <h3 className="text-red-800 font-bold text-lg mb-1">Data Retrieval Failed</h3>
    <p className="text-red-600 mb-4 text-center">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-sm"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
