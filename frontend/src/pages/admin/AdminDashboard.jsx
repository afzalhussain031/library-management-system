import React from 'react';
import { MoreVertical, ChevronRight, Check, X } from 'lucide-react';

import DashboardStats from '../../components/admin/dashboard/DashboardStats';
import OverdueDetails from '../../components/admin/dashboard/OverdueDetails';
import BookRequests from '../../components/admin/dashboard/BookRequests';
import BooksLended from '../../components/admin/dashboard/BooksLended';

const AdminDashboard = () => {
  // Mock Data (Ready for API integration)
  const stats = [
    { id: 1, title: 'Total Inventory', value: '210', weeklyDelta: '+12 This week', monthlyDelta: '+5% This month' },
    { id: 2, title: 'Total books overdue', value: '32', weeklyDelta: '-2% This month', monthlyDelta: '₹ 8,360 Fine this month' },
    { id: 3, title: 'Total Books Borrowed', value: '120', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
    { id: 4, title: 'Books Left', value: '90', weeklyDelta: '+42 This week', monthlyDelta: '+102% This month' },
  ];

  const overdueDetails = [
    { id: 1, userInitials: 'JS', userColor: 'bg-gray-200', userName: 'John Stone', bookInitial: 'B', bookColor: 'bg-red-400', bookTitle: 'Do Android...', bookAuthor: 'by Douglas A.', overdue: '1 Days', fine: '₹ 40' },
    { id: 2, userInitials: 'PP', userColor: 'bg-yellow-200', userName: 'Ponnappa P...', bookInitial: 'B', bookColor: 'bg-orange-400', bookTitle: 'The Hitchh...', bookAuthor: 'by Ray Bradb...', overdue: '1 Days', fine: '₹ 40' },
    { id: 3, userInitials: 'MW', userColor: 'bg-yellow-100', userName: 'Mia Wong', bookInitial: 'B', bookColor: 'bg-green-400', bookTitle: 'Something...', bookAuthor: 'by Seth Grah...', overdue: '1 Days', fine: '₹ 40' },
    { id: 4, userInitials: 'PS', userColor: 'bg-blue-200', userName: 'Peter Stanb...', bookInitial: 'B', bookColor: 'bg-purple-400', bookTitle: 'Pride and ...', bookAuthor: 'by Mark Hadd...', overdue: '2 Days', fine: '₹ 50' },
    { id: 5, userInitials: 'NL', userColor: 'bg-pink-200', userName: 'Natalie Lee...', bookInitial: 'B', bookColor: 'bg-teal-400', bookTitle: 'The Curiou...', bookAuthor: 'by Harper Le...', overdue: '3 Days', fine: '₹ 60' },
    { id: 6, userInitials: 'AL', userColor: 'bg-red-200', userName: 'Ang Li', bookInitial: 'B', bookColor: 'bg-green-400', bookTitle: 'I Was Told...', bookAuthor: 'by Mikal Ken...', overdue: '3 Days', fine: '₹ 60' },
  ];

  const bookRequests = [
    { id: 1, bookInitial: 'B', bookColor: 'bg-red-400', bookTitle: 'A Brief History o...', bookAuthor: 'by Stephen Hawk...', userInitials: 'JS', userColor: 'bg-gray-200', userName: 'John Stone', date: '12-Dec-22' },
    { id: 2, bookInitial: 'B', bookColor: 'bg-orange-400', bookTitle: 'A Vindication of ...', bookAuthor: 'by Mary Wollsto...', userInitials: 'PP', userColor: 'bg-yellow-200', userName: 'Ponnappa P...', date: '12-Dec-22' },
    { id: 3, bookInitial: 'B', bookColor: 'bg-green-400', bookTitle: 'Critique of Pure ...', bookAuthor: 'by Immanuel Kan...', userInitials: 'MW', userColor: 'bg-yellow-100', userName: 'Mia Wong', date: '12-Dec-22' },
    { id: 4, bookInitial: 'B', bookColor: 'bg-blue-400', bookTitle: 'Nineteen Eighty-F...', bookAuthor: 'by George Orwel...', userInitials: 'PS', userColor: 'bg-blue-200', userName: 'Peter Stanb...', date: '12-Dec-22' },
  ];

  const booksLended = [
    { id: 1, bookInitial: 'B', bookColor: 'bg-red-400', bookTitle: 'A Brief History o...', bookAuthor: 'by Stephen Hawk...', userInitials: 'JS', userColor: 'bg-gray-200', userName: 'John Stone', date: '12-Dec-22', status: 'Returned', statusColor: 'text-green-500 bg-green-50' },
    { id: 2, bookInitial: 'B', bookColor: 'bg-orange-400', bookTitle: 'A Vindication of ...', bookAuthor: 'by Mary Wollsto...', userInitials: 'PP', userColor: 'bg-yellow-200', userName: 'Ponnappa P...', date: '12-Dec-22', status: 'Renewed', statusColor: 'text-green-500 bg-green-50' },
    { id: 3, bookInitial: 'B', bookColor: 'bg-green-400', bookTitle: 'Critique of Pure ...', bookAuthor: 'by Immanuel Kan...', userInitials: 'MW', userColor: 'bg-yellow-100', userName: 'Mia Wong', date: '12-Dec-22', status: 'Returned', statusColor: 'text-green-500 bg-green-50' },
    { id: 4, bookInitial: 'B', bookColor: 'bg-blue-400', bookTitle: 'Nineteen Eighty-F...', bookAuthor: 'by George Orwel...', userInitials: 'PS', userColor: 'bg-blue-200', userName: 'Peter Stanb...', date: '12-Dec-22', status: 'Overdue', statusColor: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans">
      {/* Top Stats Cards */}
      <DashboardStats data={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Overdue Details */}
        <OverdueDetails data={overdueDetails} />

        {/* Right Column (Requests & Lended) */}
        <div className="space-y-6 xl:col-span-5">
          <BookRequests data={bookRequests} />
          <BooksLended data={booksLended} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
