import React, { useState } from 'react';
import { X, Building } from 'lucide-react';

const AddOrganisationModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState('');
  const [books, setBooks] = useState('');
  const [plan, setPlan] = useState('Pro');
  const [status, setStatus] = useState('Active');
  const [expiryMonth, setExpiryMonth] = useState('Dec');
  const [expiryYear, setExpiryYear] = useState('2026');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate random 7-digit Org ID
    const orgId = Math.floor(1000000 + Math.random() * 9000000);

    const newOrg = {
      id: Date.now(),
      name,
      orgId: String(orgId),
      users: Number(users) || 0,
      books: books ? (books.toLowerCase().endsWith('k') ? books : `${Number(books) >= 1000 ? (Number(books)/1000).toFixed(0) + 'k' : books}`) : '0',
      plan,
      status,
      expiryDate: `${expiryMonth} ${expiryYear}`,
      logo: ''
    };

    onAdd(newOrg);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl border border-white/50 p-8 flex flex-col gap-6 overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0px 24px 60px -10px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1C2434]">Add Organisation</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#A0ABC0] hover:text-[#1C2434] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Organisation Name</label>
            <input 
              type="text" 
              placeholder="e.g. Indemy Institute" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-semibold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Total Users</label>
              <input 
                type="number" 
                placeholder="e.g. 1500" 
                value={users}
                onChange={(e) => setUsers(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-semibold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Books Count</label>
              <input 
                type="text" 
                placeholder="e.g. 45k or 2500" 
                value={books}
                onChange={(e) => setBooks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-semibold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Subscription Plan</label>
              <select 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Initial Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">Subscription Expiry</label>
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#1C2434] outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
              >
                {['2026', '2027', '2028', '2029', '2030'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-[#475569] font-bold text-xs rounded-full transition-all shadow-sm active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full transition-all shadow-sm hover:shadow active:scale-95 animate-pulse"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganisationModal;
