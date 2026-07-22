import React, { useState } from 'react';
import { useApi } from '../../hook/useApi';
import { dashboard, circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FILTER_STATUSES = ['ALL', 'ACTIVE', 'RETURNED', 'OVERDUE'];

export default function MyLoans() {
  const { data, isLoading, error, refetch } = useApi(dashboard.getBorrowedBooks, []);
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const loansList = Array.isArray(data) ? data : data?.results || [];

  const handleRenew = async (loanId) => {
    const toastId = toast.loading("Renewing book...");
    try {
      const response = await circulation.renewLoan(loanId);
      toast.success(`Loan renewed. New Due Date: ${new Date(response.data.due_at).toLocaleDateString()}`, { id: toastId });
      refetch();
    } catch (err) {
      let errorMsg = "Failed to renew book";
      if (err.response?.data) {
        if (Array.isArray(err.response.data)) {
          errorMsg = err.response.data[0];
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      toast.error(errorMsg, { id: toastId });
    }
  };

  const getLoanStatus = (loan) => {
    if (loan.returned_at) return 'RETURNED';
    const dueDate = new Date(loan.due_at);
    if (dueDate < new Date()) return 'OVERDUE';
    return 'ACTIVE';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Active</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1 w-fit"><BookOpen size={12}/> Returned</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Overdue</span>;
      default:
        return null;
    }
  };

  const filteredLoans = loansList.filter(loan => {
    if (statusFilter === 'ALL') return true;
    return getLoanStatus(loan) === statusFilter;
  });

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Loans & History</h1>
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
      ) : filteredLoans.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredLoans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 flex items-center justify-between gap-4">
              
              {/* Left Side: Icon, Title, Author */}
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={loan.book_title || "Unknown Title"}>
                    {loan.book_title || "Unknown Title"}
                  </h3>
                  <p className="text-sm text-gray-500">{loan.book_author || "Unknown Author"}</p>
                </div>
              </div>

              {/* Right Side: Date, Status and Renew Button */}
              <div className="flex flex-col items-end gap-1 shrink-0 min-w-[120px]">
                <span className="text-sm text-gray-500 font-medium">
                  {loan.returned_at ? 'Returned: ' : 'Due: '}
                  {new Date(loan.returned_at || loan.due_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(getLoanStatus(loan))}
                  {!loan.returned_at && (
                    <button 
                      onClick={() => handleRenew(loan.id)}
                      className="bg-yellow-400 px-3 py-0.5 rounded-full text-xs text-black font-medium hover:bg-yellow-500 transition hover:scale-[1.01] cursor-pointer"
                    >
                      Renew
                    </button>
                  )}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">No Loans Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'ALL' 
                ? 'You have not borrowed any books yet.'
                : `You have no ${statusFilter.toLowerCase()} loans.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
