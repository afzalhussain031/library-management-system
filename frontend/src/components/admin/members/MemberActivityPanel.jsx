import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import LoanTimeline from '../../common/LoanTimeline';

// Mock data for demonstration
const mockActivity = {
  borrowed: [
    { id: '#4235532', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2023-10-01', due: '2023-10-15' },
    { id: '#4235533', title: 'The Universe in a..', author: 'by Stephen Hawk..', issued: '2023-10-05', due: '2023-10-19' },
  ],
  returned: [
    { id: '#4235534', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-28', due: '2022-12-12', date: '2022-12-12' },
    { id: '#4235535', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-28', due: '2022-12-12', date: '2022-12-12' },
    { id: '#4235536', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-28', due: '2022-12-12', date: '2022-12-12' },
    { id: '#4235537', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-28', due: '2022-12-12', date: '2022-12-12' },
    { id: '#4235538', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-28', due: '2022-12-12', date: '2022-12-12' },
  ],
  fines: [
    { id: '#4235539', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-20', due: '2022-12-04', amount: 40 },
    { id: '#4235540', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-20', due: '2022-12-04', amount: 40 },
    { id: '#4235541', title: 'A Brief History o..', author: 'by Stephen Hawk..', issued: '2022-11-20', due: '2022-12-04', amount: 40 },
  ]
};

const MemberActivityPanel = () => {
  const [activeTab, setActiveTab] = useState('Returned');

  const renderContent = () => {
    switch (activeTab) {
      case 'Borrowed':
        return mockActivity.borrowed.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.title}>{item.title}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">{item.author}</p>
              <p className="text-[10px] text-[#A0ABC0]">{item.id}</p>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.issued} dueAt={item.due} />
            </div>
            
            <div className="w-[60px] text-right shrink-0">
              <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Status</span>
              <p className="text-[12px] font-bold text-[#F6BE0A] mt-0.5">Borrowed</p>
            </div>
          </div>
        ));
      case 'Returned':
        return mockActivity.returned.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.title}>{item.title}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">{item.author}</p>
              <p className="text-[10px] text-[#A0ABC0]">{item.id}</p>
            </div>

            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.issued} dueAt={item.due} returnedAt={item.date} />
            </div>

            <div className="w-[60px] text-right shrink-0">
              <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Status</span>
              <p className="text-[12px] font-bold text-[#10B981] mt-0.5">Returned</p>
            </div>
          </div>
        ));
      case 'Fines':
        return mockActivity.fines.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200/50 last:border-0">
            <div className="w-[130px] shrink-0">
              <h4 className="font-bold text-[13px] text-[#1C2434] truncate" title={item.title}>{item.title}</h4>
              <p className="text-[11px] text-[#A0ABC0] truncate">{item.author}</p>
              <p className="text-[10px] text-[#A0ABC0]">{item.id}</p>
            </div>

            <div className="flex-1 min-w-[150px]">
              <LoanTimeline issuedAt={item.issued} dueAt={item.due} />
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-[#A0ABC0] uppercase font-bold tracking-wider">Fine</span>
                <p className="text-[12px] font-bold text-[#EF4444] mt-0.5">₹ {item.amount}</p>
              </div>
              <button className="bg-[#FDE68A] hover:bg-[#FCD34D] text-[#92400E] text-[10px] font-extrabold px-3 py-1 rounded-full transition-colors">
                Pay
              </button>
            </div>
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-[#F3F4F6] rounded-[24px] p-6 flex flex-col min-h-[500px]">
      {/* Tabs Container */}
      <div className="bg-white rounded-full p-1.5 flex mb-6 shadow-sm shrink-0">
        {['Borrowed', 'Returned', 'Fines'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-[#1C2434] text-white shadow-md' 
                : 'text-[#64748B] hover:text-[#1C2434] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {renderContent()}
      </div>

      {/* Footer Actions / Pagination */}
      <div className="pt-4 mt-2 flex flex-col items-center gap-3 shrink-0">
        {activeTab === 'Fines' && mockActivity.fines.length > 0 && (
          <button className="bg-[#FCD34D] hover:bg-[#FBBF24] text-[#92400E] text-[12px] font-extrabold px-8 py-2 rounded-full transition-colors shadow-sm">
            Pay All
          </button>
        )}
        
        <div className="bg-[#FDE68A] rounded-full px-4 py-1 flex items-center gap-3">
          <span className="text-[12px] font-bold text-[#92400E]">1-25 of 21</span>
          <div className="flex items-center gap-1">
            <button className="text-[#92400E] hover:text-[#B45309]"><ChevronLeft size={16} /></button>
            <button className="text-[#92400E] hover:text-[#B45309]"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberActivityPanel;
