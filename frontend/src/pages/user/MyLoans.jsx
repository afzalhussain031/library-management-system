import React from 'react';
import { useApi } from '../../hook/useApi';
import { dashboard } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import BorrowedList from '../../components/user/dashboard/BorrowedList';

export default function MyLoans() {
  const { data, isLoading, error } = useApi(dashboard.getBorrowedBooks, []);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Loans & History</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <BorrowedList />
      </div>
    </div>
  );
}
