import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hook/useApi';
import { dashboard, circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock, BookOpen, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FILTER_STATUSES = ['ALL', 'ACTIVE', 'RETURNED', 'OVERDUE'];

export default function MyLoans() {
  const [searchParams] = useSearchParams();
  const targetLoanId = searchParams.get('loanId');
  const [highlightedId, setHighlightedId] = useState(null);

  const { data, isLoading, error, refetch } = useApi(dashboard.getBorrowedBooks, []);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmingRenewalId, setConfirmingRenewalId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const loansList = Array.isArray(data) ? data : data?.results || [];

  const getLoanStatus = (loan) => {
    if (loan.returned_at) return 'RETURNED';
    const dueDate = new Date(loan.due_at);
    if (dueDate < new Date()) return 'OVERDUE';
    return 'ACTIVE';
  };

  useEffect(() => {
    if (targetLoanId && loansList.length > 0) {
      const loanIdNum = parseInt(targetLoanId, 10);
      const targetLoan = loansList.find(l => l.id === loanIdNum);
      if (targetLoan) {
        setExpandedId(loanIdNum);
        setHighlightedId(loanIdNum);
        
        const targetStatus = getLoanStatus(targetLoan);
        if (targetStatus && statusFilter !== 'ALL' && targetStatus !== statusFilter) {
             setStatusFilter('ALL'); 
        }

        setTimeout(() => {
          const el = document.getElementById(`loan-${loanIdNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    }
  }, [targetLoanId, loansList.length, statusFilter]);

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

  const filterCounts = {
    ALL: loansList.length,
    ACTIVE: 0,
    RETURNED: 0,
    OVERDUE: 0,
  };

  loansList.forEach(loan => {
    const status = getLoanStatus(loan);
    if (filterCounts[status] !== undefined) {
      filterCounts[status]++;
    }
  });

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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              statusFilter === status 
                ? 'bg-gray-800 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200 shadow-sm'
            }`}
          >
            <span>{status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === status ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {filterCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop Header Row */}
      {(isLoading || filteredLoans.length > 0) && (
        <div className="hidden lg:flex items-center px-6 pb-2 pt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="w-[80px] shrink-0">Thumbnail</div>
          <div className="w-[280px] shrink-0 pr-4">Title & Author</div>
          <div className="w-[200px] shrink-0 pr-4">Timeline</div>
          <div className="w-[120px] shrink-0">Status</div>
          <div className="flex-1 min-w-[100px] text-right pr-10">Actions</div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white overflow-hidden animate-pulse">
              {/* Desktop Skeleton */}
              <div className="hidden lg:flex items-center px-6 py-4">
                <div className="w-[80px] shrink-0">
                  <div className="w-[40px] h-[50px] bg-gray-200 rounded-sm"></div>
                </div>
                <div className="w-[280px] shrink-0 pr-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-[200px] shrink-0 pr-4 flex flex-col gap-2">
                  <div className="flex justify-between w-full">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full w-full mt-1"></div>
                </div>
                <div className="w-[120px] shrink-0 flex flex-col gap-2">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex-1 min-w-[100px] flex justify-end">
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
              </div>
              
              {/* Mobile Skeleton */}
              <div className="flex lg:hidden flex-col p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-gray-200 rounded-md shrink-0"></div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100/50 flex flex-col gap-2">
                  <div className="flex justify-between w-full">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-full mt-2"></div>
                </div>
              </div>
            </div>
          ))}
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
              <div 
                key={loan.id} 
                id={`loan-${loan.id}`}
                className={`backdrop-blur-xl rounded-[20px] shadow-sm transition-all duration-300 overflow-hidden cursor-pointer ${isOverdue ? 'bg-red-50/50 border-l-4 border-red-500 border-y-white border-r-white hover:bg-red-50/80' : 'bg-white/60 border border-white hover:bg-white/80'} ${expandedId === loan.id ? 'ring-2 ring-gray-200' : 'hover:-translate-y-1 hover:shadow-md'} ${highlightedId === loan.id ? 'ring-4 ring-blue-400 bg-blue-50/30' : ''}`}
                onClick={() => toggleExpand(loan.id)}
              >
                
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
                              <button onClick={(e) => { e.stopPropagation(); handleRenew(loan.id); }} className="px-3 py-1 bg-green-500 text-white rounded-full text-[11px] font-bold hover:bg-green-600 transition-colors cursor-pointer">Yes</button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmingRenewalId(null); }} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-[11px] font-bold hover:bg-gray-300 transition-colors cursor-pointer">No</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-gray-400 mb-1 font-medium">{loan.renewed_count || 0} of 2 renewals used</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setConfirmingRenewalId(loan.id); }}
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
                    <button className="text-gray-400 hover:text-gray-700 transition-colors ml-4 hidden lg:block">
                      {expandedId === loan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
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
                                <button onClick={(e) => { e.stopPropagation(); handleRenew(loan.id); }} className="flex-1 py-1.5 bg-green-500 text-white rounded-full text-[12px] font-bold hover:bg-green-600 transition-colors cursor-pointer">Yes</button>
                                <button onClick={(e) => { e.stopPropagation(); setConfirmingRenewalId(null); }} className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-full text-[12px] font-bold hover:bg-gray-300 transition-colors cursor-pointer">No</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end w-full">
                              <span className="text-[10px] text-gray-400 mb-1 font-medium">{loan.renewed_count || 0} of 2 renewals used</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setConfirmingRenewalId(loan.id); }}
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
                  <div className="flex items-center justify-center pt-2 pb-1 border-t border-gray-100/50 text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Details</span>
                    {expandedId === loan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === loan.id && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100/50 flex flex-col gap-6 animate-in slide-in-from-top-2">
                     {/* Top Row: Description */}
                     <div className="w-full">
                         <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                         {loan.book_description ? (
                            <p className="text-[13px] text-gray-600 leading-relaxed max-w-4xl">
                               {loan.book_description}
                            </p>
                         ) : (
                            <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200">
                               <p className="text-[13px] text-gray-400 italic">No description available for this title.</p>
                            </div>
                         )}
                     </div>

                     {/* Bottom Row: Metadata Details */}
                     <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-100">
                         <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Book & Copy Details</h4>
                         <div className="flex flex-wrap gap-8 md:gap-12">
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">CATEGORY</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.book_category || 'Unknown'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">PUBLISHER</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.book_publisher || 'Unknown'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">ISBN</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.book_isbn || 'Unknown'}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">COPY BARCODE</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.copy_accession_number || 'N/A'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">CONDITION</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.copy_condition || 'Good'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">HOME SHELF (RETURN LOCATION)</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{loan.copy_shelf_location || 'Main Library'}</span>
                            </div>
                         </div>
                     </div>
                  </div>
                )}
                
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
