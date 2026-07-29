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
  const [confirmingRenewalId, setConfirmingRenewalId] = useState(null);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const loansList = Array.isArray(data) ? data : data?.results || [];

  const handleRenew = async (loanId) => {
    const toastId = toast.loading("Renewing book...");
    try {
      const response = await circulation.renewLoan(loanId);
      toast.success(`Loan renewed. New Due Date: ${new Date(response.data.due_at).toLocaleDateString()}`, { id: toastId });
      setConfirmingRenewalId(null);
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
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C9F7F5] text-[#1BC5BD] flex items-center gap-1 w-fit"><CheckCircle size={12}/> Active</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 flex items-center gap-1 w-fit"><BookOpen size={12}/> Returned</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE2E5] text-[#F64E60] flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Overdue</span>;
      default:
        return null;
    }
  };

  const getLoanProgress = (loan) => {
    if (loan.returned_at) return { percent: 100, color: 'bg-gray-300' };
    
    const issued = new Date(loan.issued_at).getTime();
    const due = new Date(loan.due_at).getTime();
    const now = new Date().getTime();
    
    if (now >= due) return { percent: 100, color: 'bg-red-500' };
    
    const totalDuration = due - issued;
    const elapsed = now - issued;
    
    let percent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
    percent = Math.min(Math.max(percent, 0), 100);
    
    const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    let color = 'bg-green-500';
    if (daysRemaining <= 3) {
      color = 'bg-yellow-400';
    }
    
    return { percent, color };
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
        <div className="flex flex-col gap-3">
          {filteredLoans.map((loan) => {
            const isOverdue = getLoanStatus(loan) === 'OVERDUE';
            const isActive = getLoanStatus(loan) === 'ACTIVE';
            const progress = getLoanProgress(loan);

            let daysRemainingBadge = null;
            if (isActive && !loan.returned_at) {
              const due = new Date(loan.due_at).getTime();
              const now = new Date().getTime();
              const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
              
              if (daysRemaining === 0) {
                 daysRemainingBadge = { text: 'Due Today', colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-100' };
              } else if (daysRemaining > 0) {
                 const isSoon = daysRemaining <= 3;
                 daysRemainingBadge = { 
                   text: `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`, 
                   colorClass: isSoon ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : 'text-green-600 bg-green-50 border-green-100' 
                 };
              }
            }

            return (
              <div key={loan.id} className={`backdrop-blur-xl rounded-[20px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden ${isOverdue ? 'bg-red-50/50 border-l-4 border-red-500 border-y-white border-r-white hover:bg-red-50/80' : 'bg-white/60 border border-white hover:bg-white/80'}`}>
                
                {/* Desktop Row View */}
                <div className="hidden lg:flex items-center px-6 py-4">
                  <div className="w-[80px] shrink-0">
                    <div className={`w-[40px] h-[50px] flex items-center justify-center text-[18px] font-bold rounded-sm shadow-sm ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-[#FEF6DD] text-[#E0B220]'}`}>
                      {isOverdue ? <AlertTriangle size={20} /> : (loan.book_title ? loan.book_title.charAt(0).toUpperCase() : <BookOpen size={20} />)}
                    </div>
                  </div>
                  <div className="w-[280px] shrink-0 pr-4">
                    <p className="font-bold text-[#1C2434] text-[14px] truncate flex items-center" title={loan.book_title || "Unknown Title"}>
                      <span className="truncate">{loan.book_title || "Unknown Title"}</span>
                    </p>
                    <p className="text-[12px] text-gray-500 truncate">{loan.book_author || "Unknown Author"}</p>
                  </div>
                  <div className="w-[200px] shrink-0 flex flex-col gap-1 pr-4">
                    <div className="flex justify-between items-center text-[12px]">
                      <div className="text-gray-500">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Borrowed</span>
                        <span className="font-medium">{new Date(loan.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        <span className={`block text-[9px] uppercase tracking-wider mb-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {loan.returned_at ? 'Returned' : 'Due Date'}
                        </span>
                        <span className="font-medium">{new Date(loan.returned_at || loan.due_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {!loan.returned_at && (
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${progress.color}`} 
                          style={{ width: `${progress.percent}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="w-[120px] shrink-0 flex flex-col gap-1">
                    {getStatusBadge(getLoanStatus(loan))}
                    {loan.current_fine_estimate > 0 && !loan.returned_at && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 w-fit">
                         <span>Late Fine: ₹{loan.current_fine_estimate} ({loan.overdue_days} {loan.overdue_days === 1 ? 'day' : 'days'})</span>
                      </div>
                    )}
                    {daysRemainingBadge && (
                      <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border w-fit ${daysRemainingBadge.colorClass}`}>
                        <span>{daysRemainingBadge.text}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[100px] flex items-center justify-end">
                    {!loan.returned_at && (
                      <div className="flex flex-col items-end">
                        {confirmingRenewalId === loan.id ? (
                          <>
                            <span className="text-[10px] text-gray-500 mb-1">Confirm renewal (+14 days)?</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleRenew(loan.id)} className="px-3 py-1 bg-green-500 text-white rounded-full text-[11px] font-bold hover:bg-green-600 transition-colors cursor-pointer">Yes</button>
                              <button onClick={() => setConfirmingRenewalId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-[11px] font-bold hover:bg-gray-300 transition-colors cursor-pointer">No</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-gray-400 mb-1 font-medium">{loan.renewed_count || 0} of 2 renewals used</span>
                            <button 
                              onClick={() => setConfirmingRenewalId(loan.id)}
                              disabled={loan.renewal_status && !loan.renewal_status.can_renew}
                              title={loan.renewal_status?.reason || ""}
                              className={`px-4 py-1.5 font-bold text-[12px] rounded-full transition-colors ${
                                !loan.renewal_status || loan.renewal_status.can_renew
                                  ? 'bg-[#FFF4E5] text-[#E58C17] border border-[#E58C17]/20 hover:bg-[#FFE8CC] cursor-pointer'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                              }`}
                            >
                              Renew
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="flex lg:hidden flex-col p-4">
                  <div className="flex gap-4">
                    <div className={`w-16 h-24 flex items-center justify-center text-[24px] font-bold rounded-md shrink-0 shadow-sm ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-[#FEF6DD] text-[#E0B220]'}`}>
                       {isOverdue ? <AlertTriangle size={24} /> : (loan.book_title ? loan.book_title.charAt(0).toUpperCase() : <BookOpen size={24} />)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-[#1C2434] text-[14px] leading-tight mb-1 truncate flex items-center" title={loan.book_title || "Unknown Title"}>
                         <span className="truncate">{loan.book_title || "Unknown Title"}</span>
                       </p>
                       <p className="text-[12px] text-gray-500 mb-2 truncate">by {loan.book_author || "Unknown Author"}</p>
                       <div className="mb-2 flex flex-wrap gap-2 items-center">
                           {getStatusBadge(getLoanStatus(loan))}
                           {loan.current_fine_estimate > 0 && !loan.returned_at && (
                             <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center">
                               Late Fine: ₹{loan.current_fine_estimate} ({loan.overdue_days} {loan.overdue_days === 1 ? 'day' : 'days'})
                             </span>
                           )}
                           {daysRemainingBadge && (
                             <span className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center ${daysRemainingBadge.colorClass}`}>
                               {daysRemainingBadge.text}
                             </span>
                           )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col pt-4 mt-2 border-t border-gray-100/50">
                     <div className="flex justify-between items-center w-full mb-2 text-[12px]">
                       <div className="text-gray-500">
                         <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Borrowed On</span>
                         <span className="font-medium">{new Date(loan.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       </div>
                       <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                         <span className={`block text-[10px] uppercase tracking-wider mb-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                           {loan.returned_at ? 'Returned' : 'Due Date'}
                         </span>
                         <span className="font-medium">{new Date(loan.returned_at || loan.due_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       </div>
                     </div>
                     
                     {!loan.returned_at && (
                       <div className="w-full bg-gray-200 h-1.5 rounded-full mb-3">
                         <div 
                           className={`h-1.5 rounded-full ${progress.color}`} 
                           style={{ width: `${progress.percent}%` }}
                         ></div>
                       </div>
                     )}

                     {!loan.returned_at && (
                       <div className="flex justify-end mt-1">
                          {confirmingRenewalId === loan.id ? (
                            <div className="flex flex-col items-end w-full">
                              <span className="text-[10px] text-gray-500 mb-1">Confirm renewal (+14 days)?</span>
                              <div className="flex gap-2 w-full">
                                <button onClick={() => handleRenew(loan.id)} className="flex-1 py-1.5 bg-green-500 text-white rounded-full text-[12px] font-bold hover:bg-green-600 transition-colors cursor-pointer">Yes</button>
                                <button onClick={() => setConfirmingRenewalId(null)} className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-full text-[12px] font-bold hover:bg-gray-300 transition-colors cursor-pointer">No</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end w-full">
                              <span className="text-[10px] text-gray-400 mb-1 font-medium">{loan.renewed_count || 0} of 2 renewals used</span>
                              <button 
                                onClick={() => setConfirmingRenewalId(loan.id)}
                                disabled={loan.renewal_status && !loan.renewal_status.can_renew}
                                title={loan.renewal_status?.reason || ""}
                                className={`px-4 py-1.5 font-bold text-[12px] rounded-full transition-colors w-full ${
                                  !loan.renewal_status || loan.renewal_status.can_renew
                                    ? 'bg-[#FFF4E5] text-[#E58C17] border border-[#E58C17]/20 hover:bg-[#FFE8CC] cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                }`}
                              >
                                Renew Book
                              </button>
                            </div>
                          )}
                       </div>
                     )}
                  </div>
                </div>
                
              </div>
            );
          })}
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
