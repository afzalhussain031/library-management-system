import React from 'react';
import { X } from 'lucide-react';

const MemberDetailsModal = ({ member, onClose, onRemove }) => {
  if (!member) return null;

  // Graceful fallbacks for detailed mock information
  const email = member.email || `${member.name.toLowerCase().replace(/\s+/g, '')}@college.edu`;
  const enrollmentId = member.enrFull || `ENR-2023-${member.enr ? member.enr.replace('ENR-', '') : '0456'}`;
  const totalBorrowed = member.totalBorrowed || (member.borrowed + 12);
  const membershipId = member.membershipId || `LIB-009${member.id ? String(member.id).padStart(3, '0') : '876'}`;
  const validTill = member.validTill || '31 Dec 2026';
  const pendingFine = member.fine || 450;

  // Prevent closing when clicking modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[760px] bg-white rounded-[32px] shadow-2xl border border-white/50 p-8 flex flex-col gap-6 md:gap-8 overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01]"
        onClick={handleContentClick}
        style={{
          boxShadow: '0px 24px 60px -10px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Decorative Top Background blur dot */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top-Right Remove Action & Close button */}
        <button 
          onClick={() => onRemove(member.id)}
          className="absolute top-8 right-8 bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs rounded-full px-6 py-2 transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
        >
          Remove
        </button>

        {/* Dynamic Close X button placed cleanly */}
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 p-1.5 rounded-full hover:bg-slate-100 text-[#A0ABC0] hover:text-[#1C2434] transition-colors md:hidden"
        >
          <X size={20} />
        </button>

        {/* Main Grid: Left Profile, Right Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-6">
          {/* Profile Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center text-center gap-3">
            <div className="relative">
              <img 
                src={member.img || 'https://i.pravatar.cc/150'} 
                alt={member.name}
                className="w-[132px] h-[132px] rounded-full object-cover border-[4px] border-[#DEB853] shadow-sm"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1C2434] tracking-tight mt-1">{member.name}</h2>
              <p className="text-[12px] font-bold text-[#A0ABC0] mt-0.5">Student • {member.branch || 'CSE'} Department</p>
            </div>
            <span 
              className="px-5 py-1.5 rounded-full text-[11px] font-extrabold text-white shadow-sm bg-[#DFBE6B] hover:bg-[#D5B55E] cursor-default select-none mt-1"
            >
              Active Member
            </span>
          </div>

          {/* Account Information Card (7 cols) */}
          <div className="md:col-span-7 bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#1C2434] mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Enrollment ID</p>
                <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{enrollmentId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Email</p>
                <p className="text-[13px] font-extrabold text-[#334155] mt-0.5 truncate" title={email}>{email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Phone</p>
                <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{member.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Year of Study</p>
                <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{member.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Library Information Block (Full width) */}
        <div className="bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-extrabold text-[#1C2434]">Library Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Books Currently Borrowed</p>
              <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{member.borrowed} Books</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Total Borrowed</p>
              <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{totalBorrowed} Books</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Membership ID</p>
              <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{membershipId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Valid Till</p>
              <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{validTill}</p>
            </div>
          </div>

          {/* Bottom Row - Status Badges (no top dividing border, perfectly matching figma mockup) */}
          <div className="flex items-center justify-between mt-1">
            {pendingFine > 0 ? (
              <div className="px-4 py-1.5 bg-[#FFF0E6] text-[#FF5A00] font-extrabold text-[11px] rounded-full shadow-sm border border-[#FF5A00]/10 w-fit">
                ₹{pendingFine} Pending Fine
              </div>
            ) : (
              <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 font-extrabold text-[11px] rounded-full shadow-sm border border-emerald-500/10 w-fit">
                No Pending Fine
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
