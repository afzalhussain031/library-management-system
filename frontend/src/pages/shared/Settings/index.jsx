import { useState } from 'react';
import SecurityTab from './SecurityTab';
import NotificationsTab from './NotificationsTab';
import AppearanceTab from './AppearanceTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('security');

  const tabs = [
    { id: 'security', label: 'Security & Login' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
  ];

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      
      {/* Header Area (On the yellow background, like MyFines) */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Settings</h1>
        <p className="text-[#7E8B9B] text-sm mt-1">
          Manage your account settings and library preferences.
        </p>
      </div>

      {/* Main Content White Box (Like MyFines) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[65vh]">
        
        {/* Top Navigation (Horizontal Tabs) */}
        <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 font-semibold text-[14px] transition-all whitespace-nowrap relative
                  ${
                    isActive
                      ? 'text-[#1E2538] border-b-[3px] border-[#FF8A00]'
                      : 'text-[#7E8B9B] hover:text-[#1E2538] hover:bg-slate-50 border-b-[3px] border-transparent rounded-t-lg'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content (Constrained max width for forms!) */}
        <div className="p-6 md:p-8 max-w-4xl">
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </div>

      </div>
        
    </div>
  );
}
