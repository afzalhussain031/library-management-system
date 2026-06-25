import React from 'react';

const DashboardStats = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {data.map((stat) => (
        <div key={stat.id} className="bg-[#fcfaf8] rounded-2xl p-6 shadow-sm border border-orange-100/50 flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">{stat.title}</p>
            </div>
            {/* Mini chart placeholder */}
            <div className="w-20 h-10 bg-orange-50 rounded flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full text-orange-200" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,30 Q20,10 40,20 T80,5 T100,20 L100,30 L0,30 Z" fill="currentColor" opacity="0.6"/>
                  <path d="M0,30 Q20,10 40,20 T80,5 T100,20" fill="none" stroke="#fbd38d" strokeWidth="2"/>
                </svg>
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-orange-100/50 flex justify-between items-center text-[11px] text-gray-500 font-bold">
            <span>{stat.weeklyDelta}</span>
            <span>{stat.monthlyDelta}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
