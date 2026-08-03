import React, { useMemo } from 'react';
import { membersApi } from '../../../services/api';
import { useApi } from '../../../hook/useApi';
import MemberDetailsModal from './MemberDetailsModal';
import { Loader2 } from 'lucide-react';

const MemberDetailsModalWrapper = ({ memberId, onClose }) => {
  const { data: rawMembers, isLoading, error } = useApi(membersApi.getAll, []);

  const member = useMemo(() => {
    if (!rawMembers || !memberId) return null;
    const user = rawMembers.find(m => m.id === memberId);
    if (!user) return null;
    
    // Use the same formatting logic as Members.jsx
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
  }, [rawMembers, memberId]);

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  if (error || (!isLoading && !member)) {
    // If not found, just close or render null
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div className="bg-white p-6 rounded-xl shadow-lg" onClick={(e) => e.stopPropagation()}>
          <p className="text-gray-600 font-medium">Member not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 w-full">Close</button>
        </div>
      </div>
    );
  }

  return (
    <MemberDetailsModal 
      member={member}
      onClose={onClose}
      onRemove={() => {}} 
      initialExpanded={false}
    />
  );
};

export default MemberDetailsModalWrapper;
