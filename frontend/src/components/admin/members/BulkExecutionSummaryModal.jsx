import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Trash2, 
  Archive, 
  Ban, 
  CheckCircle, 
  RotateCcw, 
  Users, 
  ShieldAlert,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const ACTION_CONFIG = {
  suspend: {
    label: 'Suspended',
    verb: 'Suspend',
    color: 'rose',
    icon: Ban,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    border: 'border-rose-100',
  },
  activate: {
    label: 'Activated',
    verb: 'Activate',
    color: 'emerald',
    icon: CheckCircle,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  archive: {
    label: 'Archived',
    verb: 'Archive',
    color: 'amber',
    icon: Archive,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    border: 'border-amber-100',
  },
  restore: {
    label: 'Restored',
    verb: 'Restore',
    color: 'blue',
    icon: RotateCcw,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
    border: 'border-blue-100',
  },
  delete: {
    label: 'Deleted',
    verb: 'Delete',
    color: 'red',
    icon: Trash2,
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-600',
    border: 'border-red-100',
  },
};

const BulkExecutionSummaryModal = ({ isOpen, onClose, report, onArchiveSkipped }) => {
  if (!isOpen || !report) return null;

  const actionKey = report.action || 'archive';
  const config = ACTION_CONFIG[actionKey] || ACTION_CONFIG.archive;
  const ActionIcon = config.icon;

  const totalRequested = report.total_requested ?? 0;
  const successCount = report.success_count ?? (report.archived_count || report.deleted_count || 0);
  const skippedCount = report.skipped_count ?? (report.skipped_members?.length || 0);
  const skippedMembers = report.skipped_members || [];

  const hasIneligibleForDelete = actionKey === 'delete' && skippedMembers.some(m => m.suggestArchive);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${config.badgeBg} ${config.badgeText} flex items-center justify-center font-bold shadow-sm`}>
              <ActionIcon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1C2434] tracking-tight">
                Bulk {config.verb} Execution Summary
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Detailed report of requested operations and system guardrails
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Total Processed */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-600 mb-1">
                <Users size={16} />
                <span className="text-2xl font-black">{totalRequested}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Selected
              </p>
            </div>

            {/* Succeeded */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                <CheckCircle2 size={16} />
                <span className="text-2xl font-black">{successCount}</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                {config.label} Successfully
              </p>
            </div>

            {/* Skipped / Protected */}
            <div className={`p-4 rounded-2xl border text-center ${
              skippedCount > 0 ? 'bg-amber-50/80 border-amber-200/80' : 'bg-gray-50/60 border-gray-100'
            }`}>
              <div className={`flex items-center justify-center gap-1.5 mb-1 ${
                skippedCount > 0 ? 'text-amber-600' : 'text-gray-400'
              }`}>
                {skippedCount > 0 ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                <span className="text-2xl font-black">{skippedCount}</span>
              </div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${
                skippedCount > 0 ? 'text-amber-800' : 'text-gray-500'
              }`}>
                Protected / Skipped
              </p>
            </div>
          </div>

          {/* Outcome Status Banner */}
          {skippedCount === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Clean Execution — No Exceptions
                </p>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  All {successCount} selected member accounts were processed successfully with zero policy conflicts or pending dues.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-950">
                  System Guardrail Enforcement ({skippedCount} Skipped)
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {actionKey === 'delete' 
                    ? 'Permanent deletion was blocked for members with circulation history (borrowed books or reservations) to maintain audit compliance.'
                    : 'Archival was bypassed for members who hold unreturned books or owe unpaid library fines.'}
                </p>
              </div>
            </div>
          )}

          {/* Skipped Members Breakdown List */}
          {skippedMembers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">
                  Protected Accounts & Reasons ({skippedMembers.length})
                </h4>
                <span className="text-[11px] text-gray-400 font-medium">
                  Review actions required before re-attempting
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-2xl border border-gray-200 divide-y divide-gray-100 bg-gray-50/50 p-1">
                {skippedMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-3 bg-white rounded-xl mb-1 last:mb-0 shadow-xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {member.user_id ? member.user_id.slice(-2).toUpperCase() : 'MB'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {member.user_id} &bull; {member.department}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-lg text-[11px] font-bold">
                        {member.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
            <div>
              {hasIneligibleForDelete && onArchiveSkipped && (
                <button
                  type="button"
                  onClick={() => {
                    const idsToArchive = skippedMembers.map(m => m.id);
                    onArchiveSkipped(idsToArchive);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Archive size={14} />
                  <span>Archive Skipped Members Instead</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#1C2434] hover:bg-black transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkExecutionSummaryModal;
