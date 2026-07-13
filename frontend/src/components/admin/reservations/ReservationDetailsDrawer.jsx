import React from 'react';
import { X, Clock, BookOpen, User, Tag, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ReservationDetailsDrawer = ({ isOpen, onClose, reservation, onFulfill, onAllocate, onCancel }) => {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
        style={{ animation: 'slide-in-right 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[#1C2434]">Reservation Details</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            reservation.status === 'ready' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            reservation.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            reservation.status === 'fulfilled' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="bg-white p-2 rounded-full shadow-sm">
              {reservation.status === 'ready' ? <CheckCircle size={20} className="text-blue-600" /> :
               reservation.status === 'pending' ? <Clock size={20} className="text-yellow-600" /> :
               reservation.status === 'fulfilled' ? <CheckCircle size={20} className="text-emerald-600" /> :
               <XCircle size={20} className="text-red-600" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Current Status</p>
              <p className="font-semibold capitalize">{reservation.status}</p>
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Book Information
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="font-bold text-[#1C2434] text-lg">{reservation.book_title}</p>
              {reservation.allocated_copy_barcode && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                  <Tag size={16} className="text-[#F6BE0A]" />
                  <span className="font-semibold">Copy Barcode:</span>
                  <span className="font-mono">{reservation.allocated_copy_barcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider flex items-center gap-2">
              <User size={14} /> Member Information
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <p className="font-bold text-[#1C2434]">{reservation.user_name}</p>
              <p className="text-sm text-gray-600">ID: {reservation.user_id || 'N/A'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Timeline
            </h3>
            <div className="pl-3 border-l-2 border-gray-200 space-y-4">
              <div className="relative">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-[#F6BE0A] rounded-full ring-4 ring-white"></div>
                <p className="text-xs font-bold text-gray-500">Reserved</p>
                <p className="text-sm font-medium text-[#1C2434]">
                  {new Date(reservation.reserved_at).toLocaleString()}
                </p>
              </div>
              {reservation.ready_at && (
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-gray-500">Ready for Pickup</p>
                  <p className="text-sm font-medium text-[#1C2434]">
                    {new Date(reservation.ready_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-6 flex flex-wrap items-center gap-3 bg-gray-50/50">
          
          {reservation.status === 'pending' && (
            <button 
              onClick={() => onAllocate(reservation)}
              className="flex-1 px-6 py-2.5 rounded-full text-sm font-bold bg-[#F6BE0A] text-white hover:bg-yellow-500 transition-colors shadow-sm"
            >
              Allocate Copy (Make Ready)
            </button>
          )}

          {reservation.status === 'ready' && (
            <button 
              onClick={() => onFulfill(reservation.id)}
              className="flex-1 px-6 py-2.5 rounded-full text-sm font-bold bg-[#1C2434] text-white hover:bg-black transition-colors shadow-sm"
            >
              Fulfill Reservation
            </button>
          )}

          {['pending', 'ready'].includes(reservation.status) && (
            <button 
              onClick={() => onCancel(reservation.id)}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
            >
              Cancel
            </button>
          )}

          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
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

export default ReservationDetailsDrawer;
