import React from 'react';
import { Users, BookOpen, CreditCard, Building } from 'lucide-react';

const OrganisationCard = ({ org, onClick }) => {
  // Graceful colors based on plan
  const planColor = org.plan === 'Pro' 
    ? 'text-indigo-600 bg-indigo-50 border-indigo-100' 
    : org.plan === 'Enterprise'
    ? 'text-purple-600 bg-purple-50 border-purple-100'
    : 'text-slate-600 bg-slate-50 border-slate-100';

  // Graceful colors based on status
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' };
      case 'expiring':
        return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' };
      case 'suspended':
        return { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-100' };
      default:
        return { text: 'text-slate-700', bg: 'bg-slate-50 border-slate-100' };
    }
  };

  const statusStyle = getStatusStyle(org.status || 'Active');

  return (
    <div 
      onClick={onClick}
      className="flex flex-col relative w-full max-w-[280px] h-full rounded-[24px] bg-white border border-gray-100/60 backdrop-blur-[25px] p-5 mx-auto cursor-pointer hover:scale-[1.03] hover:shadow-md transition-all duration-300 group"
      style={{
        boxShadow: '0px 12px 35px 0px rgba(0,0,0,0.04)',
      }}
    >
      {/* Avatar / Logo Row */}
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-amber-50 border-[2px] border-[#DEB853] shadow-sm group-hover:border-[#F6BE0A] transition-all duration-300 overflow-hidden">
          {org.logo ? (
            <img 
              src={org.logo} 
              alt={org.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building className="w-5 h-5 text-[#DEB853]" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-[#1C2434] text-[15px] leading-tight group-hover:text-[#F6BE0A] transition-colors duration-300">{org.name}</h3>
          <p className="text-[#A0ABC0] text-[12px] mt-0.5 font-medium">Org ID: {org.orgId}</p>
        </div>
      </div>

      {/* Details List */}
      <div className="mt-4 space-y-2 flex-grow">
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <Users size={15} className="text-[#64748B]" />
          <span className="text-[12px] font-semibold">Users: <span className="text-[#1E293B]">{org.users?.toLocaleString() || 0}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <BookOpen size={15} className="text-[#64748B]" />
          <span className="text-[12px] font-semibold">Books: <span className="text-[#1E293B]">{org.books || '0'}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <CreditCard size={15} className="text-[#64748B]" />
          <span className="text-[12px] font-semibold">Plan: <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${planColor}`}>{org.plan || 'Free'}</span></span>
        </div>
      </div>

      {/* Badges Bottom Row */}
      <div className="mt-5 flex flex-wrap gap-2">
        <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${statusStyle.bg} ${statusStyle.text} shadow-sm uppercase tracking-wider`}>
          {org.status || 'Active'}
        </div>
        {org.expiryDate && (
          <div className="px-3 py-1 rounded-full text-[10px] font-bold text-[#D97736] bg-[#FFEFE6] border border-[#FFDFCC] shadow-sm">
            {org.expiryDate}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganisationCard;
