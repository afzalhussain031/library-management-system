import React from 'react';

const MemberCard = ({ member, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col relative w-full max-w-[280px] h-full rounded-[18px] bg-white border border-gray-100/50 backdrop-blur-[25px] p-5 mx-auto cursor-pointer hover:scale-[1.03] hover:shadow-md transition-all duration-300 group"
      style={{
        boxShadow: '0px 12px 35px 0px #0000000C',
      }}
    >
      {/* Avatar Row */}
      <div className="flex items-center gap-3">
        <img 
          src={member.img || 'https://i.pravatar.cc/150'} 
          alt={member.name}
          className="w-[42px] h-[42px] rounded-full object-cover border-[2px] border-[#DEB853] shadow-sm group-hover:border-[#F6BE0A] transition-all duration-300"
        />
        <div>
          <h3 className="font-bold text-[#1C2434] text-[15px] leading-tight group-hover:text-[#F6BE0A] transition-colors duration-300">{member.name}</h3>
          <p className="text-[#A0ABC0] text-[12px] mt-0.5 font-medium">{member.enr}</p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3.5 space-y-1.5 flex-grow">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B]">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span className="text-[12px] text-[#334155] font-semibold">{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] leading-none">🏫</span>
          <span className="text-[12px] text-[#334155] font-semibold">{member.branch}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] leading-none">🎓</span>
          <span className="text-[12px] text-[#334155] font-semibold">{member.year}</span>
        </div>
      </div>

      {/* Tags Bottom */}
      <div className="mt-4 flex flex-col gap-2">
        <div 
          className="w-fit h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
          style={{
            background: 'var(--color-orange-65, #E0C36E)',
            padding: '0 10px',
          }}
        >
          <div className="flex gap-[1.5px] mr-1.5 items-end h-[10px]">
            <div className="w-[2.5px] h-full bg-[#4FC9E0] rounded-[1px]" />
            <div className="w-[2.5px] h-[80%] bg-[#F06A6A] rounded-[1px]" />
            <div className="w-[2.5px] h-[60%] bg-[#5D5D5D] rounded-[1px]" />
          </div>
          {member.borrowed} Borrowed
        </div>
        {member.fine > 0 ? (
          <div 
            className="w-fit h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-[#D97736]"
            style={{
              background: '#FCE1D4',
              padding: '0 10px',
            }}
          >
            ₹{member.fine} Pending Fine
          </div>
        ) : (
          <div 
            className="w-fit h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-[#2ecc71]"
            style={{
              background: 'var(--color-spring-green-4915, #2ECC7126)',
              padding: '0 10px',
            }}
          >
            No Pending Fine
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
