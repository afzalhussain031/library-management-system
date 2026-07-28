import React, { useState, useEffect } from "react";
import { Heart, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { catalog, circulation } from "../../../services/api";
import { toast } from "react-hot-toast";
const BookCard = ({ book, idx, initialWishlistId, onWishlistToggle, onReservationUpdate }) => {
  const [wishlistId, setWishlistId] = useState(initialWishlistId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setWishlistId(initialWishlistId);
  }, [initialWishlistId]);

  const liked = !!wishlistId;

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (liked) {
        await catalog.removeFromWishlist(wishlistId);
        setWishlistId(null);
        toast.success("Removed from wishlist");
      } else {
        const response = await catalog.addToWishlist({ book_id: book.id });
        setWishlistId(response.id || response.data?.id);
        toast.success("Added to wishlist");
      }
      if (onWishlistToggle) {
        onWishlistToggle();
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelHold = async (e) => {
    e.stopPropagation();
    if (isUpdating || book.user_interaction?.type !== 'reserved') return;
    setIsUpdating(true);
    try {
      await circulation.updateReservationStatus(book.user_interaction.id, 'cancelled');
      toast.success("Hold cancelled successfully");
      if (onReservationUpdate) {
        onReservationUpdate();
      }
    } catch (error) {
      console.error("Failed to cancel hold:", error);
      toast.error(error.response?.data?.message || "Failed to cancel hold");
    } finally {
      setIsUpdating(false);
    }
  };



  const renderActionButton = () => {
    if (book.user_interaction?.type === 'reading') {
      return (
        <button 
           className="px-4 py-1.5 bg-gray-100 text-gray-500 font-bold text-[12px] rounded-full cursor-not-allowed"
           onClick={(e) => { e.stopPropagation(); }}
           disabled
        >
           Currently Reading
        </button>
      );
    }

    if (book.user_interaction?.type === 'reserved') {
      return (
        <button 
           className="px-4 py-1.5 bg-[#FFF4F4] text-[#F64E60] border border-[#F64E60]/20 font-bold text-[12px] rounded-full hover:bg-[#FFE2E5] transition-colors"
           onClick={handleCancelHold}
           disabled={isUpdating}
        >
           Cancel Hold
        </button>
      );
    }

    if (book.available_copies > 0) {
      return (
        <button 
           className="px-4 py-1.5 bg-[#EAF2FF] text-[#4386F5] font-bold text-[12px] rounded-full hover:bg-blue-100 transition-colors"
           onClick={(e) => { e.stopPropagation(); /* Optional: handle reserve */ }}
        >
           Reserve
        </button>
      );
    }

    return (
      <button 
         className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 font-bold text-[12px] rounded-full hover:bg-gray-50 transition-colors"
         onClick={(e) => { e.stopPropagation(); /* Optional: handle waitlist */ }}
      >
         Join Waitlist
      </button>
    );
  };

  const statusPill = () => {
    if ((book.total_copies || 0) === 0) {
      return (
        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-gray-100 text-gray-500">
          No Copies
        </span>
      );
    } else if (book.available_copies > 0) {
      return (
        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-[#C9F7F5] text-[#1BC5BD]">
          {book.available_copies} / {book.total_copies} Available
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-[#FFE2E5] text-[#F64E60]">
          0 / {book.total_copies} Available
        </span>
      );
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white/80 overflow-hidden mb-3">
      {/* Desktop Row View */}
      <div 
        className="hidden lg:flex items-center px-6 py-4 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-[80px] shrink-0">
          <div className="w-[40px] h-[50px] bg-[#FEF6DD] flex items-center justify-center text-[18px] text-[#E0B220] font-bold rounded-sm shadow-sm">
            {book.title ? book.title.charAt(0).toUpperCase() : <BookOpen size={20} />}
          </div>
        </div>
        <div className="w-[240px] shrink-0 pr-4">
          <p className="font-bold text-[#1C2434] text-[14px] truncate flex items-center">
            <span className="truncate">{book.title}</span>
          </p>
          <p className="text-[12px] text-gray-500 truncate">by {book.author}</p>
        </div>
        <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium pr-2">
           {book.category?.name || <span className="text-gray-400 italic">Uncategorized</span>}
        </div>
        <div className="w-[120px] shrink-0 text-[13px] text-gray-600 font-medium">
          #{book.id}
        </div>
        <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium">
          {book.isbn}
        </div>
        <div className="w-[120px] shrink-0">
          {statusPill()}
        </div>

        <div className="flex-1 min-w-[160px] flex items-center justify-end gap-4 pr-2">
          {book.user_interaction?.type !== 'reading' && (
            <button 
               className={`cursor-pointer transition-transform hover:scale-110 ${isUpdating ? "opacity-50" : ""}`}
               onClick={handleLikeClick}
               disabled={isUpdating}
               title={liked ? "Remove from Wishlist" : "Add to Wishlist"}
            >
               <Heart color={liked ? "#F64E60" : "#A1A5B7"} fill={liked ? "#F64E60" : "none"} size={20} />
            </button>
          )}
          
          {renderActionButton()}

          <button className="text-gray-400 hover:text-gray-700 transition-colors ml-2">
             {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div 
        className="flex lg:hidden flex-col p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-4">
          <div className="w-16 h-24 bg-[#FEF6DD] flex items-center justify-center text-[24px] text-[#E0B220] font-bold rounded-md shrink-0 shadow-sm">
             {book.title ? book.title.charAt(0).toUpperCase() : <BookOpen size={24} />}
          </div>
          <div className="flex-1 min-w-0">
             <p className="font-bold text-[#1C2434] text-[14px] leading-tight mb-1 truncate flex items-center">
               <span className="truncate">{book.title}</span>
             </p>
             <p className="text-[12px] text-gray-500 mb-2 truncate">by {book.author}</p>
             <div className="mb-2">
                 {statusPill()}
             </div>
             <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{book.category?.name || "Uncategorized"}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100/50">
           <button 
             className="text-gray-500 text-[12px] font-bold flex items-center gap-1 hover:text-gray-700"
           >
             {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Details
           </button>
           <div className="flex items-center gap-4">
             {book.user_interaction?.type !== 'reading' && (
               <button 
                  className={`cursor-pointer transition-transform ${isUpdating ? "opacity-50" : ""}`}
                  onClick={handleLikeClick}
                  disabled={isUpdating}
               >
                  <Heart color={liked ? "#F64E60" : "#A1A5B7"} fill={liked ? "#F64E60" : "none"} size={20} />
               </button>
             )}
             {renderActionButton()}
           </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 pt-6 border-t border-gray-100/50 flex flex-col gap-6">
           {/* Top Row: Description */}
           <div className="w-full">
               <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
               {book.description ? (
                  <p className="text-[13px] text-gray-600 leading-relaxed max-w-4xl">
                     {book.description}
                  </p>
               ) : (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200">
                     <p className="text-[13px] text-gray-400 italic">No summary available for this title.</p>
                  </div>
               )}
           </div>

           {/* Bottom Row: Metadata Details */}
           <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-100">
               <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">At a Glance</h4>
               <div className="flex flex-wrap gap-8 md:gap-16">
                  <div>
                     <span className="block text-[11px] text-gray-500 font-medium mb-0.5">PUBLISHER</span>
                     <span className="block text-[13px] text-slate-800 font-bold">{book.publisher?.name || 'Unknown'}</span>
                  </div>
                  <div>
                     <span className="block text-[11px] text-gray-500 font-medium mb-0.5">PUBLISHED DATE</span>
                     <span className="block text-[13px] text-slate-800 font-bold">{book.published_date || 'Unknown'}</span>
                  </div>
                  <div>
                     <span className="block text-[11px] text-gray-500 font-medium mb-0.5">ISBN</span>
                     <span className="block text-[13px] text-slate-800 font-bold">{book.isbn || 'Unknown'}</span>
                  </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BookCard;
