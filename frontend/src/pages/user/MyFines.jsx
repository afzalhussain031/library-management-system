import React from 'react';
import { useApi } from '../../hook/useApi';
import { dashboard } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CreditCard } from 'lucide-react';

export default function MyFines() {
  const { data: fines, isLoading, error } = useApi(dashboard.getFines, []);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fines & Payments</h1>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Pay Pending Fines
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
        {isLoading ? (
          <div className="animate-spin text-gray-400 mb-4">
            <CreditCard size={32} />
          </div>
        ) : (
          <div className="text-center">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">You're all clear!</h3>
            <p className="mt-1 text-sm text-gray-500">No pending fines at this moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
