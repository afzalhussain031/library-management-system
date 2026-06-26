import React, { useState, useEffect } from "react";
import { MoreVertical, ChevronRight, Check, X } from "lucide-react";
import client from "../../services/httpClient";

import DashboardStats from "../../components/admin/dashboard/DashboardStats";
import OverdueDetails from "../../components/admin/dashboard/OverdueDetails";
import BookRequests from "../../components/admin/dashboard/BookRequests";
import BooksLended from "../../components/admin/dashboard/BooksLended";

const AdminDashboard = () => {
  const [bookRequests, setBookRequests] = useState([]);
  const [booksLended, setBooksLended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Replaced the static `const stats = [...]` with a React State Variable
  //    This acts as a placeholder while the data is loading from the API.
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Inventory', value: '...', weeklyDelta: '+12 This week', monthlyDelta: '+5% This month' },
    { id: 2, title: 'Total books overdue', value: '...', weeklyDelta: '-2% This month', monthlyDelta: 'Loading fines...' }, 
    { id: 3, title: 'Total Books Borrowed', value: '...', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
    { id: 4, title: 'Books Left', value: '...', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
  ]);

  const overdueDetails = [
    { id: 1, userInitials: 'JS', userColor: 'bg-gray-200', userName: 'John Stone', bookInitial: 'B', bookColor: 'bg-red-400', bookTitle: 'Do Android...', bookAuthor: 'by Douglas A.', overdue: '1 Days', fine: '₹ 40' },
    { id: 2, userInitials: 'PP', userColor: 'bg-yellow-200', userName: 'Ponnappa P...', bookInitial: 'B', bookColor: 'bg-orange-400', bookTitle: 'The Hitchh...', bookAuthor: 'by Ray Bradb...', overdue: '1 Days', fine: '₹ 40' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 2. Added the analytics endpoint to the API calls array
        const [reservationsRes, loansRes, statsRes] = await Promise.all([
          client.get('/reservations/'),
          client.get('/loans/'),
          client.get('/analytics/dashboard-stats/') // <-- New Call
        ]);

        // 3. Extracted the data and updated the Stats state
        const analyticsData = statsRes.data;

        setStats([
          { id: 1, title: 'Total Inventory', value: analyticsData.total_inventory, weeklyDelta: '+12 This week', monthlyDelta: '+5% This month' },
          { id: 2, title: 'Total books overdue', value: analyticsData.total_overdue, weeklyDelta: '-2% This month', monthlyDelta: `₹ ${analyticsData.total_fines} Fine this month` },
          { id: 3, title: 'Total Books Borrowed', value: analyticsData.total_borrowed, weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
          { id: 4, title: 'Books Left', value: analyticsData.books_left, weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
        ]);

        const formattedRequests = reservationsRes.data.map(res => ({
          id: res.id,
          bookInitial: res.book_title ? res.book_title.charAt(0).toUpperCase() : 'B',
          bookColor: 'bg-blue-400', 
          bookTitle: res.book_title,
          bookAuthor: `by ${res.book_author}`,
          userInitials: 'U', 
          userColor: 'bg-gray-200',
          userName: `User #${res.user}`, 
          date: new Date(res.reserved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-'),
        }));

        const formattedLoans = loansRes.data.map(loan => {
          let status = 'Borrowed';
          let statusColor = 'text-blue-500 bg-blue-50';

          if (loan.returned_at) {
            status = 'Returned';
            statusColor = 'text-green-500 bg-green-50';
          } else if (new Date(loan.due_at) < new Date()) {
            status = 'Overdue';
            statusColor = 'text-red-500 bg-red-50';
          } else if (loan.renewed_count > 0) {
            status = 'Renewed';
            statusColor = 'text-yellow-600 bg-yellow-50';
          }

          return {
            id: loan.id,
            bookInitial: loan.book_title ? loan.book_title.charAt(0).toUpperCase() : 'B',
            bookColor: 'bg-green-400',
            bookTitle: loan.book_title,
            bookAuthor: `by ${loan.book_author}`,
            userInitials: 'U', 
            userColor: 'bg-gray-200',
            userName: `User`, 
            date: new Date(loan.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-'),
            status: status,
            statusColor: statusColor
          };
        });

        setBookRequests(formattedRequests);
        setBooksLended(formattedLoans);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">Loading dashboard data from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans">
      <DashboardStats data={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        <OverdueDetails data={overdueDetails} />

        <div className="space-y-6 xl:col-span-5">
          <BookRequests data={bookRequests} />
          <BooksLended data={booksLended} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;