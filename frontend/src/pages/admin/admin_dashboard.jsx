import React from 'react';
import { MoreVertical, ChevronRight, Check, X } from 'lucide-react';

const admin_dashboard = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-[#fcfaf8] rounded-2xl p-6 shadow-sm border border-orange-100/50 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{stat.title}</p>
              </div>
              {/* Mini chart placeholder */}
              <div className="w-20 h-10 bg-orange-50 rounded flex items-center justify-center overflow-hidden">
                 <svg className="w-full h-full text-orange-200" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,30 Q20,10 40,20 T80,5 T100,20 L100,30 L0,30 Z" fill="currentColor" opacity="0.6"/>
                    <path d="M0,30 Q20,10 40,20 T80,5 T100,20" fill="none" stroke="#fbd38d" strokeWidth="2"/>
                 </svg>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-orange-100/50 flex justify-between items-center text-[11px] text-gray-500 font-bold">
              <span>{stat.weeklyDelta}</span>
              <span>{stat.monthlyDelta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Overdue Details */}
        <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col xl:col-span-7">
          <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Overdue details</h2>
            <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 flex items-center">
              See All <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-3 flex-1 overflow-x-auto">
            <div className="min-w-[600px]">
              {overdueDetails.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-orange-50/50 rounded-xl transition-colors mb-1">
                  {/* User Info */}
                  <div className="flex items-center gap-3 w-1/4">
                    <div className={`w-9 h-9 rounded-full ${item.userColor} flex items-center justify-center text-xs font-bold text-gray-700`}>
                      {item.userInitials}
                    </div>
                    <span className="text-sm font-bold text-gray-700 truncate">{item.userName}</span>
                  </div>
                  
                  {/* Book Info */}
                  <div className="flex items-center gap-3 w-1/3">
                    <div className={`w-9 h-9 rounded-lg ${item.bookColor} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}>
                      {item.bookInitial}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-gray-800 truncate">{item.bookTitle}</span>
                      <span className="text-[11px] text-gray-400 truncate">{item.bookAuthor}</span>
                    </div>
                  </div>

                  {/* Overdue */}
                  <div className="flex flex-col items-center w-1/6">
                     <span className="text-[10px] text-gray-400 font-semibold mb-1">Overdue</span>
                     <span className="text-sm font-bold text-gray-800">{item.overdue}</span>
                  </div>

                  {/* Fine */}
                  <div className="flex flex-col items-center w-1/6">
                     <span className="text-[10px] text-gray-400 font-semibold mb-1">Fine</span>
                     <span className="text-sm font-bold text-gray-800">{item.fine}</span>
                  </div>

                  {/* Actions */}
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreVertical size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Requests & Lended) */}
        <div className="space-y-6 xl:col-span-5">
          {/* Book Requests */}
          <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col">
            <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Book requests</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="p-3">
              <div className="space-y-1">
                {bookRequests.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-orange-50/50 rounded-xl transition-colors">
                    {/* Book Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.bookColor} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                        {item.bookInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-800 truncate">{item.bookTitle}</span>
                        <span className="text-[11px] text-gray-400 truncate">{item.bookAuthor}</span>
                      </div>
                    </div>

                    {/* User Info & Date */}
                    <div className="flex items-center gap-2 shrink-0 mx-2">
                      <div className={`w-7 h-7 rounded-full ${item.userColor} flex items-center justify-center text-[10px] font-bold text-gray-700`}>
                        {item.userInitials}
                      </div>
                      <div className="flex flex-col hidden sm:flex">
                         <span className="text-xs font-bold text-gray-700 truncate w-20">{item.userName}</span>
                         <span className="text-[10px] text-gray-400">Requested on {item.date}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button className="px-2 py-0.5 rounded border border-green-200 text-[10px] font-bold text-green-600 hover:bg-green-50 transition-colors uppercase">
                        Approve
                      </button>
                      <button className="px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors uppercase">
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Books Lended */}
          <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col">
            <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Books Lended</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="p-3">
              <div className="space-y-1">
                {booksLended.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-orange-50/50 rounded-xl transition-colors">
                    {/* Book Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.bookColor} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                        {item.bookInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-800 truncate">{item.bookTitle}</span>
                        <span className="text-[11px] text-gray-400 truncate">{item.bookAuthor}</span>
                      </div>
                    </div>

                    {/* User Info & Date */}
                    <div className="flex items-center gap-2 shrink-0 mx-2">
                      <div className={`w-7 h-7 rounded-full ${item.userColor} flex items-center justify-center text-[10px] font-bold text-gray-700`}>
                        {item.userInitials}
                      </div>
                      <div className="flex flex-col hidden sm:flex">
                         <span className="text-xs font-bold text-gray-700 truncate w-20">{item.userName}</span>
                         <span className="text-[10px] text-gray-400">{item.date}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="shrink-0 w-16 flex justify-end">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.statusColor}`}>
                          {item.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default admin_dashboard;
