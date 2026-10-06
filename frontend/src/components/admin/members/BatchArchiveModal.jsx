import React, { useState } from 'react';
import { Archive, AlertTriangle, CheckCircle2, X, BookOpen, AlertCircle, Users } from 'lucide-react';
import { membersApi } from '../../../services/api';
import toast from 'react-hot-toast';

const BatchArchiveModal = ({ isOpen, onClose, batch, onComplete }) => {
  const [reason, setReason] = useState(`Batch ${batch} Graduation`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState(null);

  if (!isOpen) return null;

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      const res = await membersApi.batchArchive(batch, reason);
      setReport(res.data);
      toast.success(res.data.message || `Batch ${batch} processed.`);
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Failed to batch archive:', error);
      toast.error(error.response?.data?.detail || 'Failed to archive batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReport(null);
    setReason(`Batch ${batch} Graduation`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Archive size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1C2434]">Archive Batch {batch}</h2>
              <p className="text-xs text-gray-500 font-medium">Bulk Graduation & No Dues Clearance</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!report ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-sm flex gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Automated Clearance Rule:</p>
                  <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                    Students with <strong>0 unreturned books</strong> and <strong>0 pending fines</strong> will be automatically marked as <strong>Archived</strong> and login access will be closed.
                    Any students who still hold library books or owe unpaid fines will be skipped and listed for clearance.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Archival Reason / Note
                </label>
                <input 
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Batch 2020-2024 Graduation"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Processing Clearance...</>
                  ) : (
                    <>
                      <Archive size={16} /> Proceed with Archival
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results & Defaulters Report */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 size={18} />
                    <span className="text-2xl font-black">{report.archived_count}</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Archived Successfully</p>
                </div>

                <div className={`p-4 rounded-2xl border text-center ${
                  report.defaulters_count > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className={`flex items-center justify-center gap-2 mb-1 ${
                    report.defaulters_count > 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    <AlertCircle size={18} />
                    <span className="text-2xl font-black">{report.defaulters_count}</span>
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${
                    report.defaulters_count > 0 ? 'text-red-800' : 'text-gray-600'
                  }`}>Pending Clearance</p>
                </div>
              </div>

              {report.defaulters_count > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Students Requiring Clearance ({report.defaulters_count}):
                  </h4>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
                    {report.defaulters.map((s) => (
                      <div key={s.id} className="p-3 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{s.name}</p>
                          <p className="text-[11px] text-gray-500">{s.user_id} &bull; {s.department}</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          {s.unreturned_books > 0 && (
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold mr-1">
                              {s.unreturned_books} Book{s.unreturned_books > 1 ? 's' : ''} Due
                            </span>
                          )}
                          {parseFloat(s.pending_fines) > 0 && (
                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                              ₹{s.pending_fines} Fine
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center text-xs font-medium text-emerald-800">
                  🎉 All students in this batch had zero dues and were archived cleanly!
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#1C2434] hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchArchiveModal;
