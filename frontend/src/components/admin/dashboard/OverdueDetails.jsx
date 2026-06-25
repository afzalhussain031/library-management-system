import React from 'react';
import { ChevronRight, MoreVertical } from 'lucide-react';

const OverdueDetails = ({ data }) => {
  return (
    <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col xl:col-span-7">
      <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Overdue details</h2>
        <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 flex items-center">
          See All <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
      <div className="p-3 flex-1 overflow-x-auto">
        <div className="min-w-[600px]">
          {data.map((item) => (
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
  );
};

export default OverdueDetails;
