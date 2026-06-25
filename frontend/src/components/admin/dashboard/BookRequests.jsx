import React from 'react';
import { ChevronRight } from 'lucide-react';

const BookRequests = ({ data }) => {
  return (
    <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col">
      <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Book requests</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {data.map((item) => (
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
  );
};

export default BookRequests;
