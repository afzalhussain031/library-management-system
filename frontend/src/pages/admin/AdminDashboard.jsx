import React, { useState, useEffect } from "react";
import { MoreVertical, ChevronRight, Check, X } from "lucide-react";
import client from "../../services/httpClient";
import toast from "react-hot-toast";

import DashboardStats from "../../components/admin/dashboard/DashboardStats";
import OverdueDetails from "../../components/admin/dashboard/OverdueDetails";
import BookRequests from "../../components/admin/dashboard/BookRequests";
import RecentActivityTimeline from "../../components/admin/dashboard/RecentActivityTimeline";

import { useApi } from "../../hook/useApi";
import { dashboard } from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminDashboard = () => {
  const { data: analyticsData, isLoading, error } = useApi(dashboard.getAdminStats);
  
  const [bookRequests, setBookRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Calculate Month-over-Month Growth
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0; 
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatGrowth = (current, previous) => {
    const growth = calculateGrowth(current, previous);
    return growth >= 0 ? `+${growth}%` : `${growth}%`;
  };

  // 1. Calculate stats dynamically
  let stats = [
    { id: 1, title: 'Total Inventory', value: '...', weeklyDelta: '+12 This week', monthlyDelta: '+5% This month' },
    { id: 2, title: 'Total books overdue', value: '...', weeklyDelta: '-2% This month', monthlyDelta: 'Loading fines...' }, 
    { id: 3, title: 'Total Books Borrowed', value: '...', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
    { id: 4, title: 'Books Left', value: '...', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
  ];

  let timelineData = [];
  let overdueDetails = [];

  // Update states once data is loaded
  useEffect(() => {
    if (analyticsData?.recent_reservations) {
      const formattedRequests = (analyticsData?.recent_reservations || []).map(res => ({
        id: res.id,
        bookInitial: res.book_title ? res.book_title.charAt(0).toUpperCase() : 'B',
        bookColor: 'bg-blue-400', 
        bookTitle: res.book_title,
        bookId: res.book_id,
        bookAuthor: `by ${res.book_author}`,
        userName: res.user_name || `User #${res.user}`,
        userId: res.user,
        date: new Date(res.reserved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-'),
      }));
      setBookRequests(formattedRequests);
    }
  }, [analyticsData]);

  if (analyticsData) {
    stats = [
      { 
        id: 1, 
        title: 'Total Inventory', 
        value: analyticsData.total_inventory, 
        weeklyDelta: `+${analyticsData.inventory_this_week || 0} This week`, 
        monthlyDelta: `${formatGrowth(analyticsData.inventory_this_month || 0, analyticsData.inventory_last_month || 0)} This month`
      },
      { 
        id: 2, 
        title: 'Total books overdue', 
        value: analyticsData.total_overdue, 
        weeklyDelta: `+${analyticsData.overdue_this_week || 0} This week`, 
        monthlyDelta: `₹ ${analyticsData.fines_this_month || 0} Fine this month` 
      },
      { 
        id: 3, 
        title: 'Total Books Borrowed', 
        value: analyticsData.total_borrowed, 
        weeklyDelta: `+${analyticsData.borrowed_this_week || 0} This week`, 
        monthlyDelta: `${formatGrowth(analyticsData.borrowed_this_month || 0, analyticsData.borrowed_last_month || 0)} This month`  
      },
      { 
        id: 4, 
        title: 'Books Left', 
        value: analyticsData.books_left, 
        weeklyDelta: `-`, 
        monthlyDelta: `-` 
      },
    ];

    timelineData = (analyticsData.recent_loans || []).map(loan => {
      const isReturn = !!loan.returned_at;
      const eventDateStr = isReturn ? loan.returned_at : loan.issued_at;
      
      return {
        id: loan.id,
        eventType: isReturn ? 'return' : 'borrow',
        userName: loan.user_name || 'Unknown User',
        userId: loan.borrower,
        bookTitle: loan.book_title,
        bookId: loan.book_id,
        eventDate: new Date(eventDateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      };
    });

    const bookColors = ['bg-red-400', 'bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'];
    overdueDetails = (analyticsData.overdue_loans || []).map(loan => ({
      id: loan.id,
      userName: loan.user_name || 'Unknown User',
      userId: loan.borrower,
      bookInitial: loan.book_title ? loan.book_title.charAt(0).toUpperCase() : 'B',
      bookColor: bookColors[loan.id % bookColors.length],
      bookTitle: loan.book_title,
      bookId: loan.book_id,
      bookAuthor: `by ${loan.book_author}`,
      overdue: `${loan.overdue_days || 0} Days`,
      fine: `₹ ${loan.current_fine_estimate || 0}`
    }));
  }

  const handleApproveRequest = async (id) => {
    setActionLoadingId(id);
    const toastId = toast.loading("Approving request...");
    try {
      await client.patch(`/reservations/${id}/`, { status: 'ready' });
      setBookRequests(prev => prev.filter(req => req.id !== id));
      toast.success("Request approved!", { id: toastId });
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Failed to approve request.", { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDenyRequest = async (id) => {
    setActionLoadingId(id);
    const toastId = toast.loading("Denying request...");
    try {
      await client.patch(`/reservations/${id}/`, { status: 'cancelled' });
      setBookRequests(prev => prev.filter(req => req.id !== id));
      toast.success("Request denied.", { id: toastId });
    } catch (err) {
      console.error("Error denying request:", err);
      toast.error("Failed to deny request.", { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans">
      <DashboardStats data={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        <div className="space-y-6 xl:col-span-7 flex flex-col">
          <OverdueDetails data={overdueDetails.slice(0, 3)} isLoading={isLoading} />
          <BookRequests 
            data={bookRequests.slice(0, 3)}
            isLoading={isLoading}
            actionLoadingId={actionLoadingId}
            onApprove={handleApproveRequest}
            onDeny={handleDenyRequest}
          />
        </div>

        <div className="xl:col-span-5 flex flex-col h-full">
          <RecentActivityTimeline data={timelineData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;