import React from 'react';
import { Plus, UserPlus, FileText, Bell, ChevronRight, ArrowUp } from 'lucide-react';

export const QuickActions = () => {
  return (
    <div className="bg-white rounded-[24px] p-3 flex flex-wrap items-center justify-between shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-[#EAF2FF] text-[#4386F5] hover:bg-[#D4E3FF]">
          <Plus size={16} /> New Library
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-[#FFF0E0] text-[#E58A35] hover:bg-[#FFE3C2]">
          <UserPlus size={16} /> Add Admin
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-[#F0E6FF] text-[#8B5CF6] hover:bg-[#E5D4FF]">
          <FileText size={16} /> Generate Reports
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-[#EAFBFA] text-[#0D9488] hover:bg-[#CCFBF1]">
          <Bell size={16} /> Broadcast Notice
        </button>
      </div>
      <div className="px-4 text-xs font-semibold text-gray-500 flex items-center gap-3">
        <span>Last 12 Weeks</span>
        <button className="text-[#4386F5] hover:underline">View Full Report</button>
      </div>
    </div>
  );
};

export const AlertsPanel = () => {
  const alerts = [
    { id: 1, text: '3 libraries subscription expiring', action: 'Renew', type: 'danger' },
    { id: 2, text: '2 admins inactive 21 days', action: 'View', type: 'info' },
    { id: 3, text: '124 pending requests in Engineering', action: 'View', type: 'info' },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800">Alerts</h3>
        <ChevronRight size={18} className="text-gray-400 cursor-pointer" />
      </div>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[10px]">📊</span>
              </div>
              <span className="leading-tight">{alert.text}</span>
            </div>
            <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 shrink-0 ${
              alert.type === 'danger' ? 'bg-[#FFE2E5] text-[#F64E60] hover:bg-[#FFD1D6]' : 'bg-[#EAF2FF] text-[#4386F5] hover:bg-[#D4E3FF]'
            }`}>
              {alert.action} <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TopRequestedCategories = () => {
  const categories = [
    { name: 'Programming', increase: '41.20%' },
    { name: 'Machine Learning', increase: '43.29%' },
    { name: 'Fiction', increase: '48.0%' },
    { name: 'Data Science', increase: '47.69%' },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800">Top Requested Categories</h3>
        <button className="text-[#4386F5] text-sm font-bold flex items-center gap-1 hover:underline">
          More <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-4">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <div className="w-4 h-4 rounded-full border-[3px] border-[#4386F5] bg-transparent"></div>
              {cat.name}
            </div>
            <div className="text-[#1BC5BD] font-bold text-xs flex items-center gap-1">
              <ArrowUp size={12} strokeWidth={3} /> {cat.increase}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TaskStatus = () => {
  const tasks = [
    { text: 'Overdue book returns in Medical Branch', status: 'none' },
    { text: 'Unable to access library system', status: 'Urgent' },
    { text: 'Account deactivation request', status: 'Resolved' },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-5 text-sm font-bold text-gray-600">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E0B220]"></div> Open 6</div>
        <div className="flex items-center gap-1.5 text-gray-800"><div className="w-2.5 h-2.5 rounded-full bg-[#1C2434]"></div> Urgent 2</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div> Resolved 4</div>
      </div>
      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <div className={`w-4 h-4 rounded-full border-[2px] bg-transparent ${
                task.status === 'Urgent' ? 'border-[#E0B220]' : task.status === 'Resolved' ? 'border-gray-300' : 'border-[#F64E60]'
              }`}>
                {task.status === 'Resolved' && <span className="text-gray-300 block -mt-[3px] ml-[1px] text-[10px]">✓</span>}
              </div>
              <span className="leading-tight pr-2">{task.text}</span>
            </div>
            {task.status !== 'none' && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                task.status === 'Urgent' ? 'bg-[#FFE2E5] text-[#F64E60]' : 'bg-gray-100 text-gray-500'
              }`}>
                {task.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentActivity = () => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800">Recent Activity</h3>
        <button className="text-[#4386F5] text-sm font-bold flex items-center gap-1 hover:underline">
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <div className="w-4 h-4 rounded-[4px] border-[2px] border-[#4386F5] bg-transparent"></div>
          <span className="leading-tight">Admin Ratul approved 8 requests</span>
        </div>
        <span className="px-3 py-1 bg-[#C9F7F5] text-[#1BC5BD] rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
           <span className="text-[10px]">📦</span> Urgent
        </span>
      </div>
    </div>
  );
};
