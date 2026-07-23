import React, { useState } from 'react';
import { useApi } from '../../hook/useApi';
import { circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';

const FILTER_STATUSES = ['ALL', 'PENDING', 'READY', 'FULFILLED', 'CANCELLED'];

export default function MyReservations() {
  const { data: reservations, isLoading, error } = useApi(circulation.getReservations, []);
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Ready for Pickup</span>;
      case 'fulfilled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1 w-fit"><BookOpen size={12}/> Fulfilled</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">{status}</span>;
    }
  };

  const filteredReservations = reservations?.filter(reservation => {
    if (statusFilter === 'ALL') return true;
    return reservation.status.toUpperCase() === statusFilter;
  }) || [];

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === status 
                ? 'bg-gray-800 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200 shadow-sm'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
          <div className="animate-spin text-gray-400 mb-4">
            <Clock size={32} />
          </div>
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 flex items-center justify-between gap-4">
              
              {/* Left Side: Icon, Title, Author */}
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={reservation.book_title}>
                    {reservation.book_title}
                  </h3>
                  <p className="text-sm text-gray-500">{reservation.book_author}</p>
                </div>
              </div>

              {/* Right Side: Date and Status */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm text-gray-500">
                  {new Date(reservation.reserved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {getStatusBadge(reservation.status)}
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">No Reservations Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'ALL' 
                ? 'When you reserve a book, it will appear here.'
                : `You have no ${statusFilter.toLowerCase()} reservations.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
