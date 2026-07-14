import React, { useState, useEffect } from 'react';
import { X, Book, Settings } from 'lucide-react';
import { inventory } from '../../../services/api';
import Button from '../../common/Button';

const AllocationModal = ({ isOpen, onClose, reservation, onConfirm }) => {
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCopyId, setSelectedCopyId] = useState('auto');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && reservation) {
      setSelectedCopyId('auto');
      const fetchCopies = async () => {
        setIsLoading(true);
        try {
          const res = await inventory.getCopiesByBook(reservation.book_id);
          const copiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          const availableCopies = copiesData.filter(c => c.status?.toLowerCase() === 'available');
          setCopies(availableCopies);
        } catch (error) {
          console.error("Failed to fetch copies", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCopies();
    }
  }, [isOpen, reservation]);

  if (!isOpen || !reservation) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(reservation.id, selectedCopyId === 'auto' ? null : selectedCopyId);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity animate-[fadeIn_0.15s_ease-out]" onClick={onClose} />
      
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[460px] bg-white rounded-[26px] p-6 shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]">
          
          <div className="flex items-start justify-between mb-5 mt-1 shrink-0">
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">Allocate Copy</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1 tracking-wide line-clamp-1">{reservation.book_title}</p>
            </div>
            <button type="button" onClick={onClose} className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer -mt-1 -mr-2">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-[13px] text-slate-600 mb-4">
              Select the specific physical copy you want to hand to <strong className="text-slate-800">{reservation.user_name}</strong>.
            </p>

            <label className="text-[12px] font-bold text-slate-600 mb-2 block tracking-wide">Selection Options</label>
            
            <div className="flex flex-col gap-3 px-1">
              {/* Auto-Assign Card */}
              <div 
                onClick={() => setSelectedCopyId('auto')}
                className={`p-3 border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                  selectedCopyId === 'auto' 
                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400 shadow-sm'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedCopyId === 'auto' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Settings size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Auto-Assign First Available</p>
                  <p className="text-[11px] text-slate-500">Let the system pick automatically</p>
                </div>
              </div>

              {/* Physical Copies */}
              {isLoading ? (
                <p className="text-sm text-slate-500 my-4 text-center">Loading copies...</p>
              ) : copies.length === 0 ? (
                <p className="text-sm text-red-500 my-2 text-center font-medium bg-red-50 p-3 rounded-lg">
                  No available copies found.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {copies.map(copy => {
                    const isSelected = selectedCopyId === copy.id;
                    return (
                      <div 
                        key={copy.id}
                        onClick={() => setSelectedCopyId(copy.id)}
                        className={`p-3 border rounded-xl flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400 shadow-sm'
                            : 'border-slate-200 hover:border-amber-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Copy #{copy.copy_number}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Available
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Book size={12} /> {copy.barcode || 'No barcode'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <Button
              onClick={handleConfirm}
              isLoading={isSubmitting}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              Confirm Allocation
            </Button>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default AllocationModal;
