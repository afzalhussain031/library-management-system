import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

const ActionConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText, 
  isDestructive = false,
  requiresReason = false
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) return;
    onConfirm(requiresReason ? reason : null);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className={`p-6 pb-0 flex flex-col items-center text-center ${isDestructive ? 'text-red-500' : 'text-emerald-500'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {isDestructive ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
        </div>

        {/* Optional Reason Input */}
        {requiresReason && (
          <div className="px-6 mt-6">
            <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Reason (Required)</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none h-24"
            ></textarea>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 mt-2 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={requiresReason && !reason.trim()}
            className={`flex-1 py-3 rounded-full text-sm font-bold text-white shadow-sm transition-colors ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300' 
                : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmDialog;
