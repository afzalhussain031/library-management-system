import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from '../../common/UserAvatar';
import { SkeletonAvatar, SkeletonText } from '../../common/Skeleton';

const BookRequests = ({ data, isLoading, actionLoadingId, onApprove, onDeny }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col">
      <div className="p-5 border-b border-orange-100/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Book requests</h2>
        <Link to="/admin/reservations" className="text-gray-400 hover:text-gray-600 flex items-center text-sm font-semibold">
          See All <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {isLoading ? (
            // Render 3 dummy list items
            [1, 2, 3].map(key => (
              <div key={key} className="flex items-center justify-between p-3 gap-4">
                <SkeletonAvatar className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-2 w-24" />
                </div>
                <SkeletonAvatar className="w-6 h-6 rounded-full mx-2" />
                <div className="flex flex-col gap-1">
                  <SkeletonText className="h-4 w-12" />
                  <SkeletonText className="h-4 w-12" />
                </div>
              </div>
            ))
          ) : data.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No book requests.</p>
          ) : (
            /* Actual Data Mapping */
            data.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 hover:bg-orange-50/50 rounded-xl transition-colors">
                {/* Book Info */}
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:underline"
                  onClick={() => item.bookId && navigate(`/admin/books?bookId=${item.bookId}`)}
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bookColor} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                    {item.bookInitial}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-800 truncate">{item.bookTitle}</span>
                    <span className="text-[11px] text-gray-400 truncate">{item.bookAuthor}</span>
                  </div>
                </div>

                {/* User Info & Date */}
                <div 
                  className="flex items-center gap-2 shrink-0 mx-2 cursor-pointer hover:underline"
                  onClick={() => item.memberId && navigate(`/admin/members?memberId=${item.memberId}`)}
                >
                  <UserAvatar name={item.userName} size="xs" />
                  <div className="flex flex-col hidden sm:flex">
                      <span className="text-xs font-bold text-gray-700 truncate w-20">{item.userName}</span>
                      <span className="text-[10px] text-gray-400">Requested on {item.date}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button 
                    onClick={() => onApprove(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="px-2 py-0.5 rounded border border-green-200 text-[10px] font-bold text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase flex justify-center items-center h-[22px] min-w-[50px]"
                  >
                    {actionLoadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                  </button>
                  <button 
                    onClick={() => onDeny(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase flex justify-center items-center h-[22px] min-w-[50px]"
                  >
                    {actionLoadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : 'Deny'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookRequests;
