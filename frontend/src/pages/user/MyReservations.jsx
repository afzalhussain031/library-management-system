import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hook/useApi';
import { circulation } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Clock, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2, MapPin, CalendarClock, CalendarPlus, ExternalLink, RefreshCw, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BookThumbnail from '../../components/common/BookThumbnail';
import EntityLink from '../../components/common/EntityLink';
import { useEntityModal } from '../../context/EntityModalContext';

const FILTER_STATUSES = ['ALL', 'PENDING', 'READY', 'FULFILLED', 'CANCELLED'];

const formatWaitTime = (days) => {
  if (days == null) return null;
  if (days < 7) return "Less than a week";
  const weeks = Math.max(1, Math.round(days / 7));
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
};

export default function MyReservations() {
  const navigate = useNavigate();
  const { data: reservations, isLoading, error, refetch } = useApi(circulation.getReservations, []);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [subFilter, setSubFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [processingHoldId, setProcessingHoldId] = useState(null);
  const { showBook } = useEntityModal();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSubFilter('ALL');
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleCancelHold = async (e, id) => {
    e.stopPropagation();
    if (processingHoldId) return;
    setProcessingHoldId(id);
    const toastId = toast.loading("Cancelling hold...");
    try {
      await circulation.updateReservationStatus(id, 'cancelled', { cancellation_reason: 'Cancelled by you' });
      toast.success("Hold cancelled successfully", { id: toastId });
      refetch();
    } catch (error) {
      console.error("Failed to cancel hold:", error);
      toast.error(error.response?.data?.message || "Failed to cancel hold", { id: toastId });
    } finally {
      setProcessingHoldId(null);
    }
  };

  const handleReserveAgain = async (e, bookId) => {
    e.stopPropagation();
    if (processingHoldId) return;
    setProcessingHoldId(`reserve-${bookId}`);
    const toastId = toast.loading("Reserving...");
    try {
      await circulation.createReservation({ book: bookId });
      toast.success("Reserved successfully", { id: toastId });
      refetch();
    } catch (error) {
      console.error("Failed to reserve again:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to reserve", { id: toastId });
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

  const getTimelineData = (reservation) => {
    const status = reservation.status.toLowerCase();
    const reservedAt = new Date(reservation.reserved_at);
    let endDate = null;
    let endLabel = '';
    let percent = 0;
    let color = 'bg-gray-300';

    if (status === 'fulfilled' && reservation.fulfilled_at) {
        endDate = new Date(reservation.fulfilled_at);
        endLabel = 'Fulfilled On';
        percent = 100;
        color = 'bg-[#1BC5BD]';
    } else if (status === 'cancelled') {
        endDate = new Date(reservation.reserved_at);
        endLabel = 'Cancelled';
        percent = 100;
        color = 'bg-[#F64E60]';
    } else if (status === 'ready' && reservation.expires_at) {
        endDate = new Date(reservation.expires_at);
        endLabel = 'Pick Up By';
        
        const now = new Date().getTime();
        const start = reservedAt.getTime();
        const end = endDate.getTime();
        
        if (now >= end) {
            percent = 100;
            color = 'bg-red-500';
        } else {
            const totalDuration = end - start;
            const elapsed = now - start;
            percent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
            percent = Math.min(Math.max(percent, 0), 100);
            
            const hoursLeft = (end - now) / (1000 * 60 * 60);
            if (hoursLeft <= 24) {
                color = 'bg-orange-500';
            } else {
                color = 'bg-[#1BC5BD]';
            }
        }
    } else if (status === 'pending') {
        endLabel = 'Est. Ready';
        if (reservation.estimated_wait_days != null) {
            endDate = new Date(reservedAt);
            endDate.setDate(endDate.getDate() + reservation.estimated_wait_days);
            
            const now = new Date().getTime();
            const start = reservedAt.getTime();
            const end = endDate.getTime();
            
            if (now >= end) {
                percent = 100;
                color = 'bg-[#E0B220]';
            } else {
                const totalDuration = end - start;
                const elapsed = now - start;
                percent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
                percent = Math.min(Math.max(percent, 0), 100);
                color = 'bg-[#E0B220]';
            }
        }
    }

    return { reservedAt, endDate, endLabel, percent, color };
  };

  const tabCounts = {
    ACTIVE: 0,
    HISTORY: 0,
  };

  reservations?.forEach(res => {
    const status = res.status.toUpperCase();
    if (status === 'PENDING' || status === 'READY') {
      tabCounts.ACTIVE++;
    } else if (status === 'FULFILLED' || status === 'CANCELLED') {
      tabCounts.HISTORY++;
    }
  });

  const filteredReservations = reservations?.filter(reservation => {
    const status = reservation.status.toUpperCase();
    
    // 1. Tab Filter
    let matchesTab = false;
    if (activeTab === 'ACTIVE') {
      matchesTab = (status === 'PENDING' || status === 'READY');
    } else {
      matchesTab = (status === 'FULFILLED' || status === 'CANCELLED');
    }
    
    if (!matchesTab) return false;

    // 2. Sub-filter (Dropdown) check
    if (subFilter !== 'ALL') {
      if (status !== subFilter) return false;
    }

    // 3. Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const titleMatch = (reservation.book_title || '').toLowerCase().includes(query);
      const authorMatch = (reservation.book_author || '').toLowerCase().includes(query);
      return titleMatch || authorMatch;
    }

    return true;
  }) || [];

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Tabs and Filter Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Tabs (Pill style) */}
        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('ACTIVE')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200 shadow-sm'
          }`}
        >
          <span>Active Holds</span>
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            activeTab === 'ACTIVE' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {tabCounts.ACTIVE}
          </span>
        </button>
        <button
          onClick={() => handleTabChange('HISTORY')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200 shadow-sm'
          }`}
        >
          <span>Hold History</span>
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            activeTab === 'HISTORY' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {tabCounts.HISTORY}
          </span>
        </button>
        </div>

        {/* Dropdown Filter */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-gray-400" />
          </div>
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer text-gray-600"
          >
            {activeTab === 'ACTIVE' ? (
              <>
                <option value="ALL">All Active</option>
                <option value="READY">Ready for Pickup</option>
                <option value="PENDING">Pending</option>
              </>
            ) : (
              <>
                <option value="ALL">All History</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
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
            const isFulfilled = reservation.status.toLowerCase() === 'fulfilled';
            const isProcessing = processingHoldId === reservation.id;

            return (
              <div 
                key={reservation.id} 
                className={`backdrop-blur-xl rounded-[20px] shadow-sm transition-all duration-300 relative cursor-pointer hover:z-30 group ${isReady ? 'bg-green-50/50 border-l-4 border-green-500 border-y-white border-r-white hover:bg-green-50/80' : 'bg-white/60 border border-white hover:bg-white/80'} ${expandedId === reservation.id ? 'ring-2 ring-gray-200' : 'hover:-translate-y-[2px] hover:shadow-md'}`}
                onClick={() => toggleExpand(reservation.id)}
              >
                
                {/* Desktop Row View */}
                <div className="hidden lg:flex items-center px-6 py-4">
                  <div className="w-[80px] shrink-0">
                    <BookThumbnail 
                      title={reservation.book_title} 
                      isbn={reservation.book_isbn} 
                      author={reservation.book_author}
                      hoverExpand={true} 
                    />
                  </div>
                  <div className="w-[280px] shrink-0 pr-4">
                    <p className="font-bold text-[#1C2434] text-[14px] truncate flex items-center" title={reservation.book_title || "Unknown Title"}>
                      <span className="truncate">
                        <EntityLink onClick={(e) => { e.stopPropagation(); showBook(reservation.book_id); }}>
                          {reservation.book_title || "Unknown Title"}
                        </EntityLink>
                      </span>
                    </p>
                    <p className="text-[12px] text-gray-500 truncate">{reservation.book_author || "Unknown Author"}</p>
                  </div>
                  <div className="w-[200px] shrink-0 flex flex-col gap-1 pr-4">
                    {(() => {
                      const timeline = getTimelineData(reservation);
                      return (
                        <>
                          <div className="flex justify-between items-center text-[12px]">
                            <div className="text-gray-500">
                              <span className="block text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Reserved</span>
                              <span className="font-medium">{timeline.reservedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="text-right text-gray-500">
                              <span className="block text-[9px] uppercase tracking-wider mb-0.5 text-gray-400">
                                {timeline.endLabel}
                              </span>
                              <span className="font-medium">{timeline.endDate ? timeline.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                            </div>
                          </div>
                          {timeline.endLabel && timeline.endLabel !== 'Cancelled' && (
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${timeline.color}`} 
                                style={{ width: `${timeline.percent}%` }}
                              ></div>
                            </div>
                          )}
                          {isPending && reservation.queue_position && (
                             <div className="mt-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                                 #{reservation.queue_position} in line
                             </div>
                          )}
                          {isReady && reservation.pickup_location && (
                             <div className="mt-1 flex items-start gap-1 text-gray-500">
                                <MapPin size={12} className="mt-0.5 shrink-0" />
                                <span className="text-[11px] leading-tight">Pickup at: <span className="font-medium">{reservation.pickup_location}</span></span>
                             </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="w-[120px] shrink-0 flex flex-col gap-1">
                    {getStatusBadge(reservation.status)}
                    {isCancelled && (
                       <div className="mt-1 flex items-start gap-1 text-[#F64E60] max-w-full">
                          <span className="text-[10px] leading-tight line-clamp-2" title={reservation.cancellation_reason}>
                            {reservation.cancellation_reason || 'Cancelled'}
                          </span>
                       </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[100px] flex items-center justify-end gap-2">
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
                    {isReady && (
                      <button 
                        className="px-4 py-1.5 bg-blue-50 text-[#3699FF] border border-blue-200 font-bold text-[12px] rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleExtendPickup(e, reservation.id)}
                        disabled={isProcessing || reservation.is_extended}
                      >
                        <CalendarPlus size={14} />
                        {reservation.is_extended ? "Extended" : "Extend 24h"}
                      </button>
                    )}
                    {isCancelled && (
                       <button 
                         className="px-4 py-1.5 bg-red-50 text-[#F64E60] border border-red-200 font-bold text-[12px] rounded-full hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                         onClick={(e) => handleReserveAgain(e, reservation.book_id)}
                         disabled={isProcessing}
                       >
                         {processingHoldId === `reserve-${reservation.book_id}` ? (
                           <Loader2 size={14} className="animate-spin" />
                         ) : (
                           <RefreshCw size={14} />
                         )}
                         Reserve Again
                       </button>
                    )}
                    {isFulfilled && reservation.loan_id && (
                      <button 
                         className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 font-bold text-[12px] rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                         onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/my-loans?loanId=${reservation.loan_id}`);
                         }}
                      >
                         <ExternalLink size={14} />
                         View Loan Details
                      </button>
                    )}
                    <button className={`transition-all duration-300 ml-2 hidden lg:block shrink-0 ${
                      expandedId === reservation.id 
                        ? 'text-gray-700 opacity-100' 
                        : 'text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0'
                    }`}>
                      {expandedId === reservation.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="flex lg:hidden flex-col p-4">
                  <div className="flex gap-4">
                    <BookThumbnail 
                      title={reservation.book_title} 
                      isbn={reservation.book_isbn} 
                      author={reservation.book_author}
                      hoverExpand={false} 
                      className="w-16 h-24 text-[24px] rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-[#1C2434] text-[14px] leading-tight mb-1 truncate flex items-center" title={reservation.book_title || "Unknown Title"}>
                         <span className="truncate">
                           <EntityLink onClick={(e) => { e.stopPropagation(); showBook(reservation.book_id); }}>
                             {reservation.book_title || "Unknown Title"}
                           </EntityLink>
                         </span>
                       </p>
                       <p className="text-[12px] text-gray-500 mb-2 truncate">by {reservation.book_author || "Unknown Author"}</p>
                       <div className="mb-2 flex flex-col gap-1">
                           <div className="flex flex-wrap gap-2 items-center">
                               {getStatusBadge(reservation.status)}
                           </div>
                           {isCancelled && (
                               <div className="text-[#F64E60] text-[11px] leading-tight mt-0.5">
                                   {reservation.cancellation_reason || 'Cancelled'}
                               </div>
                           )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col pt-4 mt-2 border-t border-gray-100/50">
                     <div className="flex flex-col w-full mb-3 text-[12px]">
                        {(() => {
                          const timeline = getTimelineData(reservation);
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <div className="text-gray-500">
                                  <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Reserved</span>
                                  <span className="font-medium">{timeline.reservedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="text-right text-gray-500">
                                  <span className="block text-[10px] uppercase tracking-wider mb-0.5 text-gray-400">
                                    {timeline.endLabel}
                                  </span>
                                  <span className="font-medium">{timeline.endDate ? timeline.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                                </div>
                              </div>
                              {timeline.endLabel && timeline.endLabel !== 'Cancelled' && (
                                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                                  <div 
                                    className={`h-1.5 rounded-full ${timeline.color}`} 
                                    style={{ width: `${timeline.percent}%` }}
                                  ></div>
                                </div>
                              )}
                              {isPending && reservation.queue_position && (
                                 <div className="mt-2 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">
                                     #{reservation.queue_position} in line
                                 </div>
                              )}
                              {isReady && reservation.pickup_location && (
                                 <div className="mt-2 flex items-start gap-1 text-gray-500 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                                    <MapPin size={12} className="mt-0.5 shrink-0" />
                                    <span className="text-[11px] leading-tight">Pickup at: <span className="font-medium">{reservation.pickup_location}</span></span>
                                 </div>
                              )}
                            </>
                          );
                        })()}
                     </div>

                     <div className="flex flex-col gap-2 mt-3 w-full">
                       {isReady && (
                           <button 
                             className="w-full px-4 py-1.5 bg-blue-50 text-[#3699FF] border border-blue-200 font-bold text-[12px] rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                             onClick={(e) => handleExtendPickup(e, reservation.id)}
                             disabled={isProcessing || reservation.is_extended}
                           >
                             <CalendarPlus size={14} />
                             {reservation.is_extended ? "Extended" : "Request 24h Extension"}
                           </button>
                       )}
                       {(isPending || isReady) && (
                          <button 
                             className="w-full px-4 py-1.5 bg-[#FFF4F4] text-[#F64E60] border border-[#F64E60]/20 font-bold text-[12px] rounded-full hover:bg-[#FFE2E5] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                             onClick={(e) => handleCancelHold(e, reservation.id)}
                             disabled={isProcessing}
                          >
                             {isProcessing && <Loader2 size={12} className="animate-spin" />}
                             {isProcessing ? "Cancelling..." : "Cancel Hold"}
                          </button>
                       )}
                       {isCancelled && (
                           <button 
                             className="w-full px-4 py-1.5 bg-red-50 text-[#F64E60] border border-red-200 font-bold text-[12px] rounded-full hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                             onClick={(e) => handleReserveAgain(e, reservation.book_id)}
                             disabled={isProcessing}
                           >
                             {processingHoldId === `reserve-${reservation.book_id}` ? (
                               <Loader2 size={14} className="animate-spin" />
                             ) : (
                               <RefreshCw size={14} />
                             )}
                             Reserve Again
                           </button>
                       )}
                       {isFulfilled && reservation.loan_id && (
                          <button 
                             className="w-full px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 font-bold text-[12px] rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                             onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/my-loans?loanId=${reservation.loan_id}`);
                             }}
                          >
                             <ExternalLink size={14} />
                             View Loan Details
                          </button>
                       )}
                     </div>
                  </div>
                  <div className="flex items-center justify-center pt-2 pb-1 border-t border-gray-100/50 text-gray-400 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Details</span>
                    {expandedId === reservation.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

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
        <div className="bg-white/40 backdrop-blur-xl rounded-[20px] shadow-sm border border-white min-h-[300px] flex flex-col items-center justify-center text-gray-500 p-6">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800">
              {searchQuery ? 'No Results Found' : activeTab === 'ACTIVE' ? 'No Active Holds' : 'No Hold History'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              {searchQuery 
                ? `No reservations matching "${searchQuery}" in this tab.`
                : activeTab === 'ACTIVE'
                  ? 'You do not have any pending or ready reservations at the moment. Browse the catalog to find your next read!'
                  : 'Your past reservations will appear here once they are fulfilled or cancelled.'}
            </p>
            {!searchQuery && activeTab === 'ACTIVE' && (
              <button 
                onClick={() => navigate('/catalog')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                Browse Catalog
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
