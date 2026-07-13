import React, { useState } from 'react';
import { circulation } from '../../services/api';
import { Search } from 'lucide-react';
import { useApi } from '../../hook/useApi';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';
import { SkeletonAvatar, SkeletonText } from "../../components/common/Skeleton";

import ReservationTable from '../../components/admin/reservations/ReservationTable';
import ReservationDetailsDrawer from '../../components/admin/reservations/ReservationDetailsDrawer';

const TABS = ['Pending', 'Ready for Pickup', 'History'];

export default function Reservations() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [selectedReservation, setSelectedReservation] = useState(null);

  const { data: rawReservations, setData: setReservations, isLoading, error, refetch } = useApi(circulation.getReservations, []);
  const reservations = rawReservations || [];

  // --- ACTIONS ---
  
  const handleAllocate = async (id) => {
    const toastId = toast.loading("Allocating copy...");
    try {
      // Optimistic update
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'ready', ready_at: new Date().toISOString() } : r
      ));
      
      await circulation.updateReservationStatus(id, 'ready');
      toast.success("Copy allocated and marked as Ready!", { id: toastId });
      setSelectedReservation(null);
    } catch (error) {
      console.error("Failed to allocate copy", error);
      toast.error("Failed to allocate copy.", { id: toastId });
      refetch(); // Rollback
    }
  };

  const handleFulfill = async (id) => {
    const toastId = toast.loading("Fulfilling reservation...");
    try {
      // Optimistic update
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'fulfilled' } : r
      ));
      
      await circulation.fulfillReservation(id);
      toast.success("Reservation fulfilled! Loan active.", { id: toastId });
      setSelectedReservation(null);
    } catch (error) {
      console.error("Failed to fulfill", error);
      toast.error("Failed to fulfill reservation.", { id: toastId });
      refetch(); // Rollback
    }
  };

  const handleCancel = async (id) => {
    const toastId = toast.loading("Cancelling reservation...");
    try {
      // Optimistic update
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'cancelled' } : r
      ));
      
      await circulation.updateReservationStatus(id, 'cancelled');
      toast.success("Reservation cancelled and copy released.", { id: toastId });
      setSelectedReservation(null);
    } catch (error) {
      console.error("Failed to cancel", error);
      toast.error("Failed to cancel reservation.", { id: toastId });
      refetch(); // Rollback
    }
  };

  // --- FILTERING ---
  
  const filteredReservations = reservations.filter(res => {
    // 1. Filter by Tab
    if (activeTab === 'Pending' && res.status !== 'pending') return false;
    if (activeTab === 'Ready for Pickup' && res.status !== 'ready') return false;
    if (activeTab === 'History') {
      if (!['fulfilled', 'cancelled'].includes(res.status)) return false;
      if (historyFilter === 'Fulfilled' && res.status !== 'fulfilled') return false;
      if (historyFilter === 'Cancelled' && res.status !== 'cancelled') return false;
    }

    // 2. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = res.book_title?.toLowerCase().includes(q);
      const matchesUser = res.user_name?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesUser) return false;
    }

    return true;
  });

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen">
      
      {/* Header & Filters */}
      <div 
        className="w-full max-w-[1547px] bg-[#FFFFFFB2] rounded-[40px] border-b border-[#F3F4F6] shadow-sm mb-8"
        style={{ minHeight: '121px' }}
      >
        {/* Tabs */}
        <div className="flex px-8 pt-4 border-b border-gray-100 gap-8">
          {TABS.map(tab => (
            <button 
              key={tab}
              className={`pb-3 px-2 font-bold text-[15px] flex items-center gap-2 relative transition-colors ${
                activeTab === tab ? 'text-[#F6BE0A]' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {reservations.filter(r => {
                  if (tab === 'Pending') return r.status === 'pending';
                  if (tab === 'Ready for Pickup') return r.status === 'ready';
                  return ['fulfilled', 'cancelled'].includes(r.status);
                }).length}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F6BE0A] rounded-t-md" />
              )}
            </button>
          ))}
        </div>

        {/* Search Bar & Sub-filters */}
        <div className="px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64 md:w-96">
            <input 
              type="text" 
              placeholder="Search by book or user name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-5 pr-10 text-sm outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A] shadow-sm transition-all"
            />
            <Search className="absolute right-4 top-2.5 text-gray-400" size={18} />
          </div>

          {/* History Sub-filters */}
          {activeTab === 'History' && (
            <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-sm self-start sm:self-auto overflow-x-auto shrink-0">
              {['All', 'Fulfilled', 'Cancelled'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                    historyFilter === filter
                      ? 'bg-[#1C2434] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#FFFFFF80] rounded-[40px] shadow-sm border border-white min-h-[400px] overflow-hidden">
        {error ? (
          <ErrorMessage message={error.message || "Failed to load reservations"} />
        ) : isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 p-4 border rounded-xl bg-white/50">
                <SkeletonText className="h-4 w-1/4" />
                <SkeletonText className="h-4 w-1/4" />
                <SkeletonText className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <ReservationTable 
            reservations={filteredReservations}
            statusTab={activeTab}
            onRowClick={(res) => setSelectedReservation(res)}
            onAllocate={handleAllocate}
            onFulfill={handleFulfill}
            onCancel={handleCancel}
          />
        )}
      </div>

      {/* Side Panel (Drawer) */}
      <ReservationDetailsDrawer 
        isOpen={!!selectedReservation}
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onAllocate={handleAllocate}
        onFulfill={handleFulfill}
        onCancel={handleCancel}
      />
    </div>
  );
}
