import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, User, Calendar, CheckCircle, XCircle, DollarSign, Tag } from 'lucide-react';

const FineDetailsDrawer = ({ isOpen, onClose, fine, onMarkPaid, onWaive }) => {
  const [isWaiving, setIsWaiving] = useState(false);
  const [waiveReason, setWaiveReason] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsWaiving(false);
      setWaiveReason("");
      setIsPaying(false);
      setPaymentMethod("");
    }
  }, [isOpen]);

  if (!isOpen || !fine) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
        style={{ animation: 'slide-in-right 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-800">Fine Details</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            fine.status === 'paid' ? 'bg-green-50 border-green-200 text-green-800' :
            fine.status === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-800' :
            fine.status === 'waived' ? 'bg-slate-50 border-slate-200 text-slate-800' :
            'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="bg-white p-2 rounded-full shadow-sm">
              {fine.status === 'paid' ? <CheckCircle size={20} className="text-green-600" /> :
               fine.status === 'pending' ? <Clock size={20} className="text-orange-600" /> :
               fine.status === 'waived' ? <XCircle size={20} className="text-slate-600" /> :
               <DollarSign size={20} className="text-slate-600" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Current Status</p>
              <p className="font-semibold capitalize">{fine.status}</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fine.amount)}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User size={14} /> Member Information
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <p className="font-bold text-slate-800">{fine.borrower_name || 'Unknown'}</p>
              <p className="text-sm text-slate-600">Email: {fine.borrower_email || 'N/A'}</p>
              {fine.borrower_id && <p className="text-sm text-slate-600">ID: {fine.borrower_id}</p>}
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Book Information
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <p className="font-bold text-slate-800 text-lg">{fine.loan_book_title}</p>
              <p className="text-sm text-slate-600">By {fine.loan_book_author}</p>
              {fine.loan_copy_barcode && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-200">
                  <Tag size={16} className="text-blue-500" />
                  <span className="font-semibold">Copy Barcode:</span>
                  <span className="font-mono">{fine.loan_copy_barcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Details */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Fine Details & Timeline
            </h3>
            <div className="pl-3 border-l-2 border-slate-200 space-y-4">
              <div className="relative">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-slate-300 rounded-full ring-4 ring-white"></div>
                <p className="text-xs font-bold text-slate-500">Reason</p>
                <p className="text-sm font-medium text-slate-800">{fine.reason}</p>
              </div>
              
              {fine.loan_due_at && (
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-orange-400 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-slate-500">Original Due Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(fine.loan_due_at).toLocaleString()}
                  </p>
                </div>
              )}
              
              {fine.loan_returned_at && (
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-slate-500">Returned At</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(fine.loan_returned_at).toLocaleString()}
                  </p>
                </div>
              )}

              {fine.created_at && (
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-slate-500">Fine Issued</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(fine.created_at).toLocaleString()}
                  </p>
                </div>
              )}

              {fine.status === 'waived' && fine.waive_reason && (
                <div className="relative mt-4">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-slate-400 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-slate-500">Waive Reason</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                    {fine.waive_reason}
                  </p>
                </div>
              )}

              {fine.status === 'paid' && fine.payment_method && (
                <div className="relative mt-4">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-green-400 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-slate-500">Payment Method</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {fine.payment_method.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-6 flex flex-wrap items-center gap-3 bg-slate-50/50">
          
          {fine.status === 'pending' && !isWaiving && !isPaying && (
            <>
              <button 
                onClick={() => setIsPaying(true)}
                className="flex-1 px-6 py-2.5 rounded-full text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> Process Payment
              </button>
              
              <button 
                onClick={() => setIsWaiving(true)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-white hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-2"
              >
                <XCircle size={16} /> Waive
              </button>
            </>
          )}

          {fine.status === 'pending' && isPaying && (
            <div className="w-full space-y-3">
              <label className="block text-sm font-bold text-slate-700">Payment Method <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              >
                <option value="">Select Method...</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
              </select>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (paymentMethod) {
                      onMarkPaid(fine.id, paymentMethod);
                      onClose();
                    }
                  }}
                  disabled={!paymentMethod}
                  className="flex-1 px-6 py-2.5 rounded-full text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Confirm Payment
                </button>
                <button 
                  onClick={() => {
                    setIsPaying(false);
                    setPaymentMethod("");
                  }}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-white hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {fine.status === 'pending' && isWaiving && (
            <div className="w-full space-y-3">
              <label className="block text-sm font-bold text-slate-700">Reason for Waiving <span className="text-red-500">*</span></label>
              <textarea
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="Enter justification..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none h-24"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (waiveReason.trim()) {
                      onWaive(fine.id, waiveReason.trim());
                      onClose();
                    }
                  }}
                  disabled={!waiveReason.trim()}
                  className="flex-1 px-6 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Confirm Waive
                </button>
                <button 
                  onClick={() => {
                    setIsWaiving(false);
                    setWaiveReason("");
                  }}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-white hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isWaiving && !isPaying && (
            <button 
              onClick={onClose}
              className="w-full px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default FineDetailsDrawer;
