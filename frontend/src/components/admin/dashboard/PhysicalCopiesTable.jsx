import React, { useState, useEffect, useRef } from "react";
import { Trash2, Plus, Loader2, Check, X as CloseIcon } from "lucide-react";
import { inventory } from "../../../services/api";
import { toast } from "react-hot-toast";
import { useEntityModal } from "../../../context/EntityModalContext";

const PhysicalCopiesTable = ({ bookId }) => {
  const { showMember } = useEntityModal();
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // State for inline Add Row
  const [newCopy, setNewCopy] = useState({ accession_number: "", shelf_location: "" });
  const [isPulsing, setIsPulsing] = useState(false);
  const accessionInputRef = useRef(null);

  const fetchCopies = async () => {
    setIsLoading(true);
    try {
      const res = await inventory.getCopiesByBook(bookId);
      setCopies(res.data);
    } catch (error) {
      toast.error("Failed to load physical copies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCopies();
  }, [bookId]);

  const handleAddCopy = async () => {
    if (!newCopy.accession_number.trim()) {
      accessionInputRef.current?.focus();
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1500);
      toast("Please enter an Accession Number first to add this copy.", {
        icon: "💡",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await inventory.addBookCopy({
        book: bookId,
        accession_number: newCopy.accession_number,
        shelf_location: newCopy.shelf_location,
      });
      toast.success("Copy added successfully!");
      setNewCopy({ accession_number: "", shelf_location: "" });
      fetchCopies();
    } catch (error) {
      toast.error(error.response?.data?.accession_number?.[0] || "Failed to add copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (copyId, newStatus) => {
    try {
      await inventory.updateCopy(copyId, { status: newStatus });
      toast.success("Status updated!");
      fetchCopies(); // Refresh to ensure data sync
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (copyId) => {
    try {
      await inventory.deleteCopy(copyId);
      toast.success("Copy removed");
      setPendingDeleteId(null);
      fetchCopies();
    } catch (error) {
      toast.error("Failed to delete copy");
    }
  };

  // Helper for status colors
  const getStatusStyle = (status) => {
    switch (status) {
      case "available": return "bg-[#C9F7F5] text-[#1BC5BD]";
      case "loaned": return "bg-blue-50 text-blue-500";
      case "reserved": return "bg-amber-50 text-amber-600";
      case "maintenance": return "bg-gray-100 text-gray-500";
      case "damaged": return "bg-orange-50 text-orange-600";
      case "lost": return "bg-[#FFE2E5] text-[#F64E60]";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderCurrentHolder = (copy) => {
    if (copy.status === "loaned") {
      if (!copy.current_loan) {
        return <span className="text-gray-400 text-[11px] italic">Loan record not found</span>;
      }
      const { borrower_id, borrower_name, borrower_user_id, due_at, is_overdue } = copy.current_loan;
      return (
        <div className="flex flex-col text-[11px] leading-tight">
          {borrower_id ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showMember(borrower_id);
              }}
              className="font-bold text-[#1C2434] hover:text-[#1BC5BD] hover:underline text-left truncate max-w-[170px] cursor-pointer transition-colors"
              title={`View member profile for ${borrower_name || borrower_user_id}`}
            >
              {borrower_name || "Unknown Member"}
            </button>
          ) : (
            <div className="font-bold text-[#1C2434] truncate max-w-[170px]" title={borrower_name || borrower_user_id}>
              {borrower_name || "Unknown Member"}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
            <span className="text-gray-400 font-medium">{borrower_user_id}</span>
            {due_at && (
              <>
                <span className="text-gray-300">•</span>
                {is_overdue ? (
                  <span className="text-rose-600 font-extrabold bg-rose-50 px-1 py-0.5 rounded border border-rose-100" title={`Due: ${formatDate(due_at)}`}>
                    Overdue ({formatDate(due_at)})
                  </span>
                ) : (
                  <span className="text-indigo-600 font-medium" title={`Due: ${formatDate(due_at)}`}>
                    Due {formatDate(due_at)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    if (copy.status === "reserved") {
      if (!copy.current_reservation) {
        return <span className="text-gray-400 text-[11px] italic">Reserved</span>;
      }
      const { user_id, user_name, member_user_id } = copy.current_reservation;
      return (
        <div className="flex flex-col text-[11px] leading-tight">
          {user_id ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showMember(user_id);
              }}
              className="font-bold text-[#1C2434] hover:text-[#1BC5BD] hover:underline text-left truncate max-w-[170px] cursor-pointer transition-colors"
              title={`View member profile for ${user_name || member_user_id}`}
            >
              {user_name || "Unknown Member"}
            </button>
          ) : (
            <div className="font-bold text-[#1C2434] truncate max-w-[170px]" title={user_name || member_user_id}>
              {user_name || "Unknown Member"}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
            <span className="text-gray-400 font-medium">{member_user_id}</span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 rounded border border-amber-100">
              On Hold
            </span>
          </div>
        </div>
      );
    }

    return <span className="text-gray-300 text-[12px] font-bold">—</span>;
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-w-[580px] h-[150px] flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[580px] bg-slate-50/40 rounded-2xl border border-slate-100/60 overflow-hidden shadow-inner flex flex-col justify-between">
      <div>
        {/* Mini Header */}
        <div className="bg-white/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Physical Inventory</h4>
          <span className="text-[11px] font-bold text-slate-400">{copies.length} Copies total</span>
        </div>

        {/* Mini Table */}
        <div className="w-full">
          <div className="flex items-center px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-slate-100/50">
            <div className="w-[110px] shrink-0">Accession No.</div>
            <div className="w-[90px] shrink-0">Shelf</div>
            <div className="w-[110px] shrink-0">Status</div>
            <div className="flex-1 min-w-[190px]">Current Holder</div>
            <div className="w-[50px] shrink-0 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100/50 max-h-[250px] overflow-y-auto custom-scrollbar">
            {copies.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-gray-400 font-medium">
                No physical copies found.
              </div>
            ) : (
              copies.map((copy) => (
                <div key={copy.id} className="flex items-center px-4 py-2.5 hover:bg-white/50 transition-colors">
                  <div className="w-[110px] shrink-0 font-bold text-[12px] text-[#1C2434] truncate" title={copy.accession_number}>
                    {copy.accession_number}
                  </div>
                  <div className="w-[90px] shrink-0 font-medium text-[12px] text-gray-500 truncate" title={copy.shelf_location || ""}>
                    {copy.shelf_location || "—"}
                  </div>
                  
                  <div className="w-[110px] shrink-0">
                    {/* Inline Status Dropdown */}
                    <select 
                      value={copy.status}
                      onChange={(e) => handleStatusChange(copy.id, e.target.value)}
                      disabled={copy.status === "loaned" || copy.status === "reserved"}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md outline-none cursor-pointer border border-transparent hover:border-black/5 transition-all appearance-none ${getStatusStyle(copy.status)} ${
                        (copy.status === "loaned" || copy.status === "reserved") ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="loaned" disabled>Loaned</option>
                      <option value="reserved" disabled>Reserved</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="damaged">Damaged</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[190px] pr-2">
                    {renderCurrentHolder(copy)}
                  </div>

                  <div className="w-[50px] shrink-0 flex justify-end">
                    {/* Defensive Delete UI */}
                    {pendingDeleteId === copy.id ? (
                      <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200 bg-white shadow-sm rounded-full px-1.5 py-1 border border-red-50 relative z-10">
                        <span className="text-[9px] font-extrabold text-[#F64E60] uppercase pl-1">Del?</span>
                        <button 
                          onClick={() => handleDelete(copy.id)}
                          className="p-1 rounded-full bg-[#FFE2E5] text-[#F64E60] hover:bg-[#F64E60] hover:text-white transition-colors"
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => setPendingDeleteId(null)}
                          className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                        >
                          <CloseIcon size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setPendingDeleteId(copy.id)}
                        disabled={copy.status === "loaned" || copy.status === "reserved"}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inline Add Row */}
      <div className="bg-white px-4 py-3 border-t border-slate-100 flex items-center gap-3 mt-auto">
        <input 
          ref={accessionInputRef}
          placeholder="Accession No."
          value={newCopy.accession_number}
          onChange={(e) => {
            if (isPulsing) setIsPulsing(false);
            setNewCopy({ ...newCopy, accession_number: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCopy();
          }}
          className={`w-[120px] text-[11px] font-bold px-3 py-1.5 rounded-lg border outline-none text-[#1C2434] placeholder-gray-300 transition-all duration-300 ${
            isPulsing
              ? "border-amber-500 ring-2 ring-amber-400 bg-amber-50/80 animate-pulse shadow-sm shadow-amber-200"
              : "border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-slate-50"
          }`}
        />
        <input 
          placeholder="Shelf (Opt)"
          value={newCopy.shelf_location}
          onChange={(e) => setNewCopy({ ...newCopy, shelf_location: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCopy();
          }}
          className="w-[120px] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-[#1C2434] placeholder-gray-300 bg-slate-50 transition-all"
        />
        <div className="flex-1 flex justify-end">
          <button 
            type="button"
            onClick={handleAddCopy}
            disabled={isSubmitting}
            className={`flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 active:scale-95 px-3 py-1.5 rounded-lg transition-all shadow-xs ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title="Add Physical Copy"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} strokeWidth={3} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhysicalCopiesTable;
