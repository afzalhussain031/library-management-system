import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, Plus, GraduationCap, Calendar, Loader } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberCardSkeleton from '../../components/admin/members/MemberCardSkeleton';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';
import AddMemberModal from '../../components/admin/members/AddMemberModal';
import EditMemberDrawer from '../../components/admin/members/EditMemberDrawer';
import ActionConfirmDialog from '../../components/common/ActionConfirmDialog';
import { membersApi } from '../../services/api';
import { useApi } from '../../hook/useApi';
import ErrorMessage from '../../components/common/ErrorMessage';

const FILTER_TAGS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'Civil'];

const Members = () => {
  const [searchParams] = useSearchParams();
  const searchUserId = searchParams.get('search_user');

  const [activeTab, setActiveTab] = useState('Students');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [actionConfirm, setActionConfirm] = useState({
    isOpen: false,
    type: null, // 'clear_fine' | 'suspend'
    member: null
  });
  
  const [activeBatch, setActiveBatch] = useState('All');
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Suspended'
  const [pendingFinesOnly, setPendingFinesOnly] = useState(false);
  
  // 1. Fetch data safely using the custom hook
  const { data: rawMembers, isLoading, error, refetch } = useApi(membersApi.getAll, []);

  // 2. Format the data only when it exists
  const members = (rawMembers || []).map(user => {
    const resolvedName = user.student_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
    return {
      id: user.id,
      name: resolvedName,
      email: user.email,
      enr: user.user_id,
      phone: user.phone_number || 'N/A',
      branch: user.department || 'N/A',
      year: user.batch || 'N/A',
      borrowed: user.currently_borrowed || 0,
      totalBorrowed: user.total_borrowed || 0,
      membershipId: user.membership_id || null,
      validTill: user.membership_valid_till || null,
      fine: user.pending_fines ? parseFloat(user.pending_fines) : 0,
      role: user.role || 'student',
      isActive: user.is_active ?? true
    };
  });

  useEffect(() => {
    if (searchUserId && members.length > 0) {
      const foundMember = members.find(m => m.id.toString() === searchUserId);
      if (foundMember) {
        setSelectedMember(foundMember);
        setIsDetailsExpanded(true);
        if (foundMember.role === 'student') {
          setActiveTab('Students');
        } else {
          setActiveTab('Faculties');
        }
      }
    }
  }, [searchUserId, members.length]); // Wait for members to load

  const totalStudents = members.filter(m => m.role === 'student').length;
  const totalFaculties = members.filter(m => m.role !== 'student').length;

  const availableBatches = ['All', ...new Set(members.map(m => m.year).filter(y => y && y !== 'N/A'))].sort();

  const handleRemoveMember = (id) => {
    setSelectedMember(null);
    setIsDetailsExpanded(false);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
  };

  const handleViewActivity = (member) => {
    setSelectedMember(member);
    setIsDetailsExpanded(true);
  };

  const handleClearFineClick = (member) => {
    setActionConfirm({
      isOpen: true,
      type: 'clear_fine',
      member
    });
  };

  const handleSuspendClick = (member) => {
    setActionConfirm({
      isOpen: true,
      type: 'suspend',
      member
    });
  };

  const handleActionConfirm = (reason) => {
    const { type, member } = actionConfirm;
    if (type === 'clear_fine') {
      console.log(`Cleared fine for ${member.name}`);
      // Add toast notification here
    } else if (type === 'suspend') {
      console.log(`Suspended ${member.name} for reason: ${reason}`);
      // Add toast notification here
    }
    setActionConfirm({ isOpen: false, type: null, member: null });
  };
  
  const handleCloseDetails = () => {
    setSelectedMember(null);
    setIsDetailsExpanded(false);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone?.includes(searchQuery);
    
    const matchesBranch = activeFilter === 'All' || member.branch === activeFilter;
    const matchesBatch = activeBatch === 'All' || member.year === activeBatch;
    const matchesTab = activeTab === 'Students' ? member.role === 'student' : member.role !== 'student';
    
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && member.isActive) ||
                          (statusFilter === 'Suspended' && !member.isActive);
    const matchesFines = pendingFinesOnly ? member.fine > 0 : true;
    
    return matchesSearch && matchesBranch && matchesBatch && matchesTab && matchesStatus && matchesFines;
  });

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen ">
      
      {/* Filter and Stats Dash */}
      <div 
        className="w-full max-w-[1547px] bg-[#FFFFFFB2] rounded-[40px] border-b border-[#F3F4F6] shadow-sm mb-8"
        style={{ minHeight: '121px' }}
      >
        {/* Tabs */}
        <div className="flex px-4 md:px-8 pt-4 border-b border-gray-100">
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
        <div className="px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
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

            {/* Branch Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F6BE0A]"
              >
                {activeFilter === 'All' ? 'Branch' : activeFilter} <ChevronDown size={14} className={`transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isBranchDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsBranchDropdownOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {FILTER_TAGS.map(tag => (
                        <li key={tag}>
                          <button
                            onClick={() => {
                              setActiveFilter(tag);
                              setIsBranchDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              activeFilter === tag ? 'text-[#F6BE0A] font-bold bg-[#F6BE0A]/5' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
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

            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F6BE0A]"
              >
                {statusFilter === 'All' ? 'Status' : statusFilter} <ChevronDown size={14} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {['All', 'Active', 'Suspended'].map(status => (
                        <li key={status}>
                          <button
                            onClick={() => {
                              setStatusFilter(status);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              statusFilter === status ? 'text-[#F6BE0A] font-bold bg-[#F6BE0A]/5' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {status}
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
            <label className="flex items-center cursor-pointer relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={pendingFinesOnly}
                onChange={(e) => setPendingFinesOnly(e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F6BE0A]"></div>
              <span className="ml-2 text-sm font-semibold text-gray-600">Pending Fines Only</span>
            </label>

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
      <div className="bg-[#FFFFFF80] rounded-[40px] p-4 md:p-8 shadow-sm border border-white min-h-[400px]">
        {error ? (
          <ErrorMessage message={error} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <MemberCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          /* Grid of Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => setSelectedMember(member)} 
                onEdit={handleEditMember}
                onViewActivity={handleViewActivity}
                onClearFine={handleClearFineClick}
                onSuspend={handleSuspendClick}
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
          onClose={handleCloseDetails} 
          onRemove={handleRemoveMember} 
          initialExpanded={isDetailsExpanded}
        />
      )}

      <AddMemberModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => refetch()} 
      />

      <EditMemberDrawer
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
      />

      <ActionConfirmDialog
        isOpen={actionConfirm.isOpen}
        onClose={() => setActionConfirm({ isOpen: false, type: null, member: null })}
        onConfirm={handleActionConfirm}
        title={actionConfirm.type === 'clear_fine' ? 'Clear Fine' : 'Suspend Member'}
        description={
          actionConfirm.type === 'clear_fine' 
            ? `Are you sure you want to clear the pending fine of ₹${actionConfirm.member?.fine} for ${actionConfirm.member?.name}?` 
            : `Are you sure you want to suspend the membership of ${actionConfirm.member?.name}? They will not be able to borrow books until unsuspended.`
        }
        confirmText={actionConfirm.type === 'clear_fine' ? 'Clear Fine' : 'Suspend Member'}
        isDestructive={actionConfirm.type === 'suspend'}
        requiresReason={actionConfirm.type === 'suspend'}
      />
    </div>
  );
};

export default Members;
