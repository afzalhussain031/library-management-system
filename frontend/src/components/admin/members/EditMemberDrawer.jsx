import React, { useState, useEffect } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import { membersApi, departmentsApi } from '../../../services/api';
import { DEPARTMENTS, BATCHES } from '../../../config/constants';
import toast from 'react-hot-toast';

const EditMemberDrawer = ({ isOpen, onClose, member, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: '',
    year: ''
  });
  const [departmentOptions, setDepartmentOptions] = useState(DEPARTMENTS);
  const [batchOptions, setBatchOptions] = useState(BATCHES);
  const [customDept, setCustomDept] = useState('');
  const [customDeptError, setCustomDeptError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load departments from API on open
  useEffect(() => {
    if (isOpen) {
      departmentsApi.getAll()
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          if (data.length > 0) {
            const apiDeptNames = data.map(d => d.name).filter(Boolean);
            setDepartmentOptions(prev => Array.from(new Set([...DEPARTMENTS, ...apiDeptNames])));
          }
        })
        .catch(err => {
          console.warn('Failed to fetch departments list:', err);
        });
    }
  }, [isOpen]);

  // Pre-fill form when member changes or drawer opens
  useEffect(() => {
    if (member && isOpen) {
      const rawBranch = member.branch && member.branch !== 'N/A' ? member.branch : '';
      const rawYear = member.year && member.year !== 'N/A' ? member.year : '';

      // Check if member's branch is in known department options
      const isKnownDept = DEPARTMENTS.includes(rawBranch);
      
      if (rawBranch && !isKnownDept) {
        // If not in known list, ensure it's in options so it displays selected
        setDepartmentOptions(prev => Array.from(new Set([...prev.filter(d => d !== 'Other'), rawBranch, 'Other'])));
      }

      // Check if member's year is in known batch options
      if (rawYear && !BATCHES.includes(rawYear)) {
        setBatchOptions(prev => Array.from(new Set([rawYear, ...prev])));
      }

      setFormData({
        name: member.name || '',
        phone: member.phone && member.phone !== 'N/A' ? member.phone : '',
        email: member.email || '',
        branch: rawBranch,
        year: rawYear
      });
      setCustomDept('');
      setCustomDeptError('');
    }
  }, [member, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'branch' && value !== 'Other') {
      setCustomDept('');
      setCustomDeptError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required.');
      return;
    }

    let resolvedDepartment = formData.branch;
    if (formData.branch === 'Other') {
      const trimmed = customDept.trim();
      if (!trimmed) {
        setCustomDeptError('Please specify the department name.');
        return;
      }
      resolvedDepartment = trimmed;
      // Persist the new custom department to database in background
      departmentsApi.create(trimmed).catch(() => {});
    }

    setIsSaving(true);
    try {
      await membersApi.updateMember(member.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        branch: resolvedDepartment,
        year: formData.year.trim()
      });
      toast.success('Member details updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update member:', error);
      const errDetail = error.response?.data?.email?.[0] ||
                        error.response?.data?.detail ||
                        'Failed to update member details.';
      toast.error(errDetail);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
        style={{ animation: 'slide-in-right 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#1C2434]">Edit Member</h2>
            {member && (
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                ID / Roll: <span className="font-bold text-gray-600">{member.enr}</span>
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alice Johnson"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. alice@college.edu"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department Dropdown */}
            <div>
              <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A] appearance-none cursor-pointer pr-10"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  {!departmentOptions.includes('Other') && (
                    <option value="Other">Other (Specify below...)</option>
                  )}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Batch / Year Dropdown */}
            <div>
              <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">
                Batch / Year
              </label>
              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A] appearance-none cursor-pointer pr-10"
                >
                  <option value="">Select Batch</option>
                  {batchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Conditional Input for 'Other' Department */}
          {formData.branch === 'Other' && (
            <div className="animate-fade-in pt-1">
              <label className="block text-[12px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                Specify Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customDept}
                onChange={(e) => {
                  setCustomDept(e.target.value);
                  if (customDeptError) setCustomDeptError('');
                }}
                placeholder="e.g. Biotechnology, Data Science"
                className={`w-full bg-amber-50/40 border rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none transition ${
                  customDeptError
                    ? 'border-red-500 bg-red-50'
                    : 'border-amber-300 focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]'
                }`}
                autoFocus
              />
              {customDeptError && (
                <p className="text-xs text-red-600 mt-1 font-medium">{customDeptError}</p>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 flex items-center justify-end gap-3 bg-gray-50/50">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#1C2434] text-white hover:bg-black transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default EditMemberDrawer;
