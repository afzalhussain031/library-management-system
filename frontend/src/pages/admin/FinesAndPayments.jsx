import React, { useState } from "react";
import { Search, CheckCircle, XCircle, DollarSign, Clock, Check } from "lucide-react";
import { billing } from "../../services/api";
import UserAvatar from "../../components/common/UserAvatar";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import toast from "react-hot-toast";
import { SkeletonAvatar, SkeletonText } from "../../components/common/Skeleton";
import FineDetailsDrawer from "../../components/admin/fines/FineDetailsDrawer";
import EntityLink from "../../components/common/EntityLink";
import { useEntityModal } from "../../context/EntityModalContext";

export default function FinesAndPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedFine, setSelectedFine] = useState(null);
  const { showBook, showMember } = useEntityModal();

  const { data: rawFines, setData: setFines, isLoading: loading, error } = useApi(billing.getFines, []);
  const fines = rawFines || [];

  // Handle updating a fine's status
  const handleUpdateStatus = async (id, newStatus, waiveReason = null, paymentMethod = null) => {
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      const payload = { status: newStatus };
      if (newStatus === 'waived' && waiveReason) {
        payload.waive_reason = waiveReason;
      }
      if (newStatus === 'paid' && paymentMethod) {
        payload.payment_method = paymentMethod;
      }
      await billing.updateFine(id, payload);
      setFines(fines.map(fine => fine.id === id ? { ...fine, status: newStatus, waive_reason: waiveReason, payment_method: paymentMethod } : fine));
      toast.success(`Fine marked as ${newStatus}!`, { id: toastId });
    } catch (error) {
      console.error("Failed to update fine:", error);
      toast.error("Failed to update fine. Please try again.", { id: toastId });
    }
  };

  // Derived state for filtering
  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.borrower_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.loan_book_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || fine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalPending = fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount), 0);
  const totalCollected = fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount), 0);
  const totalWaived = fines.filter(f => f.status === 'waived').reduce((sum, f) => sum + parseFloat(f.amount), 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fines & Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage library penalties, collect payments, and waive fees.</p>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Collection</p>
            <h3 className="text-2xl font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPending)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Collected</p>
            <h3 className="text-2xl font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalCollected)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Fines Waived</p>
            <h3 className="text-2xl font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalWaived)}</h3>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search member or book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-blue-400"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
        </div>
        {/* Data Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((key) => (
                  <tr key={key}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SkeletonAvatar className="w-10 h-10 rounded-full shrink-0" />
                        <div className="space-y-2">
                          <SkeletonText className="h-4 w-32" />
                          <SkeletonText className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonText className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonText className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonText className="h-5 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonText className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <SkeletonText className="h-4 w-12 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan="6" className="py-4"><ErrorMessage message={error} /></td></tr>
              ) : filteredFines.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400">No fines found.</td></tr>
              ) : (
                filteredFines.map((fine) => (
                  <tr key={fine.id} onClick={() => setSelectedFine(fine)} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={fine.borrower_name || 'Unknown'} size="md" />
                        <div>
                          <p className="font-semibold text-slate-800">
                            {fine.borrower_id ? (
                              <EntityLink onClick={(e) => { e.stopPropagation(); showMember(fine.borrower_id); }}>
                                {fine.borrower_name || 'Unknown'}
                              </EntityLink>
                            ) : (
                              fine.borrower_name || 'Unknown'
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{fine.borrower_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">
                        {fine.loan_book_id ? (
                          <EntityLink onClick={(e) => { e.stopPropagation(); showBook(fine.loan_book_id); }}>
                            {fine.loan_book_title}
                          </EntityLink>
                        ) : (
                          fine.loan_book_title
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">{fine.reason}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fine.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        fine.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        fine.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {fine.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFine(fine);
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="flex md:hidden flex-col gap-4 p-4 bg-slate-50">
           {loading ? (
             [1, 2, 3].map(key => (
               <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-3">
                  <SkeletonAvatar className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
                  </div>
               </div>
             ))
           ) : error ? (
             <ErrorMessage message={error} />
           ) : filteredFines.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                  No fines found.
              </div>
           ) : (
             filteredFines.map((fine) => (
                <div key={fine.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedFine(fine)}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={fine.borrower_name || 'Unknown'} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-[14px] truncate">
                          {fine.borrower_id ? (
                            <EntityLink onClick={(e) => { e.stopPropagation(); showMember(fine.borrower_id); }}>
                              {fine.borrower_name || 'Unknown'}
                            </EntityLink>
                          ) : (
                            fine.borrower_name || 'Unknown'
                          )}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{fine.borrower_email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      fine.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      fine.status === 'paid' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {fine.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-[13px] text-slate-700 font-medium leading-snug">
                      {fine.loan_book_id ? (
                        <EntityLink onClick={(e) => { e.stopPropagation(); showBook(fine.loan_book_id); }}>
                          {fine.loan_book_title}
                        </EntityLink>
                      ) : (
                        fine.loan_book_title
                      )}
                    </p>
                    <p className="text-[12px] text-slate-500">{fine.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/50 mt-1">
                     <p className="text-[15px] font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fine.amount)}</p>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setSelectedFine(fine); }}
                       className="text-[12px] font-semibold text-blue-600 flex items-center gap-1"
                     >
                       View Details
                     </button>
                  </div>
                </div>
             ))
           )}
        </div>
      </div>

      <FineDetailsDrawer 
        isOpen={!!selectedFine} 
        onClose={() => setSelectedFine(null)} 
        fine={selectedFine}
        onMarkPaid={(id, method) => handleUpdateStatus(id, 'paid', null, method)}
        onWaive={(id, reason) => handleUpdateStatus(id, 'waived', reason)}
      />
    </div>
  );
}