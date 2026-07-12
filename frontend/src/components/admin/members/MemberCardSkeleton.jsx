import React from 'react';
import { SkeletonText, SkeletonAvatar } from '../../common/Skeleton';

const MemberCardSkeleton = () => {
  return (
    <div 
      className="flex flex-col relative w-full max-w-[280px] h-full rounded-[18px] bg-white border border-gray-100/50 p-5 mx-auto"
      style={{
        boxShadow: '0px 12px 35px 0px #0000000C',
      }}
    >
      {/* Top right Actions Menu Skeleton */}
      <div className="absolute top-4 right-4">
        <SkeletonAvatar className="w-6 h-6" />
      </div>

      {/* Avatar Row Skeleton */}
      <div className="flex items-center gap-3 pr-6">
        <SkeletonAvatar className="w-[45px] h-[45px] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="h-4 w-3/4" />
          <SkeletonText className="h-3 w-1/2" />
        </div>
      </div>

      {/* Details Skeleton */}
      <div className="mt-6 space-y-3 flex-grow">
        <div className="flex items-center gap-2">
          <SkeletonAvatar className="w-3.5 h-3.5 flex-shrink-0" />
          <SkeletonText className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonAvatar className="w-3.5 h-3.5 flex-shrink-0" />
          <SkeletonText className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonAvatar className="w-3.5 h-3.5 flex-shrink-0" />
          <SkeletonText className="h-3 w-16" />
        </div>
      </div>

      {/* Tags Bottom Skeleton */}
      <div className="mt-6 flex flex-col gap-2">
        <SkeletonText className="w-24 h-[22px]" rounded="rounded-full" />
        <SkeletonText className="w-28 h-[22px]" rounded="rounded-full" />
      </div>
    </div>
  );
};

export default MemberCardSkeleton;
