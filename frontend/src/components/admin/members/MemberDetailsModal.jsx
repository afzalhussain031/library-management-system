import React, { useState, useEffect } from 'react';
import { X, Activity, ChevronLeft, Mail } from 'lucide-react';
import UserAvatar from '../../common/UserAvatar';
import MemberActivityPanel from './MemberActivityPanel';

const MemberDetailsModal = ({ member, onClose, onRemove, initialExpanded = false }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded, member]);

  if (!member) return null;

  // Use real data or honest defaults
  const email = member.email;
  const enrollmentId = member.enrFull || member.enr;
  const totalBorrowed = member.totalBorrowed || 0;
  const membershipId = member.membershipId;
  const validTill = member.validTill;
  const pendingFine = member.fine || 0;

  // Prevent closing when clicking modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Transparent Wrapper */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center w-full max-w-[1300px] h-auto max-h-[95vh]">
        
        {/* Profile Modal - Always maintains its perfect original shape */}
        <div 
          className={`relative w-full max-w-[760px] bg-white rounded-[32px] shadow-2xl border border-white/50 p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar transform transition-all duration-300 ${isExpanded ? 'hidden xl:flex shrink-0' : 'flex'}`}
          onClick={handleContentClick}
          style={{
            boxShadow: '0px 24px 60px -10px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Decorative Top Background blur dot */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Top-Right Remove Action & Close button (Only in Profile view) */}
          {showConfirm ? (
            <div className="absolute top-4 md:top-6 right-4 md:right-8 flex items-center gap-2 bg-white p-2 rounded-full shadow-lg border border-red-100 animate-fade-in z-10">
              <span className="text-xs font-bold text-slate-600 ml-2 mr-1">Are you sure?</span>
              <button 
                onClick={() => onRemove(member.id)}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 shadow-sm cursor-pointer flex items-center gap-1"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-full px-4 py-1.5 transition-all duration-150 active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="absolute top-4 md:top-6 right-4 md:right-8 z-10 flex items-center gap-2">
              <button 
                onClick={() => setShowConfirm(true)}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs rounded-full px-4 md:px-6 py-2 transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
              >
                Remove
              </button>
              <button
                onClick={onClose}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          )}



          {/* Main Grid: Left Profile, Right Account Info (when not expanded, else stacks) */}
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-8`}>
            {/* Profile Column */}
            <div className={`md:col-span-5 flex flex-col items-center text-center gap-3`}>
              <div className="relative">
                <UserAvatar 
                  name={member.name} 
                  size="2xl" 
                  className="border-[4px] border-[#DEB853] shadow-sm"
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

            {/* Account Information Card */}
            <div className={`md:col-span-7 bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm`}>
              <h3 className="text-base font-extrabold text-[#1C2434] mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Enrollment ID</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">
                    {enrollmentId ? enrollmentId : <span className="text-gray-400 italic font-medium">Not Set</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Email</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[13px] font-extrabold text-[#334155] truncate max-w-[150px]" title={email}>
                      {email ? email : <span className="text-gray-400 italic font-medium">Not Available</span>}
                    </p>
                    {email && email !== 'N/A' && (
                      <a 
                        href={`mailto:${email}`}
                        title={`Email ${member.name}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 hover:scale-110 transition-all shadow-sm shrink-0"
                      >
                        <Mail size={12} />
                      </a>
                    )}
                  </div>
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

          {/* Library Information Block */}
          <div className="bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm flex flex-col gap-4 mt-auto">
            <h3 className="text-base font-extrabold text-[#1C2434]">Library Information</h3>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6`}>
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
                <p className="text-[15px] font-black text-[#1C2434] mt-0.5">
                  {membershipId ? membershipId : <span className="text-gray-400 italic text-[13px] font-medium">Not Assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Valid Till</p>
                <p className="text-[15px] font-black text-[#1C2434] mt-0.5">
                  {validTill ? validTill : <span className="text-gray-400 italic text-[13px] font-medium">Not Set</span>}
                </p>
              </div>
            </div>

            {/* Bottom Row - Status Badges & Actions */}
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
              
              {!isExpanded && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="px-4 py-1.5 bg-[#F6BE0A]/10 hover:bg-[#F6BE0A]/20 text-[#D97706] font-extrabold text-[11px] uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <Activity size={14} /> View Activity
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side-Car Activity Panel */}
        {isExpanded && (
          <div 
            className="w-full flex-1 max-w-[550px] animate-fade-in-right relative flex flex-col overflow-hidden bg-white/0"
            onClick={handleContentClick}
          >
            {/* Mobile Back Button and Close button */}
            <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 rounded-t-3xl shadow-sm z-10 relative mb-[-20px] pb-8">
               <button 
                 onClick={() => setIsExpanded(false)} 
                 className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-[13px]"
               >
                 <ChevronLeft size={16} /> Back to Profile
               </button>

            </div>
            
            <MemberActivityPanel />
            

          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MemberDetailsModal;
