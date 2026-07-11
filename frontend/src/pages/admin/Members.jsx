import React, { useState } from 'react';
import { Search, ChevronDown, Plus, GraduationCap, Calendar, Loader } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';
import AddMemberModal from '../../components/admin/members/AddMemberModal';
import { membersApi } from '../../services/api';
import { useApi } from '../../hook/useApi';
import ErrorMessage from '../../components/common/ErrorMessage';

const FILTER_TAGS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'Civil'];

const Members = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [activeBatch, setActiveBatch] = useState('All');
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  
  // 1. Fetch data safely using the custom hook
  const { data: rawMembers, isLoading, error, refetch } = useApi(membersApi.getAll, []);

  // 2. Format the data only when it exists
  const members = (rawMembers || []).map(user => {
    const resolvedName = user.student_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
    return {
      id: user.id,
      name: resolvedName,
      enr: user.user_id,
      phone: user.phone_number || 'N/A',
      branch: user.department || 'N/A',
      year: user.batch || 'N/A',
      borrowed: 0, 
      fine: 0,
      role: user.role || 'student'
    };
  });

  const totalStudents = members.filter(m => m.role === 'student').length;
  const totalFaculties = members.filter(m => m.role !== 'student').length;

  const availableBatches = ['All', ...new Set(members.map(m => m.year).filter(y => y && y !== 'N/A'))].sort();

  const handleRemoveMember = (id) => {
    // Note: If you implement deletion, you'll need a mechanism to update the hook data
    // or trigger a refetch. For now, it just closes the modal locally since we removed
    // the local setMembers array.
    setSelectedMember(null);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone?.includes(searchQuery);
    
    const matchesBranch = activeFilter === 'All' || member.branch === activeFilter;
    const matchesBatch = activeBatch === 'All' || member.year === activeBatch;
    const matchesTab = activeTab === 'Students' ? member.role === 'student' : member.role !== 'student';
    
    return matchesSearch && matchesBranch && matchesBatch && matchesTab;
  });

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen ">
      
      {/* Filter and Stats Dash */}
      <div 
        className="w-full max-w-[1547px] bg-[#FFFFFFB2] rounded-[40px] border-b border-[#F3F4F6] shadow-sm mb-8"
        style={{ minHeight: '121px' }}
      >
        {/* Tabs */}
        <div className="flex px-8 pt-4 border-b border-gray-100">
          <button 
            className={`pb-3 px-2 font-bold text-[15px] flex items-center gap-2 relative ${activeTab === 'Students' ? 'text-[#F6BE0A]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Students')}
          >
            Students <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Students' ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'}`}>{activeTab === 'Students' ? filteredMembers.length : totalStudents}</span>
            {activeTab === 'Students' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F6BE0A] rounded-t-md" />
            )}
          </button>
          <button 
            className={`pb-3 px-4 font-bold text-[15px] flex items-center gap-2 relative ml-6 ${activeTab === 'Faculties' ? 'text-[#F6BE0A]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Faculties')}
          >
            Faculties <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Faculties' ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'}`}>{activeTab === 'Faculties' ? filteredMembers.length : totalFaculties}</span>
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

            {/* Batch Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F6BE0A]"
              >
                {activeBatch === 'All' ? 'Batch' : activeBatch} <ChevronDown size={14} className={`transition-transform ${isBatchDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isBatchDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsBatchDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {availableBatches.map(batch => (
                        <li key={batch}>
                          <button
                            onClick={() => {
                              setActiveBatch(batch);
                              setIsBatchDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              activeBatch === batch ? 'text-[#F6BE0A] font-bold bg-[#F6BE0A]/5' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {batch}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-gray-600 font-semibold hover:text-gray-800">
              <Calendar size={16} /> Select date range
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#eef2ff] text-indigo-600 font-bold text-xs rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Plus size={14} /> ADD MEMBER
            </button>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="bg-[#FFFFFF80] rounded-[40px] p-6 md:p-8 shadow-sm border border-white min-h-[400px]">
        {error ? (
          <ErrorMessage message={error} />
        ) : isLoading ? (
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

      <AddMemberModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => refetch()} 
      />
    </div>
  );
};

export default Members;
