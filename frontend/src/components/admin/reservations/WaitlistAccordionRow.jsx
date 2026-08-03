import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Clock, User, Tag } from 'lucide-react';
import EntityLink from '../../common/EntityLink';
import { useEntityModal } from '../../../context/EntityModalContext';

const WaitlistAccordionRow = ({ bookId, bookTitle, queue, highlightId, setHighlightId, onAllocate, onRowClick, onMemberClick }) => {
  const [isExpanded, setIsExpanded] = useState(queue.some(r => r.id === highlightId));
  const { showBook } = useEntityModal();

  // queue is assumed to be sorted by reserved_at ascending
  const totalWaiting = queue.length;
  const nextInLine = queue[0];

  useEffect(() => {
    if (isExpanded && highlightId && queue.some(r => r.id === highlightId)) {
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
  }, [isExpanded, highlightId, queue, setHighlightId]);

  return (
    <>
      {/* Main Accordion Row */}
      <tr 
        className="bg-white cursor-pointer transition-all duration-300 group hover:-translate-y-[2px] hover:shadow-md rounded-xl shadow-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="p-4 first:rounded-l-xl border border-transparent hover:border-gray-100 border-r-0">
          <div className="flex items-center gap-3 text-left focus:outline-none">
            <div className={`p-1 rounded transition-colors ${isExpanded ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
            </div>
            <div>
              <p className="font-bold text-[#1C2434] text-sm md:text-base">
                {bookId ? (
                  <EntityLink onClick={(e) => { e.stopPropagation(); showBook(bookId); }}>
                    {bookTitle}
                  </EntityLink>
                ) : (
                  bookTitle
                )}
              </p>
              <p className="text-xs text-gray-500 font-medium">{totalWaiting} person{totalWaiting > 1 ? 's' : ''} waiting</p>
            </div>
          </div>
        </td>
        <td className="p-4 hidden sm:table-cell border border-transparent hover:border-gray-100 border-x-0">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              <EntityLink onClick={(e) => { e.stopPropagation(); onMemberClick(nextInLine?.user); }}>
                {nextInLine?.user_name}
              </EntityLink>
            </span>
          </div>
        </td>
        <td className="p-4 hidden md:table-cell border border-transparent hover:border-gray-100 border-x-0">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            <span>{new Date(nextInLine?.reserved_at).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="p-4 text-right last:rounded-r-xl border border-transparent hover:border-gray-100 border-l-0">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onAllocate(nextInLine); }}
              className="px-4 py-1.5 bg-[#F6BE0A] text-white text-xs font-bold rounded-full hover:bg-yellow-500 transition-colors shadow-sm"
            >
              Allocate Next
            </button>
            <ChevronRight size={18} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
          </div>
        </td>
      </tr>

      {/* Expanded Details Sub-table */}
      {isExpanded && (
        <tr>
          <td colSpan="4" className="p-0 border-b border-gray-100 bg-gray-50/30">
            <div className="px-12 py-4">
              <table className="w-full text-sm border-separate" style={{ borderSpacing: '0 4px' }}>
                <thead>
                  <tr className="text-left text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2 w-16">Queue #</th>
                    <th className="pb-2">User Name</th>
                    <th className="pb-2">Reserved At</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((res, index) => {
                    const isHighlighted = res.id === highlightId;
                    return (
                    <tr 
                      key={res.id} 
                      id={`reservation-${res.id}`}
                      className={`cursor-pointer transition-all duration-300 group hover:-translate-y-[1px] hover:shadow-sm shadow-xs rounded-lg ${isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50/80 animate-pulse' : 'bg-white hover:bg-gray-50'}`}
                      onClick={() => onRowClick(res)}
                    >
                      <td className="py-2.5 px-3 first:rounded-l-lg border border-transparent hover:border-gray-100 border-r-0">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800 border border-transparent hover:border-gray-100 border-x-0">
                        <EntityLink onClick={(e) => { e.stopPropagation(); onMemberClick(res.user); }}>
                          {res.user_name}
                        </EntityLink>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 border border-transparent hover:border-gray-100 border-x-0">
                        {new Date(res.reserved_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right last:rounded-r-lg border border-transparent hover:border-gray-100 border-l-0">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRowClick(res); }}
                            className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs font-bold hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                          <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default WaitlistAccordionRow;
