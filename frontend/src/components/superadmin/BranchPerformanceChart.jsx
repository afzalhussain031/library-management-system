import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { name: 'Week 4', active: 200, requests: 100, borrowed: 50 },
  { name: 'Week 5', active: 400, requests: 150, borrowed: 80 },
  { name: 'Week 6', active: 300, requests: 450, borrowed: 100 },
  { name: 'Week 7', active: 450, requests: 300, borrowed: 70 },
  { name: 'Week 8', active: 600, requests: 350, borrowed: 50 },
  { name: 'Week 9', active: 850, requests: 380, borrowed: 40 },
  { name: 'Week 10', active: 750, requests: 400, borrowed: 50 },
  { name: 'Week 11', active: 600, requests: 420, borrowed: 60 },
  { name: 'Week 12', active: 500, requests: 450, borrowed: 70 },
];

const BranchPerformanceChart = () => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-gray-800 text-lg">Branch Performance</h3>
        <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-colors">
          Last 12 Weeks <ChevronDown size={14} />
        </button>
      </div>
      
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="active" stroke="#4386F5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="requests" stroke="#C4B5FD" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            <Line type="monotone" dataKey="borrowed" stroke="#FBBF24" strokeWidth={3} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-6 text-xs font-bold text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4386F5]"></div> Active
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C4B5FD]"></div> Requests
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div> Books Borrowed
        </div>
      </div>
    </div>
  );
};

export default BranchPerformanceChart;
