import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../../common/UserAvatar';
import { SkeletonAvatar, SkeletonText } from '../../common/Skeleton';
import EntityLink from '../../common/EntityLink';
import { useEntityModal } from '../../../context/EntityModalContext';

const RecentActivityTimeline = ({ data, isLoading }) => {
  const { showBook, showMember } = useEntityModal();
  return (
    <div className="bg-[#fcfaf8] rounded-2xl shadow-sm border border-orange-100/50 flex flex-col h-full">
      <div className="p-5 border-b border-orange-100/50 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        <Link to="/admin/circulation" className="text-gray-400 hover:text-gray-600 flex items-center text-sm font-semibold">
          See All <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="relative space-y-5 before:absolute before:inset-0 before:left-[5px] before:h-full before:w-[2px] before:bg-gray-100">
             {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="relative flex items-start gap-4">
                  {/* Skeleton Dot */}
                  <div className="relative z-10 mt-1.5 w-3 h-3 rounded-full ring-4 ring-[#fcfaf8] bg-gray-200 shrink-0" />
                  
                  {/* Skeleton Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-2 mb-1.5 mt-0.5">
                          <SkeletonAvatar className="w-5 h-5 rounded-full shrink-0" />
                          <SkeletonText className="h-3.5 w-3/4" />
                      </div>
                      <SkeletonText className="h-2.5 w-24 ml-[28px]" />
                  </div>
                </div>
             ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
             <p className="text-center text-gray-500 py-4 text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="relative space-y-5 before:absolute before:inset-0 before:left-[5px] before:h-full before:w-[2px] before:bg-gray-100">
            {data.map((item) => {
              const isReturn = item.eventType === 'return';
              
              return (
                <div key={`${item.id}-${item.eventType}`} className="relative flex items-start gap-4 group hover:opacity-80 transition-opacity">
                  {/* The Timeline Dot */}
                  <div className={`relative z-10 mt-1.5 w-3 h-3 rounded-full ring-4 ring-[#fcfaf8] shrink-0 ${isReturn ? 'bg-green-400' : 'bg-blue-400'}`} />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                     <div className="text-sm text-gray-600 leading-snug flex flex-wrap items-center gap-x-1.5">
                        <UserAvatar name={item.userName} size="xs" className="w-5 h-5 text-[9px]" />
                        <span className="font-bold text-gray-800">
                          <EntityLink onClick={() => showMember(item.userId)}>
                            {item.userName}
                          </EntityLink>
                        </span>
                        <span>{isReturn ? 'returned' : 'borrowed'}</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[150px] 2xl:max-w-[200px]" title={item.bookTitle}>
                          <EntityLink onClick={() => showBook(item.bookId)}>
                            "{item.bookTitle}"
                          </EntityLink>
                        </span>
                     </div>
                     <span className="text-[11px] text-gray-400 font-medium mt-1 ml-[26px]">
                        {item.eventDate}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityTimeline;
