import React, { useState } from 'react';
import { useApi } from '../../hook/useApi';
import { circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2, MapPin, CalendarClock, CalendarPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FILTER_STATUSES = ['ALL', 'PENDING', 'READY', 'FULFILLED', 'CANCELLED'];

const formatWaitTime = (days) => {
  if (days == null) return null;
  if (days < 7) return "Less than a week";
  const weeks = Math.max(1, Math.round(days / 7));
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
};

export default function MyReservations() {
  const { data: reservations, isLoading, error, refetch } = useApi(circulation.getReservations, []);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [processingHoldId, setProcessingHoldId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleCancelHold = async (e, id) => {
    e.stopPropagation();
    if (processingHoldId) return;
    setProcessingHoldId(id);
    const toastId = toast.loading("Cancelling hold...");
    try {
      await circulation.updateReservationStatus(id, 'cancelled');
      toast.success("Hold cancelled successfully", { id: toastId });
      refetch();
    } catch (error) {
      console.error("Failed to cancel hold:", error);
      toast.error(error.response?.data?.message || "Failed to cancel hold", { id: toastId });
    } finally {
      setProcessingHoldId(null);
    }
  };

  const handleExtendPickup = async (e, id) => {
    e.stopPropagation();
    if (processingHoldId) return;
    setProcessingHoldId(id);
    const toastId = toast.loading("Requesting extension...");
    try {
      await circulation.extendPickup(id);
      toast.success("Extension granted", { id: toastId });
      refetch();
    } catch (error) {
      console.error("Failed to extend pickup:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to request extension", { id: toastId });
    } finally {
      setProcessingHoldId(null);
    }
  };

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF6DD] text-[#E0B220] flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C9F7F5] text-[#1BC5BD] flex items-center gap-1 w-fit"><CheckCircle size={12}/> Ready for Pickup</span>;
      case 'fulfilled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-600 flex items-center gap-1 w-fit"><BookOpen size={12}/> Fulfilled</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE2E5] text-[#F64E60] flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  const filteredReservations = reservations?.filter(reservation => {
    if (statusFilter === 'ALL') return true;
    return reservation.status.toUpperCase() === statusFilter;
  }) || [];

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_STATUSES.map((status) => {
           const count = status === 'ALL' ? (reservations?.length || 0) : (reservations?.filter(r => r.status.toUpperCase() === status).length || 0);
           return (
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
                {count}
              </span>
            </button>
           );
        })}
      </div>

      {/* Desktop Header Row */}
      {(isLoading || filteredReservations.length > 0) && (
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
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-[120px] shrink-0 flex flex-col gap-2">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
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
                   <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                   <div className="h-8 bg-gray-200 rounded-full w-full mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredReservations.map((reservation) => {
            const isReady = reservation.status.toLowerCase() === 'ready';
            const isPending = reservation.status.toLowerCase() === 'pending';
            const isCancelled = reservation.status.toLowerCase() === 'cancelled';
            const isProcessing = processingHoldId === reservation.id;

            return (
              <div 
                key={reservation.id} 
                className={`backdrop-blur-xl rounded-[20px] shadow-sm transition-all duration-300 overflow-hidden cursor-pointer ${isReady ? 'bg-green-50/50 border-l-4 border-green-500 border-y-white border-r-white hover:bg-green-50/80' : 'bg-white/60 border border-white hover:bg-white/80'} ${expandedId === reservation.id ? 'ring-2 ring-gray-200' : 'hover:-translate-y-1 hover:shadow-md'}`}
                onClick={() => toggleExpand(reservation.id)}
              >
                
                {/* Desktop Row View */}
                <div className="hidden lg:flex items-center px-6 py-4">
                  <div className="w-[80px] shrink-0">
                    <div className={`w-[40px] h-[50px] flex items-center justify-center text-[18px] font-bold rounded-sm shadow-sm bg-[#FEF6DD] text-[#E0B220]`}>
                      {reservation.book_title ? reservation.book_title.charAt(0).toUpperCase() : <BookOpen size={20} />}
                    </div>
                  </div>
                  <div className="w-[280px] shrink-0 pr-4">
                    <p className="font-bold text-[#1C2434] text-[14px] truncate flex items-center" title={reservation.book_title || "Unknown Title"}>
                      <span className="truncate">{reservation.book_title || "Unknown Title"}</span>
                    </p>
                    <p className="text-[12px] text-gray-500 truncate">{reservation.book_author || "Unknown Author"}</p>
                  </div>
                  <div className="w-[200px] shrink-0 flex flex-col gap-1 pr-4">
                     <div className="text-[12px] text-gray-500">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Reserved On</span>
                        <span className="font-medium">{new Date(reservation.reserved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                     </div>
                     {isPending && reservation.queue_position && (
                         <div className="mt-1">
                             <div className="text-[12px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block border border-blue-100">
                                 You are #{reservation.queue_position} in line
                             </div>
                             {reservation.estimated_wait_days != null && (
                                 <div className="text-[11px] text-gray-500 mt-1 ml-1 font-medium">
                                     Est. wait: {formatWaitTime(reservation.estimated_wait_days)}
                                 </div>
                             )}
                         </div>
                     )}
                     {isReady && reservation.expires_at && (
                        <div className="mt-1">
                            {(() => {
                                const expires = new Date(reservation.expires_at);
                                const now = new Date();
                                const hoursLeft = (expires - now) / (1000 * 60 * 60);
                                const isUrgent = hoursLeft > 0 && hoursLeft <= 24;
                                const isExpired = hoursLeft <= 0;
                                return (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="block text-[9px] text-gray-400 uppercase tracking-wider mt-1">Pick up by</span>
                                      <span className={`text-[11px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-700'}`}>
                                          <CalendarClock size={12} />
                                          {expires.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {expires.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                );
                            })()}
                        </div>
                     )}
                  </div>
                  <div className="w-[120px] shrink-0 flex flex-col gap-1">
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="flex-1 min-w-[100px] flex items-center justify-end">
                    {(isPending || isReady) && (
                      <button 
                         className="px-4 py-1.5 bg-[#FFF4F4] text-[#F64E60] border border-[#F64E60]/20 font-bold text-[12px] rounded-full hover:bg-[#FFE2E5] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                         onClick={(e) => handleCancelHold(e, reservation.id)}
                         disabled={isProcessing}
                      >
                         {isProcessing && <Loader2 size={12} className="animate-spin" />}
                         {isProcessing ? "Cancelling..." : "Cancel Hold"}
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-700 transition-colors ml-4 hidden lg:block">
                      {expandedId === reservation.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="flex lg:hidden flex-col p-4">
                  <div className="flex gap-4">
                    <div className={`w-16 h-24 flex items-center justify-center text-[24px] font-bold rounded-md shrink-0 shadow-sm bg-[#FEF6DD] text-[#E0B220]`}>
                       {reservation.book_title ? reservation.book_title.charAt(0).toUpperCase() : <BookOpen size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-[#1C2434] text-[14px] leading-tight mb-1 truncate flex items-center" title={reservation.book_title || "Unknown Title"}>
                         <span className="truncate">{reservation.book_title || "Unknown Title"}</span>
                       </p>
                       <p className="text-[12px] text-gray-500 mb-2 truncate">by {reservation.book_author || "Unknown Author"}</p>
                       <div className="mb-2 flex flex-wrap gap-2 items-center">
                           {getStatusBadge(reservation.status)}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col pt-4 mt-2 border-t border-gray-100/50">
                     <div className="flex justify-between items-start w-full mb-2 text-[12px]">
                       <div className="text-gray-500">
                         <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Reserved On</span>
                         <span className="font-medium">{new Date(reservation.reserved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                       </div>
                       {isPending && reservation.queue_position && (
                           <div className="text-right flex flex-col items-end">
                               <div className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                   #{reservation.queue_position} in line
                               </div>
                               {reservation.estimated_wait_days != null && (
                                   <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                       Wait: {formatWaitTime(reservation.estimated_wait_days)}
                                   </div>
                               )}
                           </div>
                       )}
                     </div>

                     {isReady && reservation.expires_at && (
                         <div className="mb-3 w-full bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                            {(() => {
                                const expires = new Date(reservation.expires_at);
                                const now = new Date();
                                const hoursLeft = (expires - now) / (1000 * 60 * 60);
                                const isUrgent = hoursLeft > 0 && hoursLeft <= 24;
                                const isExpired = hoursLeft <= 0;
                                return (
                                    <>
                                      <span className="block text-[10px] text-gray-500 font-medium">Pick up by:</span>
                                      <span className={`text-[11px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-700'}`}>
                                          <CalendarClock size={12} />
                                          {expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {expires.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </>
                                );
                            })()}
                         </div>
                     )}

                     {(isPending || isReady) && (
                       <div className="flex justify-end mt-1 w-full">
                          <button 
                             className="w-full px-4 py-1.5 bg-[#FFF4F4] text-[#F64E60] border border-[#F64E60]/20 font-bold text-[12px] rounded-full hover:bg-[#FFE2E5] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                             onClick={(e) => handleCancelHold(e, reservation.id)}
                             disabled={isProcessing}
                          >
                             {isProcessing && <Loader2 size={12} className="animate-spin" />}
                             {isProcessing ? "Cancelling..." : "Cancel Hold"}
                          </button>
                       </div>
                     )}
                  </div>
                  <div className="flex items-center justify-center pt-2 pb-1 border-t border-gray-100/50 text-gray-400 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Details</span>
                    {expandedId === reservation.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Action Banner for Ready State */}
                {isReady && (
                   <div className="w-full bg-[#F3F6F9] px-4 lg:px-6 py-3 border-t border-[#E4E6EF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                         <div className="bg-white p-1.5 rounded-full text-[#3699FF] shadow-sm">
                            <MapPin size={14} />
                         </div>
                         <span className="text-[12px] font-bold whitespace-nowrap">Pickup at:</span>
                         <span className="text-[12px]">{reservation.pickup_location}</span>
                      </div>
                      <button 
                        className="w-full sm:w-auto px-4 py-1.5 bg-white text-[#3699FF] border border-[#E4E6EF] font-bold text-[12px] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleExtendPickup(e, reservation.id)}
                        disabled={isProcessing || reservation.is_extended}
                      >
                        <CalendarPlus size={14} />
                        {reservation.is_extended ? "Extended" : "Request 24h Extension"}
                      </button>
                   </div>
                )}

                {/* Expanded Content */}
                {expandedId === reservation.id && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100/50 flex flex-col gap-6 animate-in slide-in-from-top-2">
                     {/* Top Row: Description */}
                     <div className="w-full">
                         <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                         {reservation.book_description ? (
                            <p className="text-[13px] text-gray-600 leading-relaxed max-w-4xl">
                               {reservation.book_description}
                            </p>
                         ) : (
                            <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200">
                               <p className="text-[13px] text-gray-400 italic">No description available for this title.</p>
                            </div>
                         )}
                     </div>

                     {/* Bottom Row: Metadata Details */}
                     <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-100">
                         <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Book Details</h4>
                         <div className="flex flex-wrap gap-8 md:gap-12">
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">CATEGORY</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{reservation.book_category || 'Unknown'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">PUBLISHER</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{reservation.book_publisher || 'Unknown'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">ISBN</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{reservation.book_isbn || 'Unknown'}</span>
                            </div>
                            <div>
                               <span className="block text-[11px] text-gray-500 font-medium mb-0.5">LIBRARY INVENTORY</span>
                               <span className="block text-[13px] text-slate-800 font-bold">{reservation.total_copies || 0} total copies owned</span>
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
        <div className="bg-white/40 backdrop-blur-xl rounded-[20px] shadow-sm border border-white min-h-[300px] flex flex-col items-center justify-center text-gray-500">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">No Reservations Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'ALL' 
                ? 'When you reserve a book, it will appear here.'
                : `You have no ${statusFilter.toLowerCase()} reservations.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
