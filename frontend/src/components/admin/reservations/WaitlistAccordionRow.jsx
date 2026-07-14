import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, User, Tag } from 'lucide-react';

const WaitlistAccordionRow = ({ bookId, bookTitle, queue, onAllocate, onRowClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // queue is assumed to be sorted by reserved_at ascending
  const totalWaiting = queue.length;
  const nextInLine = queue[0];

  return (
    <>
      {/* Main Accordion Row */}
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
        <td className="p-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className={`p-1 rounded transition-colors ${isExpanded ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
            </div>
            <div>
              <p className="font-bold text-[#1C2434] text-sm md:text-base">{bookTitle}</p>
              <p className="text-xs text-gray-500 font-medium">{totalWaiting} person{totalWaiting > 1 ? 's' : ''} waiting</p>
            </div>
          </button>
        </td>
        <td className="p-4 hidden sm:table-cell">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{nextInLine?.user_name}</span>
          </div>
        </td>
        <td className="p-4 hidden md:table-cell">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            <span>{new Date(nextInLine?.reserved_at).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="p-4 text-right">
          <button
            onClick={() => onAllocate(nextInLine)}
            className="px-4 py-1.5 bg-[#F6BE0A] text-white text-xs font-bold rounded-full hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Allocate Next
          </button>
        </td>
      </tr>

      {/* Expanded Details Sub-table */}
      {isExpanded && (
        <tr>
          <td colSpan="4" className="p-0 border-b border-gray-100 bg-gray-50/30">
            <div className="px-12 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2 w-16">Queue #</th>
                    <th className="pb-2">User Name</th>
                    <th className="pb-2">Reserved At</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.map((res, index) => (
                    <tr 
                      key={res.id} 
                      className="hover:bg-gray-100/50 cursor-pointer transition-colors"
                      onClick={() => onRowClick(res)}
                    >
                      <td className="py-2.5">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-gray-800">{res.user_name}</td>
                      <td className="py-2.5 text-gray-500">
                        {new Date(res.reserved_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(res);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
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
