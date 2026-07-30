import React, { useState, useEffect, useRef } from "react";
import { Bookmark, X, CheckCircle, Clock, Trash2, BookmarkPlus, Loader2 } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { toast } from "react-hot-toast";
import { circulation, catalog } from "../../services/api";
import BookThumbnail from "../common/BookThumbnail";

export default function WishlistDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    wishlistItems, 
    removeFromWishlist, 
    reserveItem,
    refreshWishlist
  } = useWishlist();

  const [isProcessing, setIsProcessing] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBulkReserve = async () => {
    if (wishlistItems.length === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(
        wishlistItems.map((item) =>
          circulation.createReservation({ book: item.book.id })
        )
      );
      
      await Promise.all(
        wishlistItems.map((item) =>
          catalog.removeFromWishlist(item.id)
        )
      );
      
      await refreshWishlist();
      toast.success(`Successfully reserved ${wishlistItems.length} books!`);
      closeDropdown();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reserve some books.");
    } finally {
      setIsProcessing(false);
    }
  };

  const unreadCount = wishlistItems.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-gray-800"
      >
        <Bookmark size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bookmark size={18} className="text-blue-500" /> 
              My Wishlist
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} saved
              </span>
            )}
          </div>

          {/* List Content */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-gray-50">
            {wishlistItems.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <BookmarkPlus size={32} className="text-gray-300 mb-3" />
                <p className="text-gray-800 font-medium text-sm">Your wishlist is empty</p>
                <p className="text-gray-500 text-xs mt-1">Browse the catalog to add books</p>
              </div>
            ) : (
              wishlistItems.map((item) => {
                const isAvailable = item.book?.available_copies > 0;
                const coverUrl = item.book?.cover_image || null;

                return (
                  <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                    {/* Thumbnail */}
                    <BookThumbnail 
                      title={item.book?.title} 
                      coverImage={coverUrl} 
                      isbn={item.book?.isbn} 
                      hoverExpand={false} 
                      className="w-12 h-16 rounded" 
                    />
                    
                    {/* Details */}
                    <div className="flex flex-col flex-1 min-w-0 py-0.5">
                      <h4 className="font-bold text-gray-900 text-[13px] line-clamp-1 leading-tight mb-0.5">
                        {item.book?.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">
                        {item.book?.author}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                          isAvailable ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {isAvailable ? <CheckCircle size={8} /> : <Clock size={8} />}
                          {isAvailable ? "Available" : "Waitlist"}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); reserveItem(item.book?.id, item.id); }}
                            className="p-1 text-blue-500 hover:text-white hover:bg-blue-600 rounded transition-colors cursor-pointer"
                            title="Reserve"
                          >
                            <CheckCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-3 bg-white border-t border-gray-100">
              <button 
                onClick={handleBulkReserve}
                disabled={isProcessing}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Reserve All Items
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
