import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, Plus, GraduationCap, Calendar, Loader, AlertTriangle, Archive, Trash2, CheckSquare, Square, CheckCircle, RotateCcw, Ban, X } from 'lucide-react';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberCardSkeleton from '../../components/admin/members/MemberCardSkeleton';
import MemberDetailsModal from '../../components/admin/members/MemberDetailsModal';
import AddMemberModal from '../../components/admin/members/AddMemberModal';
import EditMemberDrawer from '../../components/admin/members/EditMemberDrawer';
import ActionConfirmDialog from '../../components/common/ActionConfirmDialog';
import BatchArchiveModal from '../../components/admin/members/BatchArchiveModal';
import BulkExecutionSummaryModal from '../../components/admin/members/BulkExecutionSummaryModal';
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
  const [isBatchArchiveOpen, setIsBatchArchiveOpen] = useState(false);
  
  // Multi-selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkExecutionReport, setBulkExecutionReport] = useState(null);
  const [isBulkExecutionModalOpen, setIsBulkExecutionModalOpen] = useState(false);

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [actionConfirm, setActionConfirm] = useState({
    isOpen: false,
    type: null, // 'clear_fine' | 'suspend' | 'archive' | 'delete'
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
      isActive: user.is_active ?? true,
      isArchived: user.is_archived ?? false,
      canHardDelete: user.can_hard_delete ?? false,
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
  const activeCount = currentTabMembers.filter(m => m.isActive && !m.isArchived).length;
  const suspendedCount = currentTabMembers.filter(m => !m.isActive && !m.isArchived).length;
  const archivedCount = currentTabMembers.filter(m => m.isArchived).length;
  const allCount = currentTabMembers.length;

  const suspendedMatches = searchQuery.trim() && statusFilter === 'Active'
    ? currentTabMembers.filter(m => {
        const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.enr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.phone?.includes(searchQuery);
        return matchesSearch && !m.isActive && !m.isArchived;
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

  const handleArchiveClick = (member) => {
    setActionConfirm({
      isOpen: true,
      type: 'archive',
      member
    });
  };

  const handleDeleteClick = (member) => {
    if (!member.canHardDelete) {
      toast.error(
        `Cannot delete ${member.name}: Circulation history exists. Use 'Archive' to preserve library records.`,
        { duration: 4500 }
      );
      return;
    }
    setActionConfirm({
      isOpen: true,
      type: 'delete',
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
    } else if (type === 'archive') {
      try {
        const res = await membersApi.archiveMember(member.id, reason);
        const actionWord = member.isArchived ? 'restored from archive' : 'archived';
        toast.success(res.data?.message || `Member ${actionWord} successfully.`);
        refetch();
      } catch (error) {
        console.error('Failed to archive/restore member:', error);
        toast.error(error.response?.data?.detail || 'Failed to archive member.');
      }
    } else if (type === 'delete') {
      try {
        const res = await membersApi.deleteMember(member.id);
        toast.success(res.data?.message || 'Member deleted permanently.');
        refetch();
      } catch (error) {
        console.error('Failed to delete member:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete member.');
      }
    } else if (type === 'bulk_delete') {
      await handleBulkAction('delete');
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
                          (statusFilter === 'Active' && member.isActive && !member.isArchived) ||
                          (statusFilter === 'Suspended' && !member.isActive && !member.isArchived) ||
                          (statusFilter === 'Archived' && member.isArchived);
    const matchesFines = pendingFinesOnly ? member.fine > 0 : true;
    
    return matchesSearch && matchesBranch && matchesBatch && matchesTab && matchesStatus && matchesFines;
  });

  // Multi-selection Handlers
  const handleToggleSelectMember = (member) => {
    setSelectedMemberIds(prev => 
      prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
    );
  };

  const isAllSelected = filteredMembers.length > 0 && selectedMemberIds.length === filteredMembers.length;
  const isSomeSelected = selectedMemberIds.length > 0 && selectedMemberIds.length < filteredMembers.length;

  const handleSelectAllVisible = () => {
    if (isAllSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedMemberIds([]);
  };

  const handleBulkAction = async (action, customReason = '', overrideIds = null) => {
    const idsToProcess = overrideIds || selectedMemberIds;
    if (idsToProcess.length === 0) return;

    setIsBulkActionLoading(true);
    try {
      const res = await membersApi.bulkAction({
        member_ids: idsToProcess,
        action,
        reason: customReason || `Bulk action: ${action}`
      });
      // Set detailed execution report and display the modal instead of a brief toast
      setBulkExecutionReport(res.data);
      setIsBulkExecutionModalOpen(true);
      setSelectedMemberIds([]);
      refetch();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to perform bulk action.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

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
            onClick={() => { setActiveTab('Students'); setSelectedMemberIds([]); }}
          >
            Students <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Students' ? 'bg-[#F6BE0A] text-white' : 'bg-gray-100 text-gray-500'}`}>{activeTab === 'Students' ? filteredMembers.length : totalStudents}</span>
            {activeTab === 'Students' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F6BE0A] rounded-t-md" />
            )}
          </button>
          <button 
            className={`pb-3 px-4 font-bold text-[15px] flex items-center gap-2 relative ml-6 ${activeTab === 'Faculties' ? 'text-[#F6BE0A]' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('Faculties'); setSelectedMemberIds([]); }}
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

            {/* Bulk Archive Batch Button (When a specific batch is chosen) */}
            {activeTab === 'Students' && activeBatch !== 'All' && (
              <button
                onClick={() => setIsBatchArchiveOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-full text-xs font-bold transition-all shadow-sm"
                title={`Archive all eligible graduating students in Batch ${activeBatch}`}
              >
                <Archive size={13} className="text-amber-600" />
                <span>Archive Batch</span>
              </button>
            )}

            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold transition-all shadow-sm ${
                  statusFilter === 'Active'
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/60'
                    : statusFilter === 'Suspended'
                    ? 'border-red-300 text-red-700 bg-red-50/60 hover:bg-red-100/60'
                    : statusFilter === 'Archived'
                    ? 'border-amber-300 text-amber-800 bg-amber-50/60 hover:bg-amber-100/60'
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-[#F6BE0A]`}
              >
                <span>
                  {statusFilter === 'Active' && `Active (${activeCount})`}
                  {statusFilter === 'Suspended' && `Suspended (${suspendedCount})`}
                  {statusFilter === 'Archived' && `Archived (${archivedCount})`}
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
                        { id: 'Archived', label: 'Archived', count: archivedCount, dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border border-amber-100' },
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

              {/* Select All Toggle Button */}
              {filteredMembers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    isAllSelected
                      ? 'bg-[#F6BE0A] border-[#F6BE0A] text-slate-900 shadow-sm'
                      : selectedMemberIds.length > 0
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isAllSelected ? "Deselect all visible members" : "Select all visible members"}
                >
                  {isAllSelected ? (
                    <CheckSquare size={13} className="text-slate-900" />
                  ) : isSomeSelected ? (
                    <div className="w-3 h-3 rounded-xs bg-amber-500 flex items-center justify-center text-white text-[9px] font-black leading-none">−</div>
                  ) : (
                    <Square size={13} className="text-gray-400" />
                  )}
                  <span>
                    {isAllSelected
                      ? `All (${filteredMembers.length})`
                      : selectedMemberIds.length > 0
                      ? `${selectedMemberIds.length}/${filteredMembers.length}`
                      : `Select All`}
                  </span>
                </button>
              )}

            <button className="flex items-center gap-2 text-sm text-gray-600 font-semibold hover:text-gray-800">
              <Calendar size={16} /> Select date range
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#eef2ff] text-indigo-600 font-bold text-xs rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
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
                onArchive={handleArchiveClick}
                onDelete={handleDeleteClick}
                isSelected={selectedMemberIds.includes(member.id)}
                onToggleSelect={handleToggleSelectMember}
                selectionMode={selectedMemberIds.length > 0}
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
          onRemove={() => {
            const target = selectedMember;
            setSelectedMember(null);
            setIsDetailsExpanded(false);
            handleDeleteClick(target);
          }} 
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
        onSuccess={() => refetch()}
      />

      <ActionConfirmDialog
        isOpen={actionConfirm.isOpen}
        onClose={() => setActionConfirm({ isOpen: false, type: null, member: null })}
        onConfirm={handleActionConfirm}
        title={
          actionConfirm.type === 'bulk_delete'
            ? `Permanently Delete ${selectedMemberIds.length} Members`
            : actionConfirm.type === 'clear_fine' 
            ? 'Clear Fine' 
            : actionConfirm.type === 'delete'
            ? 'Permanently Delete Member'
            : actionConfirm.type === 'archive'
            ? (actionConfirm.member?.isArchived ? 'Restore Member' : 'Archive Member')
            : (actionConfirm.member?.isActive ? 'Suspend Member' : 'Activate Member')
        }
        description={
          actionConfirm.type === 'bulk_delete'
            ? `Are you sure you want to permanently delete these ${selectedMemberIds.length} selected members? Accounts with past or active circulation history cannot be deleted and will be preserved automatically.`
            : actionConfirm.type === 'clear_fine' 
            ? `Are you sure you want to clear the pending fine of ₹${actionConfirm.member?.fine} for ${actionConfirm.member?.name}?` 
            : actionConfirm.type === 'delete'
            ? `Are you sure you want to permanently delete ${actionConfirm.member?.name} (${actionConfirm.member?.enr})? This account has no transaction history and will be completely removed.`
            : actionConfirm.type === 'archive'
            ? (actionConfirm.member?.isArchived
                ? `Restore ${actionConfirm.member?.name} from archive? They will regain active membership.`
                : `Archive ${actionConfirm.member?.name}? This member will be marked as graduated/left and login access will be closed. Their circulation and fine records will be permanently preserved.`)
            : (actionConfirm.member?.isActive 
                ? `Are you sure you want to suspend the membership of ${actionConfirm.member?.name}? They will not be able to borrow books until unsuspended.`
                : `Are you sure you want to activate the membership of ${actionConfirm.member?.name}? They will regain full borrowing privileges.`
              )
        }
        confirmText={
          actionConfirm.type === 'bulk_delete'
            ? 'Delete Selected'
            : actionConfirm.type === 'clear_fine' 
            ? 'Clear Fine' 
            : actionConfirm.type === 'delete'
            ? 'Delete Permanently'
            : actionConfirm.type === 'archive'
            ? (actionConfirm.member?.isArchived ? 'Restore Member' : 'Archive Member')
            : (actionConfirm.member?.isActive ? 'Suspend Member' : 'Activate Member')
        }
        isDestructive={
          actionConfirm.type === 'bulk_delete' ||
          actionConfirm.type === 'delete' ||
          (actionConfirm.type === 'suspend' && actionConfirm.member?.isActive) ||
          (actionConfirm.type === 'archive' && !actionConfirm.member?.isArchived)
        }
        requiresReason={
          (actionConfirm.type === 'suspend' && actionConfirm.member?.isActive) ||
          (actionConfirm.type === 'archive' && !actionConfirm.member?.isArchived)
        }
      />

      <BatchArchiveModal
        isOpen={isBatchArchiveOpen}
        onClose={() => setIsBatchArchiveOpen(false)}
        batch={activeBatch}
        onComplete={refetch}
      />

      <BulkExecutionSummaryModal
        isOpen={isBulkExecutionModalOpen}
        onClose={() => {
          setIsBulkExecutionModalOpen(false);
          setBulkExecutionReport(null);
        }}
        report={bulkExecutionReport}
        onArchiveSkipped={(ids) => handleBulkAction('archive', 'Archived after delete safety check', ids)}
      />

      {/* Floating Bulk Actions Dock */}
      {selectedMemberIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.2s_ease-out]">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-wrap items-center gap-3">
            {/* Counter */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
              <span className="w-6 h-6 rounded-full bg-[#F6BE0A] text-slate-900 text-xs font-black flex items-center justify-center">
                {selectedMemberIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">Selected</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isBulkActionLoading}
                onClick={() => handleBulkAction('suspend')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                title="Suspend selected members"
              >
                <Ban size={13} />
                <span>Suspend</span>
              </button>

              <button
                type="button"
                disabled={isBulkActionLoading}
                onClick={() => handleBulkAction('activate')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                title="Activate selected members"
              >
                <CheckCircle size={13} />
                <span>Activate</span>
              </button>

              <button
                type="button"
                disabled={isBulkActionLoading}
                onClick={() => handleBulkAction('archive', 'Bulk Archival by Admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                title="Archive selected members (with clearance check)"
              >
                <Archive size={13} />
                <span>Archive</span>
              </button>

              {statusFilter === 'Archived' && (
                <button
                  type="button"
                  disabled={isBulkActionLoading}
                  onClick={() => handleBulkAction('restore')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  title="Restore selected members from archive"
                >
                  <RotateCcw size={13} />
                  <span>Restore</span>
                </button>
              )}

              <button
                type="button"
                disabled={isBulkActionLoading}
                onClick={() => setActionConfirm({ isOpen: true, type: 'bulk_delete', member: null })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/40 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                title="Permanently delete selected members (ineligible members with loan history will be preserved)"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>

            {/* Clear Selection */}
            <button
              type="button"
              disabled={isBulkActionLoading}
              onClick={handleDeselectAll}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1 cursor-pointer"
              title="Deselect all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
