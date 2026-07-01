import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, GraduationCap, Calendar, Loader } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';
import { membersApi } from '../../services/api';

const FILTER_TAGS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'Civil'];

const Members = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Start with an empty array for members
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await membersApi.getAll();
        
        // Map Django CustomUser data to match what the MemberCard expects
        const formattedMembers = response.data.map(user => ({
          id: user.id,
          name: user.student_name || `${user.first_name} ${user.last_name}`.trim() || 'Unknown',
          enr: user.user_id, // Map the backend user_id to 'enr'
          phone: user.phone_number || 'N/A',
          branch: user.department || 'N/A',
          year: user.batch || 'N/A',
          borrowed: 0, 
          fine: 0,
          img: `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random` 
        }));

        setMembers(formattedMembers);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Remove member action (Note: This still only removes locally. 
  // You would need an API call here later to actually delete from DB)
  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setSelectedMember(null);
  };

  // Filter members based on selected branch and search query
  const filteredMembers = members.filter(member => {
    // Adding optional chaining (?) in case some fields are undefined
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone?.includes(searchQuery);
    
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
      <div className="bg-[#FFFFFF80] rounded-[40px] p-6 md:p-8 shadow-sm border border-white min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-medium h-full">
            <Loader size={40} className="text-[#F6BE0A] mb-4 animate-spin" />
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
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
