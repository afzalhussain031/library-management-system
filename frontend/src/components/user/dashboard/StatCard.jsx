import { SkeletonText } from '../../common/Skeleton';
import { ChevronRight } from 'lucide-react';

export default function StatCard({ icon, title, value, isLoading, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-4xl shadow-md flex items-center justify-between relative transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-gray-100 border border-transparent group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl text-xl">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-gray-600 text-sm font-medium ">{title}</p>
          <h2 className="text-xl font-semibold text-gray-900 ">
            {isLoading ? <SkeletonText className="h-6 w-16" /> : value}
          </h2>
        </div>
      </div>
      
      {onClick && (
        <ChevronRight size={20} className="text-gray-300 opacity-0 group-hover:opacity-100 absolute right-4 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
      )}
    </div>
  );
}