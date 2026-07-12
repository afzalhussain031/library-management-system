import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditMemberDrawer = ({ isOpen, onClose, member }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: '',
    year: ''
  });

  // Pre-fill form when member changes or drawer opens
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        phone: member.phone || '',
        email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '')}@college.edu`, // Mock email
        branch: member.branch || '',
        year: member.year || ''
      });
    }
  }, [member, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Updated Member Data:', formData);
    // You could show a toast here
    onClose();
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
          <h2 className="text-xl font-extrabold text-[#1C2434]">Edit Member</h2>
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
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">Phone Number</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">Department</label>
              <input 
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#A0ABC0] uppercase tracking-wider mb-2">Batch/Year</label>
              <input 
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#F6BE0A] focus:ring-1 focus:ring-[#F6BE0A]"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 flex items-center justify-end gap-3 bg-gray-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#1C2434] text-white hover:bg-black transition-colors shadow-sm"
          >
            Save Changes
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
