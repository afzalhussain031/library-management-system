import { Shield, Key, Smartphone } from 'lucide-react';

export default function SecurityTab() {
  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Change Password Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-[18px] h-[18px] text-[#F6CD46]" />
          <h3 className="text-[16px] font-bold text-[#1E2538]">Change Password</h3>
        </div>
        <div className="bg-[#FFFBE5]/40 p-5 rounded-[20px] border border-[#FFF7D4]/60 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#1E2538]">Current Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6CD46]/50 focus:border-[#F6CD46] text-sm text-[#1E2538] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="hidden md:block"></div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#1E2538]">New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6CD46]/50 focus:border-[#F6CD46] text-sm text-[#1E2538] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#1E2538]">Confirm New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6CD46]/50 focus:border-[#F6CD46] text-sm text-[#1E2538] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button className="px-5 py-2.5 bg-[#FCE49F] hover:bg-[#FAD980] text-[#332500] text-[13px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm">
            UPDATE PASSWORD
          </button>
        </div>
      </section>

      {/* Two-Factor Authentication */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-[18px] h-[18px] text-[#FF7A00]" />
          <h3 className="text-[16px] font-bold text-[#1E2538]">Two-Factor Authentication</h3>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 shadow-sm shadow-slate-100/50">
          <div>
            <p className="text-[14px] font-bold text-[#1E2538]">Protect your account with 2FA</p>
            <p className="text-[13px] text-[#7E8B9B] mt-0.5">Adds an extra layer of security when logging in.</p>
          </div>
          <button className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E2538] text-[13px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm">
            ENABLE 2FA
          </button>
        </div>
      </section>

      {/* Active Sessions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-[18px] h-[18px] text-[#F472B6]" />
          <h3 className="text-[16px] font-bold text-[#1E2538]">Active Sessions</h3>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-slate-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 shadow-sm shadow-slate-100/50">
          <div>
            <p className="text-[14px] font-bold text-[#1E2538]">MacBook Pro - Chrome</p>
            <p className="text-[13px] text-[#7E8B9B] mt-0.5">San Francisco, CA • Active Now</p>
          </div>
          <button className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 text-[13px] font-bold rounded-full transition-colors active:scale-[0.98]">
            LOG OUT OTHER DEVICES
          </button>
        </div>
      </section>

    </div>
  );
}
