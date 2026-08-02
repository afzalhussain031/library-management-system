import { useNavigate } from "react-router-dom";
import { dashboard } from "../../../services/api";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonAvatar, SkeletonText } from "../../common/Skeleton";
import { toast } from 'react-hot-toast';
import { PartyPopper, AlertCircle } from "lucide-react";

export default function FineCard() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useApi(dashboard.getFines, []);
  
  const finesList = Array.isArray(data) ? data : data?.results || [];
  const pendingFines = finesList.filter(fine => fine.status === "pending");
  const totalAmount = pendingFines.reduce((sum, fine) => sum + (fine.amount || 0), 0);
  
  const fines = {
    total: totalAmount,
    count: pendingFines.length,
    list: pendingFines
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-4xl shadow-md border border-gray-100 h-32 hover:shadow-lg transition-all duration-300">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const amount = fines?.total || 0;
  const hasFines = amount > 0;

  // Context text
  const contextText = `${fines.count} item${fines.count !== 1 ? 's' : ''} overdue`;

  return (
    <div className="bg-white p-6 rounded-4xl shadow-md border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-[260px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Library Dues</h2>
        {hasFines && (
          <button 
            onClick={() => navigate('/my-fines')}
            className="text-sm text-gray-600 hover:text-black cursor-pointer shrink-0 transition-all duration-200 flex items-center gap-1"
          >
            View All →
          </button>
        )}
      </div>

      {!hasFines && !loading ? (
        <div className="flex items-center gap-4 py-2">
           <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
             <PartyPopper size={28} strokeWidth={1.5} />
           </div>
           <div>
             <h1 className="text-xl font-semibold text-gray-900 mb-1">You're all clear!</h1>
             <p className="text-sm text-gray-500">No pending fines. Keep up the good work!</p>
           </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Middle Section: The Main Amount and Button */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-medium ${loading ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600'}`}>
                {loading ? <SkeletonAvatar className="w-full h-full rounded-xl" /> : '₹'}
              </div>

              <div>
                <div className="py-2">
                  {loading ? (
                    <SkeletonText className="h-9 w-24" /> 
                  ) : (
                    <h1 className="text-3xl font-semibold text-gray-900">₹ {Math.round(amount)}</h1>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  {!loading && <AlertCircle size={16} className="text-red-500" />}
                  <div>
                    {loading ? <SkeletonText className="h-4 w-32 mt-1" /> : <p className="text-sm text-gray-500">{contextText}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => toast("Online payments coming soon! Please visit the librarian desk to clear your dues.", {
                icon: '💳',
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                  maxWidth: '400px'
                },
              })}
              className="bg-yellow-400 px-4 py-2 rounded-full text-sm text-black font-medium hover:bg-yellow-500 transition hover:scale-[1.01] cursor-pointer">
              How to Pay
            </button>
          </div>

          {/* Bottom Section: Single Line Ledger (Horizontal Badges) */}
          {!loading && fines.list.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-100 overflow-hidden w-full">
              <div className="w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {fines.list.map((fine, index) => {
                  const title = fine.loan_book_title || 'Library Item';
                  return (
                    <div key={fine.id || index} className="flex items-center gap-1.5 shrink-0 bg-red-50/50 px-3 py-1.5 rounded-full border border-red-100 transition-colors hover:bg-red-50">
                      <span className="font-medium text-gray-700 text-xs truncate max-w-[150px]">{title}</span>
                      <span className="font-semibold text-red-500 text-xs">₹{fine.amount || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}