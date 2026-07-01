import React, { useState, useEffect } from "react";
import client from "../../services/httpClient";
import {
  Calendar,
  Search,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const Circulation = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active", "overdue", "returned"

  // 1. Fetch Loans from Backend
  const fetchLoans = async () => {
    try {
      setLoading(true);
      // Fetches data from LoanViewSet in circulation/views.py
      const response = await client.get('/loans/');
      setLoans(response.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
      setError("Failed to load circulation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // 2. Handle Book Return
  const handleReturn = async (loanId) => {
    try {
      // Hits the @action return_loan endpoint in LoanViewSet
      const response = await client.post(`/loans/${loanId}/return_loan/`);
      alert(response.data.detail || "Book returned successfully!");
      fetchLoans(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.detail || "Error returning book.");
    }
  };

  // 3. Handle Book Renewal
  const handleRenew = async (loanId) => {
    try {
      // Hits the @action renew endpoint in LoanViewSet
      const response = await client.post(`/loans/${loanId}/renew/`);
      alert(`Loan renewed. New Due Date: ${new Date(response.data.due_at).toLocaleDateString()}`);
      fetchLoans(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.detail || "Error renewing book.");
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
            <button className="flex items-center gap-1 px-5 py-2 bg-[#EAF2FF] text-[#4386F5] font-bold text-[13px] rounded-full hover:bg-blue-100 transition-colors">
              Issue Book
            </button>
          </div>
        </div>
      </div>
      {loading && <div className="text-center py-8 text-gray-500">Loading circulation data...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {/* Data Table */}
      {!loading && !error && (
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
              {filteredLoans.map((loan) => (
                <div key={loan.id} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4">
                  <div className="w-[80px] shrink-0 text-[13px] font-medium text-gray-400">
                    #{loan.id}
                  </div>
                  <div className="w-[200px] shrink-0 pr-4">
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
              ))}
              
              {filteredLoans.length === 0 && (
                <div className="text-center py-10 text-gray-500 font-semibold">
                  No records found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Circulation;

