import React from 'react';
import { BookOpen } from 'lucide-react';
import WaitlistAccordionRow from './WaitlistAccordionRow';

const ReservationTable = ({ reservations, statusTab, onRowClick, onAllocate, onFulfill, onCancel }) => {
  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
        <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">No reservations found for this status.</p>
      </div>
    );
  }

  // --- PENDING TAB (Grouped by Book) ---
  if (statusTab === 'Pending') {
    // Group by book_id and sort by reserved_at
    const grouped = reservations.reduce((acc, curr) => {
      acc[curr.book_id] = acc[curr.book_id] || [];
      acc[curr.book_id].push(curr);
      return acc;
    }, {});

    // Sort queues internally by date
    Object.keys(grouped).forEach(bookId => {
      grouped[bookId].sort((a, b) => new Date(a.reserved_at) - new Date(b.reserved_at));
    });

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold text-[#A0ABC0] uppercase tracking-wider">
              <th className="p-4 w-1/3">Book Title</th>
              <th className="p-4 hidden sm:table-cell">Next in Line</th>
              <th className="p-4 hidden md:table-cell">Reserved Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(grouped).map(queue => (
              <WaitlistAccordionRow 
                key={queue[0].book_id}
                bookId={queue[0].book_id}
                bookTitle={queue[0].book_title}
                queue={queue}
                onAllocate={onAllocate}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- READY / HISTORY TABS (Standard List) ---
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-bold text-[#A0ABC0] uppercase tracking-wider">
            <th className="p-4">Book Title</th>
            <th className="p-4">User</th>
            <th className="p-4 hidden sm:table-cell">
              {statusTab === 'Ready for Pickup' ? 'Ready Since' : 'Date'}
            </th>
            {statusTab === 'Ready for Pickup' && <th className="p-4 hidden md:table-cell">Barcode</th>}
            {statusTab === 'History' && <th className="p-4">Status</th>}
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reservations.map(res => (
            <tr 
              key={res.id} 
              onClick={() => onRowClick(res)}
              className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
            >
              <td className="p-4 font-bold text-[#1C2434] text-sm">{res.book_title}</td>
              <td className="p-4 text-sm text-gray-700">{res.user_name}</td>
              <td className="p-4 text-sm text-gray-500 hidden sm:table-cell">
                {statusTab === 'Ready for Pickup' 
                  ? new Date(res.ready_at).toLocaleDateString()
                  : new Date(res.reserved_at).toLocaleDateString()}
              </td>
              {statusTab === 'Ready for Pickup' && (
                <td className="p-4 hidden md:table-cell text-sm font-mono text-gray-600">
                  {res.allocated_copy_barcode || 'N/A'}
                </td>
              )}
              {statusTab === 'History' && (
                <td className="p-4 text-sm font-bold capitalize">
                  <span className={res.status === 'fulfilled' ? 'text-emerald-600' : 'text-red-600'}>
                    {res.status}
                  </span>
                </td>
              )}
              <td className="p-4 text-right">
                {statusTab === 'Ready for Pickup' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFulfill(res.id);
                    }}
                    className="px-4 py-1.5 bg-[#1C2434] text-white text-xs font-bold rounded-full hover:bg-black transition-colors shadow-sm"
                  >
                    Fulfill
                  </button>
                )}
                {statusTab === 'History' && (
                  <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
                    View
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;
