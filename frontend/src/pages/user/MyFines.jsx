import React, { useState } from 'react';
import { useApi } from '../../hook/useApi';
import { dashboard, billing } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyFines() {
  const { data, isLoading, error, refetch } = useApi(dashboard.getFines, []);
  const [payingId, setPayingId] = useState(null);

  // Normalize data (handle paginated .results or plain array)
  const finesList = Array.isArray(data) ? data : data?.results || [];
  
  // Filter for pending fines
  const pendingFines = finesList.filter(fine => fine.status === 'pending');
  
  // Calculate total amount
  const totalAmount = pendingFines.reduce((sum, fine) => sum + (fine.amount || 0), 0);
  
  // Calculate payable amount (only non-accrued fines can be paid)
  const payableFines = pendingFines.filter(fine => !fine.is_accrued);
  const payableAmount = payableFines.reduce((sum, fine) => sum + (fine.amount || 0), 0);

  const handlePayFine = async (fineId) => {
    toast("Payment mechanism is coming soon! 🚀", {
      icon: '💳',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handlePayAll = async () => {
    for (const fine of payableFines) {
      await handlePayFine(fine.id);
    }
  };

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fines & Payments</h1>
        {totalAmount > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Debt: <span className="font-bold text-gray-700">₹{totalAmount}</span></p>
            </div>
            <button 
              onClick={handlePayAll}
              disabled={payingId !== null || payableAmount === 0}
              className={`bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2 ${payingId !== null || payableAmount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={payableAmount === 0 ? "You must return overdue books to pay accrued fines." : ""}
            >
              <CreditCard size={18} />
              {payableAmount > 0 ? `Pay Payable (₹${payableAmount})` : `No Payable Fines`}
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-spin text-gray-400 mb-4">
              <CreditCard size={32} />
            </div>
            <p className="text-gray-500">Loading your fines...</p>
          </div>
        ) : pendingFines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-400" />
            <h3 className="text-lg font-medium text-gray-800">You're all clear!</h3>
            <p className="mt-1 text-sm text-gray-500">No pending fines at this moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2 border-b pb-2">Pending Fines</h3>
            {pendingFines.map((fine) => (
              <div key={fine.id} className={`flex justify-between items-center p-4 border rounded-lg transition-colors ${fine.is_accrued ? 'border-orange-100 bg-orange-50/50 hover:bg-orange-50' : 'border-red-100 bg-red-50/50 hover:bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${fine.is_accrued ? 'text-orange-500 bg-orange-100' : 'text-red-500 bg-red-100'} p-2 rounded-full`}>
                     <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                      {fine.reason ? fine.reason.replace(/_/g, ' ') : "Late Return Fine"}
                      {fine.is_accrued && (
                        <span className="text-[10px] uppercase tracking-wider bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold">Accruing</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Issued: {new Date(fine.created_at).toLocaleDateString()}
                    </p>
                    {fine.loan && fine.loan.book_title && (
                      <p className="text-sm text-gray-600 mt-1 font-medium">Book: {fine.loan.book_title}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-xl text-gray-800">₹{fine.amount}</span>
                  <button 
                    onClick={() => !fine.is_accrued && handlePayFine(fine.id)}
                    disabled={payingId === fine.id || fine.is_accrued}
                    className={`${fine.is_accrued ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300' : 'bg-gray-900 text-white hover:bg-gray-800'} px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${payingId === fine.id ? 'opacity-70 cursor-wait' : ''}`}
                    title={fine.is_accrued ? "Return the book to finalize and pay this fine." : ""}
                  >
                    {payingId === fine.id ? 'Processing...' : fine.is_accrued ? 'Return Book First' : 'Pay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
