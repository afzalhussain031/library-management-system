import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Building2, SlidersHorizontal, Users } from 'lucide-react';
import OrganisationCard from '../../components/superadmin/OrganisationCard';
import AddOrganisationModal from '../../components/superadmin/AddOrganisationModal';
import MemberCard from '../admin/../../components/admin/MemberCard';
import MemberDetailsModal from '../admin/../../components/admin/MemberDetailsModal';

const MOCK_MIXED_ITEMS = [
  // Row 1
  { id: 'org-1', type: 'org', name: 'Org 1', orgId: '3241355', users: 2300, books: '45k', plan: 'Pro', status: 'Expiring', expiryDate: 'Dec 2025', logo: '' },
  { id: 'member-2', type: 'member', name: 'Mia Wong', enr: 'ENR-002', phone: '9123456780', branch: 'IT', year: '2nd Year', borrowed: 3, fine: 0, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-3', type: 'member', name: 'Arjun Patel', enr: 'ENR-003', phone: '9988776655', branch: 'ECE', year: '4th Year', borrowed: 8, fine: 200, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-4', type: 'member', name: 'Sophia Lee', enr: 'ENR-004', phone: '9090909090', branch: 'CSE', year: '1st Year', borrowed: 2, fine: 0, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  
  // Row 2
  { id: 'member-5', type: 'member', name: 'Liam Smith', enr: 'ENR-007', phone: '9789789789', branch: 'Civil', year: '4th Year', borrowed: 4, fine: 0, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-6', type: 'member', name: 'Emma Wilson', enr: 'ENR-008', phone: '9676767676', branch: 'IT', year: '3rd Year', borrowed: 9, fine: 350, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-7', type: 'member', name: 'Noah Johnson', enr: 'ENR-009', phone: '9565656565', branch: 'CSE', year: '1st Year', borrowed: 1, fine: 0, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-8', type: 'member', name: 'Ava Martinez', enr: 'ENR-010', phone: '9454545454', branch: 'ECE', year: '2nd Year', borrowed: 6, fine: 150, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
  
  // Row 3
  { id: 'member-9', type: 'member', name: 'James Lewis', enr: 'ENR-013', phone: '9121212121', branch: 'IT', year: '2nd Year', borrowed: 4, fine: 0, img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-10', type: 'member', name: 'Charlotte Hall', enr: 'ENR-014', phone: '9010101010', branch: 'Civil', year: '1st Year', borrowed: 2, fine: 60, img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-11', type: 'member', name: 'Benjamin Allen', enr: 'ENR-015', phone: '9891234567', branch: 'CSE', year: '4th Year', borrowed: 10, fine: 500, img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150' },
  { id: 'member-12', type: 'member', name: 'Isabella Clark', enr: 'ENR-012', phone: '9232323232', branch: 'CSE', year: '3rd Year', borrowed: 5, fine: 90, img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=150' },
  
  // Row 4 (Bottom)
  { id: 'org-13', type: 'org', name: 'Org 1', orgId: '3241355', users: 2300, books: '45k', plan: 'Pro', status: 'Expiring', expiryDate: 'Dec 2025', logo: '' },
  { id: 'org-14', type: 'org', name: 'Org 1', orgId: '3241355', users: 2300, books: '45k', plan: 'Pro', status: 'Expiring', expiryDate: 'Dec 2025', logo: '' },
  { id: 'org-15', type: 'org', name: 'Org 1', orgId: '3241355', users: 2300, books: '45k', plan: 'Pro', status: 'Expiring', expiryDate: 'Dec 2025', logo: '' },
  { id: 'org-16', type: 'org', name: 'Org 1', orgId: '3241355', users: 2300, books: '45k', plan: 'Pro', status: 'Expiring', expiryDate: 'Dec 2025', logo: '' },
];

const SuperOrganisations = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(MOCK_MIXED_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity'); // Popularity, Name
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Add organisation / person handler
  const handleAddItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
  };

  // Remove member action from modal
  const handleRemoveMember = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedMember(null);
  };

  // Convert books string count (e.g. "45k") to raw number for sorting
  const getRawBooksCount = (booksStr) => {
    if (!booksStr) return 0;
    const cleanStr = booksStr.toLowerCase().replace(' ', '');
    if (cleanStr.endsWith('k')) {
      return parseFloat(cleanStr) * 1000;
    }
    return parseFloat(cleanStr) || 0;
  };

  // Filter and sort the mixed items
  const processedItems = items
    .filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = item.type === 'org' 
        ? item.orgId.includes(searchQuery) 
        : item.enr.toLowerCase().includes(searchQuery.toLowerCase());
      
      return nameMatch || idMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      }
      
      // Popularity sorting (Users count for Orgs, Borrowed count for Members)
      const valA = a.type === 'org' ? a.users : (a.borrowed * 100);
      const valB = b.type === 'org' ? b.users : (b.borrowed * 100);
      return valB - valA;
    });

  return (
    <div className="px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen bg-transparent">

      {/* Premium Header Controller */}
      <div 
        className="w-full bg-white rounded-[32px] shadow-sm border border-white/60 p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left Title / Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#F6BE0A]/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#F6BE0A]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C2434] tracking-tight">Organisations</h1>
            <p className="text-xs text-[#A0ABC0] font-semibold mt-0.5">Manage branches & various member personnel</p>
          </div>
        </div>

        {/* Action Elements */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
          {/* Real-time search box */}
          <div className="relative w-full sm:w-60 md:w-72">
            <input 
              type="text" 
              placeholder="Search by name, ID or enrollment..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-100 rounded-full py-2 pl-4 pr-10 text-xs font-semibold outline-none focus:border-[#F6BE0A] focus:bg-white transition-all shadow-inner"
            />
            <Search className="absolute right-3.5 top-2.5 text-gray-400" size={14} />
          </div>

          {/* Sort Menu Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 hover:border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all"
            >
              <SlidersHorizontal size={13} />
              Sort by: <span className="text-indigo-600">{sortBy}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-30 animate-fade-in">
                {['Popularity', 'Name'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                      sortBy === option 
                        ? 'text-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Organisation Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#E0E7FF] hover:bg-[#D2DCFF] text-[#4F46E5] font-extrabold text-xs rounded-full transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} /> ADD ORGANISATIONS
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        className="bg-white/50 backdrop-blur-md rounded-[40px] p-6 md:p-8 shadow-sm border border-white"
        style={{
          boxShadow: '0px 15px 40px 0px rgba(0,0,0,0.01)',
        }}
      >
        {processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {processedItems.map((item) => {
              if (item.type === 'org') {
                return (
                  <OrganisationCard 
                    key={item.id} 
                    org={item} 
                    onClick={() => navigate(`/super/organisations/${item.orgId}`)} 
                  />
                );
              } else {
                return (
                  <MemberCard 
                    key={item.id} 
                    member={item} 
                    onClick={() => setSelectedMember(item)} 
                  />
                );
              }
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-medium">
            <Users size={48} className="text-gray-300 mb-3" />
            <p className="text-sm">No items found matching your search query.</p>
          </div>
        )}

        {/* Pagination Matches Screenshot exactly */}
        {processedItems.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] shadow-sm">
              <span className="text-xs font-extrabold text-[#785E00]">
                1-{processedItems.length} of 21
              </span>
              <div className="flex items-center gap-1">
                <button className="p-0.5 rounded text-[#785E00] hover:bg-white/50 disabled:opacity-30" disabled>
                  &lt;
                </button>
                <button className="p-0.5 rounded text-[#785E00] hover:bg-white/50 disabled:opacity-30" disabled>
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddOrganisationModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddItem} 
        />
      )}

      {/* Detailed Member Modal */}
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

export default SuperOrganisations;
