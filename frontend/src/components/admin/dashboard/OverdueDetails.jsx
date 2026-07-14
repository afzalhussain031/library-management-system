import React, { useState } from 'react';
import { ChevronRight, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import UserAvatar from '../../common/UserAvatar';
import { SkeletonAvatar, SkeletonText } from '../../common/Skeleton';

const OverdueDetails = ({ data, isLoading }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null); 
    } else {
      setOpenMenuId(id); 
    }
  };

  return (
    <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col">
      <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Overdue details</h2>
        {/* FIXED: Path updated to match AppRouter.jsx */}
        <Link to="/admin/circulation" className="text-sm font-semibold text-gray-400 hover:text-gray-600 flex items-center">
          See All <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      <div className="p-3 flex-1 overflow-x-auto">
        <div className="min-w-[600px]">
          {isLoading ? (
            // Render 3 dummy list items
            [1, 2, 3].map(key => (
              <div key={key} className="flex items-center justify-between p-3 gap-4 mb-1">
                {/* User Info */}
                <div className="flex items-center gap-3 w-1/4">
                  <SkeletonAvatar className="w-8 h-8 rounded-full shrink-0" />
                  <SkeletonText className="h-4 w-24" />
                </div>
                
                {/* Book Info */}
                <div className="flex items-center gap-3 w-1/3">
                  <SkeletonAvatar className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <SkeletonText className="h-4 w-32" />
                    <SkeletonText className="h-3 w-24" />
                  </div>
                </div>

                {/* Overdue */}
                <div className="flex flex-col items-center w-1/6">
                    <SkeletonText className="h-3 w-12 mb-1" />
                    <SkeletonText className="h-4 w-8" />
                </div>

                {/* Fine */}
                <div className="flex flex-col items-center w-1/6">
                    <SkeletonText className="h-3 w-12 mb-1" />
                    <SkeletonText className="h-4 w-12" />
                </div>

                {/* Dropdown Actions */}
                <div className="flex justify-end w-8">
                  <SkeletonAvatar className="w-6 h-6 rounded-md" />
                </div>
              </div>
            ))
          ) : data.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No overdue details.</p>
          ) : (
            data.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 hover:bg-orange-50/50 rounded-xl transition-colors mb-1 relative">
                {/* User Info */}
                <div className="flex items-center gap-3 w-1/4">
                  <UserAvatar name={item.userName} size="sm" />
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

                {/* Dropdown Actions */}
                <div className="relative flex justify-end w-8">
                  <button 
                    onClick={() => toggleMenu(item.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* The Dropdown Menu (only shows if openMenuId matches this item) */}
                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white shadow-md border border-gray-100 rounded-lg z-10 py-1 text-sm overflow-hidden flex flex-col">
                      <button 
                        className="px-4 py-2 text-left hover:bg-orange-50 text-gray-700 transition-colors"
                        onClick={() => { toast('Reminder feature coming soon!', { icon: '🚧' }); setOpenMenuId(null); }}
                      >
                        Send Reminder
                      </button>
                      <button 
                        className="px-4 py-2 text-left hover:bg-orange-50 text-green-600 transition-colors"
                        onClick={() => { toast('Mark returned feature coming soon!', { icon: '🚧' }); setOpenMenuId(null); }}
                      >
                        Mark Returned
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverdueDetails;
