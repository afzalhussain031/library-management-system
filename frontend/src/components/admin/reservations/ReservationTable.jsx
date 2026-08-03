import React, { useEffect } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import WaitlistAccordionRow from './WaitlistAccordionRow';
import EntityLink from '../../common/EntityLink';
import { useEntityModal } from '../../../context/EntityModalContext';

const ReservationTable = ({ reservations, statusTab, highlightId, setHighlightId, onRowClick, onMemberClick, onAllocate, onFulfill, onCancel }) => {
  const { showBook } = useEntityModal();
  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
        <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">No reservations found for this status.</p>
      </div>
    );
  }

  // Highlight Effect for standard tabs
  useEffect(() => {
    if (statusTab !== 'Pending' && highlightId) {
      const element = document.getElementById(`reservation-${highlightId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        const timer = setTimeout(() => {
          if (setHighlightId) setHighlightId(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightId, statusTab, setHighlightId]);

  // --- PENDING TAB (Grouped by Book) ---
  if (statusTab === 'Pending') {
    // Group by book_title (since book_id is write-only in the backend API)
    const grouped = reservations.reduce((acc, curr) => {
      const groupKey = curr.book_title || "Unknown Book";
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(curr);
      return acc;
    }, {});

    // Sort queues internally by date
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.reserved_at) - new Date(b.reserved_at));
    });

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-separate" style={{ borderSpacing: '0 8px' }}>
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
                key={queue[0].book_id || queue[0].book_title}
                bookTitle={queue[0].book_title}
                bookId={queue[0].book_id}
                queue={queue}
                highlightId={highlightId}
                setHighlightId={setHighlightId}
                onAllocate={onAllocate}
                onRowClick={onRowClick}
                onMemberClick={onMemberClick}
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
      <table className="w-full text-left border-separate" style={{ borderSpacing: '0 8px' }}>
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
          {reservations.map(res => {
            const isHistory = statusTab === 'History';
            let bgClass = isHistory 
              ? (res.status === 'fulfilled' ? 'bg-emerald-50/40 hover:bg-emerald-50/80' : 
                 res.status === 'cancelled' ? 'bg-red-50/40 hover:bg-red-50/80' : 'bg-white hover:bg-gray-50/80')
              : 'bg-white hover:bg-gray-50/80';
              
            if (res.id === highlightId) {
              bgClass = 'ring-2 ring-yellow-400 bg-yellow-50/80 animate-pulse';
            }
              
            return (
              <tr 
                key={res.id} 
                id={`reservation-${res.id}`}
                onClick={() => onRowClick(res)}
                className={`${bgClass} cursor-pointer transition-all duration-300 group hover:-translate-y-[2px] hover:shadow-md rounded-xl shadow-sm`}
              >
                <td className="p-4 font-bold text-[#1C2434] text-sm first:rounded-l-xl border border-transparent hover:border-gray-100 border-r-0">
                  {res.book_id ? (
                    <EntityLink onClick={(e) => { e.stopPropagation(); showBook(res.book_id); }}>
                      {res.book_title}
                    </EntityLink>
                  ) : (
                    res.book_title
                  )}
                </td>
              <td className="p-4 text-sm text-gray-700">
                <EntityLink onClick={(e) => { e.stopPropagation(); onMemberClick(res.user); }}>
                  {res.user_name}
                </EntityLink>
              </td>
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
                <td className="p-4 text-sm font-medium border-transparent">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      res.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {res.status}
                    </span>
                    <ChevronRight size={18} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                  </div>
                </td>
              )}
              <td className="p-4 text-right rounded-r-xl">
                {statusTab === 'Ready for Pickup' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(res);
                    }}
                    className="px-4 py-1.5 bg-gray-100 text-[#1C2434] text-xs font-bold rounded-full hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Review
                  </button>
                )}
                {statusTab === 'History' && (
                  <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
                    View
                  </span>
                )}
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;
