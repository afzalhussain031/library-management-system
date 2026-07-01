import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, DollarSign, Clock, Check } from "lucide-react";
import { billing } from "../../services/api";

export default function FinesAndPayments() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending

  // Fetch fines on mount
  useEffect(() => {
    fetchFines();
  }, []);
  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await billing.getFines();
      setFines(response.data);
    } catch (error) {
      console.error("Failed to fetch fines:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a fine's status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await billing.updateFine(id, { status: newStatus });
      // Update local state to reflect the change immediately without refetching
      setFines(fines.map(fine => fine.id === id ? { ...fine, status: newStatus } : fine));
    } catch (error) {
      console.error("Failed to update fine:", error);
      alert("Failed to update fine. Please try again.");
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
            <h3 className="text-2xl font-bold text-slate-800">${totalPending.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Collected</p>
            <h3 className="text-2xl font-bold text-slate-800">${totalCollected.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Fines Waived</p>
            <h3 className="text-2xl font-bold text-slate-800">${totalWaived.toFixed(2)}</h3>
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
        <div className="overflow-x-auto">
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
                <tr><td colSpan="6" className="text-center py-10">Loading fines...</td></tr>
              ) : filteredFines.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400">No fines found.</td></tr>
              ) : (
                filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{fine.borrower_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{fine.borrower_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">{fine.loan_book_title}</p>
                    </td>
                    <td className="px-6 py-4">{fine.reason}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${fine.amount}</td>
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
                      {fine.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(fine.id, 'paid')}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(fine.id, 'waived')}
                            className="p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                            title="Waive Fine"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}