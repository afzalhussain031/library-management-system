import { Bell, Clock, AlertTriangle, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

// Reusable toggle component
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm ${
        enabled ? 'bg-[#FF7A00]' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationsTab() {
  const [preferences, setPreferences] = useState({
    dueDates: true,
    overdue: true,
    reservations: true,
    news: false,
  });

  const togglePref = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="bg-[#FFFBE5] text-[#332500] p-5 rounded-[20px] flex items-start gap-4 mb-6 border border-[#FFF7D4]/60 shadow-sm shadow-yellow-500/5">
        <Bell className="w-6 h-6 shrink-0 mt-0.5 text-[#F6CD46]" />
        <div>
          <h4 className="font-bold text-[15px] text-[#1E2538]">Library Notifications</h4>
          <p className="text-[13px] mt-1 text-[#7E8B9B]">
            Control how the library system communicates with you via email. We recommend keeping due date alerts on to avoid fines.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Due Dates */}
        <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[20px] shadow-sm shadow-slate-100/50">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-[14px] shrink-0">
              <Clock className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1E2538]">Due Date Reminders</p>
              <p className="text-[13px] text-[#7E8B9B] mt-0.5">Receive an email 2 days before your borrowed items are due.</p>
            </div>
          </div>
          <Toggle enabled={preferences.dueDates} onChange={() => togglePref('dueDates')} />
        </div>

        {/* Overdue Alerts */}
        <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[20px] shadow-sm shadow-slate-100/50">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-50 text-red-500 rounded-[14px] shrink-0">
              <AlertTriangle className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1E2538]">Overdue & Fine Alerts</p>
              <p className="text-[13px] text-[#7E8B9B] mt-0.5">Get notified immediately when a book is late and fines accrue.</p>
            </div>
          </div>
          <Toggle enabled={preferences.overdue} onChange={() => togglePref('overdue')} />
        </div>

        {/* Reservation Updates */}
        <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[20px] shadow-sm shadow-slate-100/50">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-[14px] shrink-0">
              <BookmarkCheck className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1E2538]">Reservation Availability</p>
              <p className="text-[13px] text-[#7E8B9B] mt-0.5">Email me when a book I requested is ready for pickup.</p>
            </div>
          </div>
          <Toggle enabled={preferences.reservations} onChange={() => togglePref('reservations')} />
        </div>
      </div>
      
      <div className="pt-6 flex justify-end">
        <button className="px-6 py-3 bg-[#FCE49F] hover:bg-[#FAD980] text-[#332500] text-[13px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center gap-2 cursor-pointer">
          SAVE PREFERENCES
        </button>
      </div>

    </div>
  );
}
