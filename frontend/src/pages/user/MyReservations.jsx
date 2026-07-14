import React from 'react';
import { useApi } from '../../hook/useApi';
import { circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock } from 'lucide-react';

export default function MyReservations() {
  const { data: reservations, isLoading, error } = useApi(circulation.getReservations, []);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
        {isLoading ? (
          <div className="animate-spin text-gray-400 mb-4">
            <Clock size={32} />
          </div>
        ) : (
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">No Active Reservations</h3>
            <p className="mt-1 text-sm text-gray-500">When you reserve a book, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
