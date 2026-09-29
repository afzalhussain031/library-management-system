import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, Plus, GraduationCap, Calendar, Loader, AlertTriangle } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberCardSkeleton from '../../components/admin/members/MemberCardSkeleton';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';
import AddMemberModal from '../../components/admin/members/AddMemberModal';
import EditMemberDrawer from '../../components/admin/members/EditMemberDrawer';
import ActionConfirmDialog from '../../components/common/ActionConfirmDialog';
import { membersApi } from '../../services/api';
import { useApi } from '../../hook/useApi';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const FILTER_TAGS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'Civil', 'Electrical', 'Other'];

const BRANCH_MAP = {
  'CSE': ['CSE', 'Computer Science'],
  'IT': ['IT', 'Information Technology'],
  'ECE': ['ECE', 'Electronics', 'Electronics & Communication'],
  'ME': ['ME', 'Mechanical', 'Mechanical Engineering'],
  'Civil': ['Civil', 'Civil Engineering'],
  'Electrical': ['Electrical', 'EE', 'Electrical Engineering'],
  'Other': ['Other'],
};

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
  const [statusFilter, setStatusFilter] = useState('Active'); // Defaults to 'Active'
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

  const currentTabMembers = members.filter(m => activeTab === 'Students' ? m.role === 'student' : m.role !== 'student');
  const activeCount = currentTabMembers.filter(m => m.isActive).length;
  const suspendedCount = currentTabMembers.filter(m => !m.isActive).length;
  const allCount = currentTabMembers.length;

  const suspendedMatches = searchQuery.trim() && statusFilter === 'Active'
    ? currentTabMembers.filter(m => {
        const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.phone?.includes(searchQuery);
        return matchesSearch && !m.isActive;
      })
    : [];

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

  const handleActionConfirm = async (reason) => {
    const { type, member } = actionConfirm;
    setActionConfirm({ isOpen: false, type: null, member: null });

    if (type === 'clear_fine') {
      console.log(`Cleared fine for ${member.name}`);
      toast.success(`Fine cleared for ${member.name}`);
    } else if (type === 'suspend') {
      try {
        const res = await membersApi.toggleStatus(member.id, reason);
        const actionWord = member.isActive ? 'suspended' : 'activated';
        toast.success(res.data?.message || `Member ${actionWord} successfully.`);
        refetch();
      } catch (error) {
        console.error('Failed to toggle member status:', error);
        toast.error(error.response?.data?.detail || 'Failed to update member status.');
      }
    }
  };
  
  const handleCloseDetails = () => {
    setSelectedMember(null);
    setIsDetailsExpanded(false);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone?.includes(searchQuery);
    
    const matchesBranch = activeFilter === 'All' || 
                          member.branch === activeFilter ||
                          (BRANCH_MAP[activeFilter] && BRANCH_MAP[activeFilter].includes(member.branch));
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
                placeholder="Search by name, Roll No. or phone..." 
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
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold transition-all shadow-sm ${
                  statusFilter === 'Active'
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/60'
                    : statusFilter === 'Suspended'
                    ? 'border-red-300 text-red-700 bg-red-50/60 hover:bg-red-100/60'
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-[#F6BE0A]`}
              >
                <span>
                  {statusFilter === 'Active' && `Active (${activeCount})`}
                  {statusFilter === 'Suspended' && `Suspended (${suspendedCount})`}
                  {statusFilter === 'All' && `All (${allCount})`}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
                    <ul>
                      {[
                        { id: 'Active', label: 'Active', count: activeCount, dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
                        { id: 'Suspended', label: 'Suspended', count: suspendedCount, dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border border-red-100' },
                        { id: 'All', label: 'All Members', count: allCount, dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700' },
                      ].map(({ id, label, count, dot, badge }) => (
                        <li key={id}>
                          <button
                            onClick={() => {
                              setStatusFilter(id);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                              statusFilter === id ? 'text-[#1C2434] font-bold bg-[#F6BE0A]/10' : 'text-gray-700 font-medium hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${dot}`} />
                              {label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                              {count}
                            </span>
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {suspendedMatches.length > 0 ? (
              <div className="flex flex-col items-center max-w-sm">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                  <AlertTriangle size={24} className="text-amber-500" />
                </div>
                <p className="text-gray-800 font-bold text-sm">No active members found for "{searchQuery}"</p>
                <p className="text-gray-500 text-xs mt-1">
                  Found <span className="text-red-600 font-bold">{suspendedMatches.length} suspended member{suspendedMatches.length > 1 ? 's' : ''}</span> matching this search.
                </p>
                <button
                  onClick={() => setStatusFilter('Suspended')}
                  className="mt-3.5 px-4 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  View in Suspended ({suspendedMatches.length})
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500 font-medium">
                <GraduationCap size={48} className="text-gray-300 mb-2" />
                <p>No {statusFilter.toLowerCase()} members found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="mt-2 text-xs text-[#F6BE0A] hover:underline font-semibold"
                  >
                    View all {activeTab.toLowerCase()}
                  </button>
                )}
              </div>
            )}
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
        title={
          actionConfirm.type === 'clear_fine' 
            ? 'Clear Fine' 
            : (actionConfirm.member?.isActive ? 'Suspend Member' : 'Activate Member')
        }
        description={
          actionConfirm.type === 'clear_fine' 
            ? `Are you sure you want to clear the pending fine of ₹${actionConfirm.member?.fine} for ${actionConfirm.member?.name}?` 
            : (actionConfirm.member?.isActive 
                ? `Are you sure you want to suspend the membership of ${actionConfirm.member?.name}? They will not be able to borrow books until unsuspended.`
                : `Are you sure you want to activate the membership of ${actionConfirm.member?.name}? They will regain full borrowing privileges.`
              )
        }
        confirmText={
          actionConfirm.type === 'clear_fine' 
            ? 'Clear Fine' 
            : (actionConfirm.member?.isActive ? 'Suspend Member' : 'Activate Member')
        }
        isDestructive={actionConfirm.type === 'suspend' && actionConfirm.member?.isActive}
        requiresReason={actionConfirm.type === 'suspend' && actionConfirm.member?.isActive}
      />
    </div>
  );
};

export default Members;
