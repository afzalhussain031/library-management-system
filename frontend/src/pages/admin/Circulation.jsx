import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import client from "../../services/httpClient";
import {
  Calendar,
  Search,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Clock
} from "lucide-react";
import UserAvatar from "../../components/common/UserAvatar";
import { useApi } from "../../hook/useApi";
import { dashboard, circulation } from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonAvatar, SkeletonText } from "../../components/common/Skeleton";
import toast from "react-hot-toast";
import LendReturnModal from "../../components/admin/LendReturnModal";
import LoanTimeline from "../../components/common/LoanTimeline";
import EntityLink from "../../components/common/EntityLink";
import { useEntityModal } from "../../context/EntityModalContext";

const Circulation = () => {
  const location = useLocation();
  const { showBook, showMember } = useEntityModal();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "active");
  const [highlightedLoanId, setHighlightedLoanId] = useState(location.state?.highlightId || null);
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: null,
    loanId: null,
    isOverdue: false,
    fineAmount: 0,
    loading: false,
    paidNow: false
  });
  const [dueDateModal, setDueDateModal] = useState({
    isOpen: false,
    loan: null,
    newDate: "",
    reason: "",
    loading: false
  });

  const { data: rawLoans, isLoading: loading, error, refetch: fetchLoans } = useApi(dashboard.getBorrowedBooks, []);
  const loans = rawLoans || [];

  // 2. Handle Book Return
  const handleReturn = async (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const isOverdue = new Date(loan.due_at) < new Date();
    
    if (isOverdue) {
      setConfirmModal({ ...confirmModal, isOpen: true, loading: true, actionType: 'return', loanId });
      try {
        const response = await client.get(`/loans/${loanId}/calculate_fine/`);
        setConfirmModal(prev => ({
          ...prev,
          loading: false,
          isOverdue: true,
          fineAmount: response.data.fine_amount
        }));
      } catch (err) {
        toast.error("Failed to calculate fine.");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    } else {
      setConfirmModal({
        isOpen: true,
        actionType: 'return',
        loanId,
        isOverdue: false,
        fineAmount: 0,
        loading: false
      });
    }
  };

  // 3. Handle Book Renewal
  const handleRenew = (loanId) => {
    setConfirmModal({
      isOpen: true,
      actionType: 'renew',
      loanId,
      isOverdue: false,
      fineAmount: 0,
      loading: false
    });
  };

  // Execute Action from Modal
  const executeAction = async () => {
    const { actionType, loanId, paidNow } = confirmModal;
    const toastId = toast.loading(actionType === 'return' ? "Returning book..." : "Renewing book...");
    try {
      if (actionType === 'return') {
        const response = await client.post(`/loans/${loanId}/return_loan/`, { paid_now: paidNow });
        toast.success(response.data.detail || "Book returned successfully!", { id: toastId });
      } else {
        const response = await client.post(`/loans/${loanId}/renew/`);
        toast.success(`Loan renewed. New Due Date: ${new Date(response.data.due_at).toLocaleDateString()}`, { id: toastId });
      }
      fetchLoans();
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (err) {
      toast.error(err.response?.data?.detail || `Error ${actionType}ing book.`, { id: toastId });
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  // 3.5. Handle Manual Due Date Adjustment
  const handleOpenDueDateModal = (loan) => {
    setDueDateModal({
      isOpen: true,
      loan,
      newDate: loan.due_at ? loan.due_at.split('T')[0] : '',
      reason: '',
      loading: false
    });
  };

  const executeDueDateAdjustment = async () => {
    if (!dueDateModal.newDate) {
      toast.error("Please pick a valid due date.");
      return;
    }

    setDueDateModal(prev => ({ ...prev, loading: true }));
    const toastId = toast.loading("Updating due date...");
    try {
      await circulation.adjustDueDate(dueDateModal.loan.id, {
        due_at: dueDateModal.newDate,
        reason: dueDateModal.reason
      });
      toast.success("Due date updated successfully!", { id: toastId });
      setDueDateModal(prev => ({ ...prev, isOpen: false, loading: false }));
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.due_at?.[0] || "Failed to update due date.", { id: toastId });
      setDueDateModal(prev => ({ ...prev, loading: false }));
    }
  };

  // 4. Filter logic based on Tabs
  const filteredLoans = loans.filter((loan) => {
    let tabMatch = true;
    if (activeTab === "active") tabMatch = loan.returned_at === null;
    else if (activeTab === "returned") tabMatch = loan.returned_at !== null;
    else if (activeTab === "overdue") {
      tabMatch = loan.returned_at === null && new Date(loan.due_at) < new Date();
    }
    
    if (!tabMatch) return false;

    if (searchQuery) {
       const query = searchQuery.toLowerCase();
       const matchesSearch = 
           loan.user_name?.toLowerCase().includes(query) ||
           loan.book_title?.toLowerCase().includes(query);
       if (!matchesSearch) return false;
    }

    return true;
  });

  // Highlight Effect
  useEffect(() => {
    if (!loading && highlightedLoanId) {
      const element = document.getElementById(`loan-${highlightedLoanId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // Remove highlight after 4 seconds
        const timer = setTimeout(() => {
          setHighlightedLoanId(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, highlightedLoanId, activeTab]);

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      
      {/* Top Dash: Stats & Actions */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-4 bg-white/50 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Segmented Control for Loan Status */}
            <div className="flex items-center bg-gray-100/70 p-1 rounded-full">
              {[
                { id: "active", label: "Active Loans", activeColor: "text-[#E0B220]" },
                { id: "overdue", label: "Overdue", activeColor: "text-[#F64E60]" },
                { id: "returned", label: "Returned", activeColor: "text-[#1BC5BD]" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                    activeTab === tab.id
                      ? `bg-white shadow-sm ${tab.activeColor}`
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Local Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filter by borrower or book..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-full text-[13px] text-gray-600 focus:outline-none focus:border-[#4386F5] focus:ring-1 focus:ring-[#4386F5] transition-all w-64 shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-2">
              <span>{filteredLoans.length} records</span>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <button onClick={() => setIsLendModalOpen(true)} className="flex items-center gap-1 px-5 py-2 bg-[#EAF2FF] text-[#4386F5] font-bold text-[13px] rounded-full hover:bg-blue-100 transition-colors">
              Issue Book
            </button>
          </div>
        </div>
      </div>
      {error && <div className="py-8"><ErrorMessage message={error} /></div>}
      {/* Data Table */}
      {!error && (
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[1000px]">
            {/* Headers */}
            <div className="flex items-center px-6 py-2 text-[12px] font-bold text-gray-400 mb-2">
              <div className="w-[80px] shrink-0">ID</div>
              <div className="w-[200px] shrink-0">Borrower</div>
              <div className="w-[200px] shrink-0">Book Copy</div>
              <div className="w-[320px] shrink-0 px-4 text-center">Timeline</div>
              <div className="w-[120px] shrink-0">Status</div>
              <div className="flex-1 min-w-[250px] text-right pr-4">Actions</div>
            </div>
            {/* List */}
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4, 5].map(key => (
                  <div key={key} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4">
                    <div className="w-[80px] shrink-0">
                      <SkeletonText className="h-4 w-12" />
                    </div>
                    <div className="w-[200px] shrink-0 pr-4 flex items-center gap-3">
                      <SkeletonAvatar className="w-8 h-8 rounded-full shrink-0" />
                      <SkeletonText className="h-4 w-24" />
                    </div>
                    <div className="w-[200px] shrink-0 pr-4 space-y-2">
                      <SkeletonText className="h-4 w-32" />
                      <SkeletonText className="h-3 w-16" />
                    </div>
                    <div className="w-[320px] shrink-0 px-4">
                      <SkeletonText className="h-10 w-full rounded-md" />
                    </div>
                    <div className="w-[120px] shrink-0">
                      <SkeletonText className="h-6 w-16 rounded" />
                    </div>
                    <div className="flex-1 min-w-[250px] flex justify-end gap-3 pr-2">
                      <SkeletonText className="h-6 w-20 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-semibold">
                  No records found in this category.
                </div>
              ) : (
                filteredLoans.map((loan) => (
                  <div 
                    key={loan.id} 
                    id={`loan-${loan.id}`}
                    className={`bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white/80 group cursor-pointer ${
                      loan.id === highlightedLoanId ? 'ring-2 ring-yellow-400 bg-yellow-50/80 animate-pulse' : ''
                    }`}
                    onClick={() => showBook(loan.book_id)}
                  >
                    <div className="w-[80px] shrink-0 text-[13px] font-medium text-gray-400">
                      #{loan.id}
                    </div>
                    <div className="w-[200px] shrink-0 pr-4 flex items-center gap-3">
                      <UserAvatar name={loan.user_name || 'Unknown'} size="sm" />
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">
                        <EntityLink onClick={(e) => { e.stopPropagation(); showMember(loan.user_id); }}>
                          {loan.user_name}
                        </EntityLink>
                      </p>
                    </div>
                    <div className="w-[200px] shrink-0 pr-4">
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">
                        <EntityLink onClick={(e) => { e.stopPropagation(); showBook(loan.book_id); }}>
                          {loan.book_title}
                        </EntityLink>
                      </p>
                      <p className="text-[12px] text-gray-500 truncate font-mono">
                        Acc: {loan.copy_accession_number || `#${loan.copy || loan.book_id}`}
                      </p>
                    </div>
                    <div className="w-[320px] shrink-0 px-4">
                      <LoanTimeline 
                         issuedAt={loan.issued_at}
                         dueAt={loan.due_at}
                         returnedAt={loan.returned_at}
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="w-[120px] shrink-0">
                      {loan.returned_at ? (
                        <span className="px-3 py-1 rounded text-[11px] font-bold bg-[#C9F7F5] text-[#1BC5BD]">Returned</span>
                      ) : new Date(loan.due_at) < new Date() ? (
                        <span className="px-3 py-1 rounded text-[11px] font-bold bg-[#FFE2E5] text-[#F64E60]">Overdue</span>
                      ) : (
                        <span className="px-3 py-1 rounded text-[11px] font-bold bg-[#FEF6DD] text-[#E0B220]">Active</span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex-1 min-w-[250px] flex items-center justify-end gap-3 text-gray-400 pr-2">
                      {!loan.returned_at && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReturn(loan.id); }} 
                            className="hover:text-green-500 transition-colors flex items-center gap-1 text-[12px]"
                            title="Mark as Returned"
                          >
                            <CheckCircle size={16} /> Return
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRenew(loan.id); }}
                            className="hover:text-blue-500 transition-colors flex items-center gap-1 text-[12px]"
                            title="Renew (Add 14 days)"
                          >
                            <RefreshCw size={15} /> Renew
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenDueDateModal(loan); }}
                            className="hover:text-amber-500 transition-colors flex items-center gap-1 text-[12px]"
                            title="Edit Due Date Manually"
                          >
                            <Calendar size={15} /> Edit Date
                          </button>
                        </>
                      )}
                      <ChevronRight size={18} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ml-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[120] transition-opacity animate-[fadeIn_0.15s_ease-out]" onClick={() => setConfirmModal({...confirmModal, isOpen: false})} />
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-[460px] bg-white rounded-[26px] p-6 shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto transform transition-all duration-150 animate-[scaleUp_0.2s_ease-out] overflow-hidden max-h-[92vh]">
              
              <div className="flex items-start justify-between mb-5 mt-1 shrink-0">
                <div className="flex items-center gap-3">
                  <AlertCircle className={
                    confirmModal.actionType === 'return' && confirmModal.isOverdue 
                      ? "text-[#F64E60]" 
                      : confirmModal.actionType === 'return' 
                        ? "text-blue-500" 
                        : "text-[#E0B220]"
                  } size={22} />
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">
                      Confirm {confirmModal.actionType === 'return' ? 'Return' : 'Renewal'}
                    </h2>
                    <p className="text-[12px] font-medium text-slate-500 mt-1 tracking-wide">
                      Please confirm your action below.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer -mt-1 -mr-2">
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 text-slate-600 text-[14px]">
                {confirmModal.loading ? (
                  <p className="flex justify-center items-center py-4 text-gray-500 font-medium">Calculating details...</p>
                ) : confirmModal.actionType === 'return' && confirmModal.isOverdue ? (
                  <div className="bg-[#FFE2E5]/50 border border-[#F64E60]/20 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-extrabold text-[#F64E60] text-base">This book is overdue!</p>
                    </div>
                    <p className="text-[#F64E60]/90 font-medium text-[13px] mb-4">A fine of <span className="font-extrabold text-[#F64E60] text-[15px]">Rs. {confirmModal.fineAmount}</span> has been generated.</p>
                    
                    <div className="flex flex-col gap-2.5">
                      <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Payment Option</p>
                      
                      <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${confirmModal.paidNow ? 'bg-white border-[#1BC5BD]' : 'bg-white/60 border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="paymentOption"
                            checked={confirmModal.paidNow === true}
                            onChange={() => setConfirmModal({...confirmModal, paidNow: true})}
                            className="w-4 h-4 text-[#1BC5BD] focus:ring-[#1BC5BD]"
                          />
                          <span className={`text-[14px] font-bold ${confirmModal.paidNow ? 'text-[#1BC5BD]' : 'text-slate-600'}`}>Pay Fine Now</span>
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${!confirmModal.paidNow ? 'bg-white border-[#F64E60]' : 'bg-white/60 border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="paymentOption"
                            checked={confirmModal.paidNow === false}
                            onChange={() => setConfirmModal({...confirmModal, paidNow: false})}
                            className="w-4 h-4 text-[#F64E60] focus:ring-[#F64E60]"
                          />
                          <span className={`text-[14px] font-bold ${!confirmModal.paidNow ? 'text-[#F64E60]' : 'text-slate-600'}`}>Add to Account Dues</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : confirmModal.actionType === 'return' ? (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                    <p className="font-extrabold text-blue-700 mb-1">Mark as Returned</p>
                    <p className="text-blue-800/80 font-medium text-[13px]">Are you sure you want to mark this book as returned? This action cannot be undone.</p>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                    <p className="font-extrabold text-amber-700 mb-1">Confirm Book Renewal</p>
                    <p className="text-amber-800/80 font-medium text-[13px]">Are you sure you want to renew this book for an additional 14 days?</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmModal({...confirmModal, isOpen: false})}
                  disabled={confirmModal.loading}
                  className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => executeAction()}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
                  disabled={confirmModal.loading}
                >
                  {confirmModal.loading ? 'Processing...' : `Confirm ${confirmModal.actionType === 'return' ? 'Return' : 'Renew'}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Manual Due Date Edit Modal */}
      {dueDateModal.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[120] transition-opacity animate-[fadeIn_0.15s_ease-out]" 
            onClick={() => !dueDateModal.loading && setDueDateModal({ ...dueDateModal, isOpen: false })} 
          />
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-[460px] bg-white rounded-[26px] p-6 shadow-2xl border border-slate-100 flex flex-col pointer-events-auto transform transition-all duration-150 animate-[scaleUp_0.2s_ease-out] overflow-hidden max-h-[92vh]">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4 mt-1 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">
                      Adjust Due Date
                    </h2>
                    <p className="text-[12px] font-medium text-slate-500 truncate max-w-[280px]">
                      {dueDateModal.loan?.book_title}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => !dueDateModal.loading && setDueDateModal({ ...dueDateModal, isOpen: false })}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition cursor-pointer -mt-1 -mr-2"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Context Pill */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Borrower:</span>
                  <strong className="text-slate-800 font-semibold">{dueDateModal.loan?.user_name}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Physical Copy:</span>
                  <strong className="text-slate-800 font-mono">
                    Acc No: {dueDateModal.loan?.copy_accession_number || `#${dueDateModal.loan?.copy || dueDateModal.loan?.book_id}`}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>Current Due:</span>
                  <span className="font-semibold text-amber-700">
                    {dueDateModal.loan?.due_at ? new Date(dueDateModal.loan.due_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 mb-2">
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-1.5 tracking-wide">
                    New Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="date"
                    value={dueDateModal.newDate}
                    min={dueDateModal.loan?.issued_at ? dueDateModal.loan.issued_at.split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDueDateModal(prev => ({ ...prev, newDate: e.target.value }))}
                    disabled={dueDateModal.loading}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Fines and overdue statuses will automatically recalibrate to this date.
                  </p>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-1.5 tracking-wide">
                    Reason / Note (Optional)
                  </label>
                  <textarea 
                    rows={2}
                    value={dueDateModal.reason}
                    onChange={(e) => setDueDateModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Semester extension, Medical leave, Approved by Librarian"
                    disabled={dueDateModal.loading}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none disabled:bg-slate-50 placeholder:text-slate-300"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This note will be recorded in the loan's audit trail.
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setDueDateModal({ ...dueDateModal, isOpen: false })}
                  disabled={dueDateModal.loading}
                  className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={executeDueDateAdjustment}
                  disabled={dueDateModal.loading || !dueDateModal.newDate}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {dueDateModal.loading ? 'Updating...' : 'Save New Date'}
                </button>
              </div>

            </div>
          </div>
        </>
      )}
      
      {/* 4. RENDER THE MODAL COMPONENT */}
      <LendReturnModal 
        open={isLendModalOpen} 
        onClose={() => setIsLendModalOpen(false)}
        onSuccess={fetchLoans}
      />
    </div>
  );
};
export default Circulation;

