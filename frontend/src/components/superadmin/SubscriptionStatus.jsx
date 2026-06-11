import React from 'react';
import { ChevronDown } from 'lucide-react';

const SubscriptionStatus = () => {
  const subscriptions = [
    { id: 1, name: 'Main Campus', isChecked: false, badge1: 'Expiring', badge2: 'Sad 2023', type1: 'warning', type2: 'neutral' },
    { id: 2, name: 'Medical Branch', isChecked: false, badge1: '16 Sep 2023', badge2: 'Dec 2023', type1: 'primary', type2: 'primary' },
    { id: 3, name: 'Engineering', isChecked: false, badge1: '15 June 2022', badge2: 'Active:', type1: 'primary', type2: 'warning', icon: '📦' },
    { id: 4, name: 'QA Library', isChecked: false, badge1: null, badge2: 'Active', type1: null, type2: 'success', icon: '✓' },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">Subscription Status</h3>
        <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-colors">
          View Full Report <ChevronDown size={14} />
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                defaultChecked={sub.id === 1}
                className="w-4 h-4 rounded border-gray-300 text-[#4386F5] focus:ring-[#4386F5]"
              />
              <span className="font-medium text-gray-600">{sub.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {sub.badge1 && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  sub.type1 === 'warning' ? 'bg-[#FFF0E0] text-[#E58A35]' : 'bg-[#EAF2FF] text-[#4386F5]'
                }`}>
                  {sub.badge1}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                sub.type2 === 'warning' ? 'bg-[#FEF6DD] text-[#E0B220]' : 
                sub.type2 === 'primary' ? 'bg-[#EAF2FF] text-[#4386F5]' : 
                sub.type2 === 'success' ? 'bg-[#C9F7F5] text-[#1BC5BD]' : 'bg-gray-100 text-gray-500'
              }`}>
                {sub.icon && <span className="text-[10px]">{sub.icon}</span>}
                {sub.badge2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
