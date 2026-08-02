import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoanTimeline from '../../common/LoanTimeline';
import { circulation, billing } from '../../../services/api';

const MemberActivityPanel = ({ memberId }) => {
  const [activeTab, setActiveTab] = useState('Returned');
  const [borrowed, setBorrowed] = useState([]);
  const [returned, setReturned] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const [loansRes, finesRes] = await Promise.all([
        circulation.getUserLoans(memberId),
        billing.getUserFines(memberId)
      ]);
      
      const allLoans = loansRes.data || loansRes; 
      const loansData = Array.isArray(allLoans) ? allLoans : allLoans.results || [];
      
      setBorrowed(loansData.filter(loan => !loan.returned_at));
      setReturned(loansData.filter(loan => loan.returned_at));
      
      const allFines = finesRes.data || finesRes;
      const finesData = Array.isArray(allFines) ? allFines : allFines.results || [];
      
      setFines(finesData);
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchActivity();
    }
  }, [memberId]);

  const handlePay = async (fineId) => {
    try {
      await billing.updateFine(fineId, { status: 'paid' });
      toast.success('Fine marked as paid!');
      fetchActivity();
    } catch (error) {
      toast.error('Failed to pay fine');
    }
  };

  const handlePayAll = async () => {
    try {
       const pendingFines = fines.filter(f => f.status === 'pending' || !f.is_paid);
       await Promise.all(pendingFines.map(f => billing.updateFine(f.id, { status: 'paid' })));
       toast.success('All fines paid successfully!');
       fetchActivity();
    } catch(err) {
       toast.error('Failed to pay all fines');
    }
  };

  const renderContent = () => {
    if (loading) {
       return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    switch (activeTab) {
      case 'Borrowed':
        if (borrowed.length === 0) return <div className="text-center py-10 text-gray-400 font-semibold text-[13px]">No active loans found.</div>;
        return borrowed.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.book_title}>{item.book_title || 'Unknown Book'}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">by {item.book_author || 'Unknown'}</p>
              <p className="text-[10px] text-[#A0ABC0]">#{item.id}</p>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.issued_at} dueAt={item.due_at} />
            </div>
            
            <div className="w-[60px] text-right shrink-0">
              <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Status</span>
              <p className="text-[12px] font-bold text-[#F6BE0A] mt-0.5">Borrowed</p>
            </div>
          </div>
        ));
      case 'Returned':
        if (returned.length === 0) return <div className="text-center py-10 text-gray-400 font-semibold text-[13px]">No returned books found.</div>;
        return returned.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.book_title}>{item.book_title || 'Unknown Book'}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">by {item.book_author || 'Unknown'}</p>
              <p className="text-[10px] text-[#A0ABC0]">#{item.id}</p>
            </div>

            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.issued_at} dueAt={item.due_at} returnedAt={item.returned_at} />
            </div>

            <div className="w-[60px] text-right shrink-0">
              <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Status</span>
              <p className="text-[12px] font-bold text-[#10B981] mt-0.5">Returned</p>
            </div>
          </div>
        ));
      case 'Fines':
        if (fines.length === 0) return <div className="text-center py-10 text-gray-400 font-semibold text-[13px]">No fine history.</div>;
        return fines.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.loan_book_title}>{item.loan_book_title}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">by {item.loan_book_author || 'Unknown'}</p>
              <p className="text-[10px] text-[#A0ABC0]">#{item.id}</p>
            </div>

            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.loan_issued_at || item.created_at || item.loan_due_at} dueAt={item.loan_due_at} />
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Fine</span>
                <p className="text-[12px] font-bold text-[#EF4444] mt-0.5">₹ {item.amount}</p>
              </div>
              {item.status === 'pending' || !item.is_paid ? (
                  <button 
                    onClick={() => handlePay(item.id)}
                    className="bg-[#FDE68A] hover:bg-[#FCD34D] text-[#92400E] text-[10px] font-extrabold px-3 py-1 rounded-full transition-colors"
                  >
                    Pay
                  </button>
              ) : (
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Paid</span>
              )}
            </div>
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-[#F3F4F6] rounded-[24px] p-6 flex flex-col min-h-[500px]">
      {/* Tabs Container */}
      <div className="bg-white rounded-full p-1.5 flex mb-6 shadow-sm shrink-0">
        {['Borrowed', 'Returned', 'Fines'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-[#1C2434] text-white shadow-md' 
                : 'text-[#64748B] hover:text-[#1C2434] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {renderContent()}
      </div>

      {/* Footer Actions / Pagination */}
      <div className="pt-4 mt-2 flex flex-col items-center gap-3 shrink-0">
        {activeTab === 'Fines' && fines.filter(f => f.status === 'pending' || !f.is_paid).length > 0 && (
          <button 
             onClick={handlePayAll}
             className="bg-[#FCD34D] hover:bg-[#FBBF24] text-[#92400E] text-[12px] font-extrabold px-8 py-2 rounded-full transition-colors shadow-sm"
          >
            Pay All Pending
          </button>
        )}
        
        <div className="bg-[#FDE68A] rounded-full px-4 py-1 flex items-center gap-3">
          <span className="text-[12px] font-bold text-[#92400E]">
             {activeTab === 'Borrowed' ? borrowed.length : activeTab === 'Returned' ? returned.length : fines.length} Records
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberActivityPanel;
