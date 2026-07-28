import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import client from "../../services/httpClient";
import {
  Calendar,
  Search,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  X
} from "lucide-react";
import UserAvatar from "../../components/common/UserAvatar";
import { useApi } from "../../hook/useApi";
import { dashboard } from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonAvatar, SkeletonText } from "../../components/common/Skeleton";
import toast from "react-hot-toast";
import LendReturnModal from "../../components/admin/LendReturnModal";

const Circulation = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: null,
    loanId: null,
    isOverdue: false,
    fineAmount: 0,
    loading: false,
    paidNow: false
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

  // 4. Filter logic based on Tabs
  const filteredLoans = loans.filter((loan) => {
    if (activeTab === "active") return loan.returned_at === null;
    if (activeTab === "returned") return loan.returned_at !== null;
    if (activeTab === "overdue") {
      return loan.returned_at === null && new Date(loan.due_at) < new Date();
    }
    return true;
  });

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      
      {/* Top Dash: Stats & Actions */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <button 
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[14px] ${activeTab === 'active' ? 'bg-[#FEF6DD] text-[#E0B220]' : 'bg-white text-gray-500 shadow-sm border border-gray-100'}`}
            >
              Active Loans
            </button>
            <button 
              onClick={() => setActiveTab("overdue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[14px] ${activeTab === 'overdue' ? 'bg-[#FFE2E5] text-[#F64E60]' : 'bg-white text-gray-500 shadow-sm border border-gray-100'}`}
            >
              Overdue
            </button>
            <button 
              onClick={() => setActiveTab("returned")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[14px] ${activeTab === 'returned' ? 'bg-[#C9F7F5] text-[#1BC5BD]' : 'bg-white text-gray-500 shadow-sm border border-gray-100'}`}
            >
              Returned
            </button>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-gray-600 font-semibold px-4 py-2 rounded-full text-[13px] shadow-sm border border-gray-100">
              <Calendar size={14} className="text-gray-400" /> Today
            </button>
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
              <div className="w-[160px] shrink-0">Issued At</div>
              <div className="w-[160px] shrink-0">Due At</div>
              <div className="w-[120px] shrink-0">Status</div>
              <div className="flex-1 min-w-[160px] text-right pr-4">Actions</div>
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
                    <div className="w-[160px] shrink-0">
                      <SkeletonText className="h-4 w-24" />
                    </div>
                    <div className="w-[160px] shrink-0">
                      <SkeletonText className="h-4 w-24" />
                    </div>
                    <div className="w-[120px] shrink-0">
                      <SkeletonText className="h-6 w-16 rounded" />
                    </div>
                    <div className="flex-1 min-w-[160px] flex justify-end gap-3 pr-2">
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
                  <div key={loan.id} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white/80">
                    <div className="w-[80px] shrink-0 text-[13px] font-medium text-gray-400">
                      #{loan.id}
                    </div>
                    <div className="w-[200px] shrink-0 pr-4 flex items-center gap-3">
                      <UserAvatar name={loan.user_name || 'Unknown'} size="sm" />
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">{loan.user_name}</p>
                    </div>
                    <div className="w-[200px] shrink-0 pr-4">
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">{loan.book_title}</p>
                      <p className="text-[12px] text-gray-500 truncate">ID: #{loan.book_id}</p>
                    </div>
                    <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium">
                      {new Date(loan.issued_at).toLocaleDateString()}
                    </div>
                    <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium">
                      {new Date(loan.due_at).toLocaleDateString()}
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
                    <div className="flex-1 min-w-[160px] flex items-center justify-end gap-3 text-gray-400 pr-2">
                      {!loan.returned_at && (
                        <>
                          <button 
                            onClick={() => handleReturn(loan.id)} 
                            className="hover:text-green-500 transition-colors flex items-center gap-1 text-[12px]"
                            title="Mark as Returned"
                          >
                            <CheckCircle size={18} /> Return
                          </button>
                          <button 
                            onClick={() => handleRenew(loan.id)}
                            className="hover:text-blue-500 transition-colors flex items-center gap-1 text-[12px] ml-2"
                            title="Renew (Add 14 days)"
                          >
                            <RefreshCw size={18} /> Renew
                          </button>
                        </>
                      )}
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

