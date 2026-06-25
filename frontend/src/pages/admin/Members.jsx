import React, { useState } from 'react';
import { Search, ChevronDown, Plus, GraduationCap, Calendar } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';

const MOCK_MEMBERS = [
  { id: 1, name: 'John Stone', enr: 'ENR-001', phone: '9876543210', branch: 'CSE', year: '3rd Year', borrowed: 6, fine: 450, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
  { id: 2, name: 'Mia Wong', enr: 'ENR-002', phone: '9123456780', branch: 'IT', year: '2nd Year', borrowed: 3, fine: 0, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 3, name: 'Arjun Patel', enr: 'ENR-003', phone: '9988776655', branch: 'ECE', year: '4th Year', borrowed: 8, fine: 200, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 4, name: 'Sophia Lee', enr: 'ENR-004', phone: '9090909090', branch: 'CSE', year: '1st Year', borrowed: 2, fine: 0, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { id: 5, name: 'David Kim', enr: 'ENR-005', phone: '9191919191', branch: 'ME', year: '3rd Year', borrowed: 5, fine: 0, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: 6, name: 'Liam Smith', enr: 'ENR-007', phone: '9789789789', branch: 'Civil', year: '4th Year', borrowed: 4, fine: 0, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
  { id: 7, name: 'Emma Wilson', enr: 'ENR-008', phone: '9676767676', branch: 'IT', year: '3rd Year', borrowed: 9, fine: 350, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 8, name: 'Noah Johnson', enr: 'ENR-009', phone: '9565656565', branch: 'CSE', year: '1st Year', borrowed: 1, fine: 0, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
  { id: 9, name: 'Ava Martinez', enr: 'ENR-010', phone: '9454545454', branch: 'ECE', year: '2nd Year', borrowed: 6, fine: 150, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
  { id: 10, name: 'William Davis', enr: 'ENR-011', phone: '9343434343', branch: 'ME', year: '4th Year', borrowed: 3, fine: 0, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150' },
  { id: 11, name: 'James Lewis', enr: 'ENR-013', phone: '9121212121', branch: 'IT', year: '1st Year', borrowed: 2, fine: 0, img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150' },
  { id: 12, name: 'Charlotte Hall', enr: 'ENR-014', phone: '9010101010', branch: 'Civil', year: '3rd Year', borrowed: 7, fine: 0, img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150' },
  { id: 13, name: 'Benjamin Allen', enr: 'ENR-015', phone: '9891234567', branch: 'CSE', year: '2nd Year', borrowed: 5, fine: 50, img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150' },
  { id: 14, name: 'Isabella Clark', enr: 'ENR-012', phone: '9232323232', branch: 'CSE', year: '4th Year', borrowed: 1, fine: 0, img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=150' },
  { id: 15, name: 'Olivia Brown', enr: 'ENR-006', phone: '9898989898', branch: 'CSE', year: '1st Year', borrowed: 0, fine: 0, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
];

const FILTER_TAGS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'Civil'];

const Members = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [selectedMember, setSelectedMember] = useState(null);

  // Remove member action
  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setSelectedMember(null);
  };

  // Filter members based on selected branch and search query
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.enr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone.includes(searchQuery);
    
    const matchesBranch = activeFilter === 'All' || member.branch === activeFilter;
    
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen ">
      
      {/* Filter and Stats Dash */}
      <div 
        className="w-full max-w-[1547px] bg-[#FFFFFFB2] rounded-[40px] border-b border-[#F3F4F6] shadow-sm overflow-hidden mb-8"
        style={{ minHeight: '121px' }}
      >
        {/* Tabs */}
        <div className="flex px-8 pt-4 border-b border-gray-100">
          <button 
            className={`pb-3 px-2 font-bold text-[15px] flex items-center gap-2 relative ${activeTab === 'Students' ? 'text-[#F6BE0A]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Students')}
          >
            Students <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Students' ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'}`}>{activeTab === 'Students' ? filteredMembers.length : 545}</span>
            {activeTab === 'Students' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F6BE0A] rounded-t-md" />
            )}
          </button>
          <button 
            className={`pb-3 px-4 font-bold text-[15px] flex items-center gap-2 relative ml-6 ${activeTab === 'Faculties' ? 'text-[#F6BE0A]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Faculties')}
          >
            Faculties <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Faculties' ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'}`}>86</span>
            {activeTab === 'Faculties' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F6BE0A] rounded-t-md" />
            )}
          </button>
        </div>

        {/* Filters Row */}
        <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search within filters */}
            <div className="relative w-48 lg:w-64">
              <input 
                type="text" 
                placeholder="Search by name, ID or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-1.5 pl-4 pr-8 text-sm outline-none focus:border-[#F6BE0A] shadow-sm"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>

            {/* Filter Tags */}
            <div className="flex items-center gap-2">
              {FILTER_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${
                    activeFilter === tag 
                      ? 'bg-[#1e293b] text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Year Dropdown */}
            <button className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Year <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-gray-600 font-semibold hover:text-gray-800">
              <Calendar size={16} /> Select date range
            </button>
            <button className="flex items-center gap-1 px-4 py-1.5 bg-[#eef2ff] text-indigo-600 font-bold text-xs rounded-full hover:bg-indigo-100 transition-colors">
              <Plus size={14} /> ADD MEMBER
            </button>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="bg-[#FFFFFF80] rounded-[40px] p-6 md:p-8 shadow-sm border border-white">
        {filteredMembers.length > 0 ? (
          /* Grid of Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => setSelectedMember(member)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 font-medium">
            <GraduationCap size={48} className="text-gray-300 mb-2" />
            <p>No members found matching your search.</p>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedMember && (
        <MemberDetailsModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          onRemove={handleRemoveMember} 
        />
      )}
    </div>
  );
};

export default Members;
