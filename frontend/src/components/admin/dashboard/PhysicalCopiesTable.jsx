import React, { useState, useEffect } from "react";
import { Trash2, Plus, Loader2, Check, X as CloseIcon } from "lucide-react";
import { inventory } from "../../../services/api";
import { toast } from "react-hot-toast";

const PhysicalCopiesTable = ({ bookId }) => {
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // State for inline Add Row
  const [newCopy, setNewCopy] = useState({ accession_number: "", shelf_location: "" });

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
      toast.error("Accession number is required");
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

  if (isLoading) {
    return (
      <div className="flex-1 min-w-[500px] h-[150px] flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[500px] bg-slate-50/40 rounded-2xl border border-slate-100/60 overflow-hidden shadow-inner flex flex-col justify-between">
      <div>
        {/* Mini Header */}
        <div className="bg-white/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Physical Inventory</h4>
          <span className="text-[11px] font-bold text-slate-400">{copies.length} Copies total</span>
        </div>

        {/* Mini Table */}
        <div className="w-full">
          <div className="flex items-center px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-slate-100/50">
            <div className="w-[120px]">Accession No.</div>
            <div className="w-[120px]">Shelf</div>
            <div className="w-[140px]">Status</div>
            <div className="flex-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100/50 max-h-[250px] overflow-y-auto custom-scrollbar">
            {copies.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-gray-400 font-medium">
                No physical copies found.
              </div>
            ) : (
              copies.map((copy) => (
                <div key={copy.id} className="flex items-center px-4 py-2.5 hover:bg-white/50 transition-colors">
                  <div className="w-[120px] font-bold text-[12px] text-[#1C2434]">{copy.accession_number}</div>
                  <div className="w-[120px] font-medium text-[12px] text-gray-500">{copy.shelf_location || "-"}</div>
                  
                  <div className="w-[140px]">
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

                  <div className="flex-1 flex justify-end">
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
          placeholder="Accession No."
          value={newCopy.accession_number}
          onChange={(e) => setNewCopy({...newCopy, accession_number: e.target.value})}
          className="w-[120px] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-[#1C2434] placeholder-gray-300 bg-slate-50"
        />
        <input 
          placeholder="Shelf (Opt)"
          value={newCopy.shelf_location}
          onChange={(e) => setNewCopy({...newCopy, shelf_location: e.target.value})}
          className="w-[120px] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-[#1C2434] placeholder-gray-300 bg-slate-50"
        />
        <div className="flex-1 flex justify-end">
          <button 
            onClick={handleAddCopy}
            disabled={isSubmitting || !newCopy.accession_number.trim()}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} strokeWidth={3} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhysicalCopiesTable;
