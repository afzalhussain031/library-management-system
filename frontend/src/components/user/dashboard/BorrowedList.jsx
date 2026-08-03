import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard, circulation } from "../../../services/api";
import { Clock, Loader2, ArrowRight, BookOpen, MoreVertical, CalendarPlus, Info, Check } from "lucide-react";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonText } from "../../common/Skeleton";
import { toast } from "react-hot-toast";
import BookThumbnail from "../../common/BookThumbnail";
import LoanTimeline from "../../common/LoanTimeline";
import EntityLink from "../../common/EntityLink";
import { useEntityModal } from "../../../context/EntityModalContext";

export default function BorrowedList() {
  const navigate = useNavigate();
  const { showBook } = useEntityModal();
  const { data, isLoading: loading, error, refetch } = useApi(dashboard.getBorrowedBooks, []);
  const loansList = Array.isArray(data) ? data : data?.results || [];
  
  const [renewingId, setRenewingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Filter only active loans (not returned)
  const borrowedBooks = loansList
    .filter(loan => !loan.returned_at)
    .slice(0, 3); // Show only first 3

  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    try {
      const response = await circulation.renewLoan(loanId);
      setSuccessId(loanId);
      setTimeout(() => setSuccessId(null), 2000); // Clear success state after 2s
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
      toast.error(errorMsg);
    } finally {
      setRenewingId(null);
    }
  };

  const handleAddToCalendar = (loan, e) => {
    e.stopPropagation();
    setOpenMenuId(null); // Close menu
    const title = loan.book_title || "Library Book";
    const dueDate = new Date(loan.due_at);
    
    const formatICSDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDate = formatICSDate(dueDate);
    const endDate = formatICSDate(new Date(dueDate.getTime() + 60 * 60 * 1000));
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:Return Library Book: ${title}`,
      `DESCRIPTION:Reminder to return ${title} to the library.`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join('\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `return_${title.replace(/\s+/g, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRelativeTime = (dueAt) => {
    const due = new Date(dueAt).getTime();
    const now = new Date().getTime();
    const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { text: `Overdue by ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'}!`, color: 'text-red-500', isOverdue: true };
    if (daysRemaining === 0) return { text: 'Due Today', color: 'text-yellow-600', isOverdue: false };
    if (daysRemaining <= 3) return { text: `Due in ${daysRemaining} days`, color: 'text-yellow-600', isOverdue: false };
    return { text: `Due in ${daysRemaining} days`, color: 'text-gray-500', isOverdue: false };
  };

  if (error) {
    return (
      <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-4xl shadow-sm text-gray-900 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-900 text-lg">My Borrowed Books</h2>
        <button 
          onClick={() => navigate('/my-loans')}
          className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
        >
          See All <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((key, index) => (
            <div key={key} className="flex gap-4 items-center mb-4 animate-pulse" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="w-12 h-16 bg-gray-100 rounded-md shrink-0"></div>
              <div className="space-y-2 flex-1">
                <SkeletonText className="h-4 w-3/4" />
                <SkeletonText className="h-3 w-1/2" />
              </div>
              <div className="text-right space-y-2 flex flex-col items-end">
                <SkeletonText className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : borrowedBooks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="bg-gray-50 p-4 rounded-full mb-3">
             <BookOpen size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">No active loans</p>
          <p className="text-sm text-gray-400 mb-4">You haven't borrowed any books yet.</p>
          <button 
            onClick={() => navigate('/books')}
            className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2" ref={menuRef}>
          {borrowedBooks.map((loan, i) => {
            const timeInfo = getRelativeTime(loan.due_at);
            const isRenewing = renewingId === loan.id;
            const isSuccess = successId === loan.id;
            const canRenew = loan.renewal_status ? loan.renewal_status.can_renew : true;
            const renewReason = loan.renewal_status ? loan.renewal_status.reason : '';
            
            return (
              <div 
                key={loan.id} 
                onClick={() => navigate(`/books/${loan.book_id}`)}
                className={`cursor-pointer flex flex-col p-3 rounded-2xl transition-all border-b last:border-0 mb-1 ${timeInfo.isOverdue ? 'bg-red-50/40 border-l-4 border-red-500 hover:bg-red-50/70 border-b-transparent' : 'hover:bg-gray-50/80 border-gray-50'}`}
              >
                <div className="flex gap-3 md:gap-4 items-center relative">
                  <div className="shrink-0 transition-transform hover:-translate-y-0.5 group">
                    <BookThumbnail 
                      title={loan.book_title} 
                      isbn={loan.book_isbn} 
                      author={loan.book_author}
                      hoverExpand={false} 
                      className="w-10 h-14 text-sm rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 md:w-[200px] md:flex-none flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm leading-tight" title={loan.book_title || "Unknown Title"}>
                      <EntityLink onClick={(e) => { e.stopPropagation(); showBook(loan.book_id); }}>
                        {loan.book_title || "Unknown Title"}
                      </EntityLink>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1 mt-0.5">by {loan.book_author || "Unknown Author"}</p>
                    <div className="flex items-center flex-wrap gap-2">
                       <span className={`text-[11px] font-medium flex items-center gap-1 ${timeInfo.color}`}>
                         <Clock size={12} strokeWidth={2.5} />
                         {timeInfo.text}
                         {timeInfo.isOverdue && loan.current_fine_estimate > 0 && (
                           <span>&bull; ₹{loan.current_fine_estimate} Fine</span>
                         )}
                       </span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block flex-1 px-4 min-w-[150px]">
                    <LoanTimeline 
                      issuedAt={loan.issued_at}
                      dueAt={loan.due_at}
                      returnedAt={loan.returned_at}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-1 relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRenew(loan.id); }}
                      disabled={isRenewing || !canRenew}
                      title={renewReason}
                      className={`text-xs px-4 py-1.5 rounded-full font-bold border transition-all flex items-center justify-center min-w-[70px] ${
                        isSuccess 
                          ? 'bg-green-50 text-green-700 border-green-300' 
                          : !canRenew
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                      }`}
                    >
                      {isSuccess ? <><Check size={14} className="mr-1" /> Renewed!</> : isRenewing ? <Loader2 size={14} className="animate-spin" /> : "Renew"}
                    </button>
                    
                    {/* Kebab Menu Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === loan.id ? null : loan.id); }}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Dropdown */}
                    {openMenuId === loan.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <button 
                          onClick={(e) => handleAddToCalendar(loan, e)}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <CalendarPlus size={14} /> Add to Calendar
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/books/${loan.book_id}`); }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Info size={14} /> View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden px-1 pt-3 mt-1 border-t border-gray-100/50">
                    <LoanTimeline 
                      issuedAt={loan.issued_at}
                      dueAt={loan.due_at}
                      returnedAt={loan.returned_at}
                      className="w-full"
                    />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}