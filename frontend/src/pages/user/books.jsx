import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { catalog } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import BookList from "../../components/user/catalog/BookList";

export default function Books() {
  const [activeTopFilter, setActiveTopFilter] = useState("All Books");
  const [activeBottomFilter, setActiveBottomFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = useCallback(() => catalog.getBooks({ sort: 'popularity' }), []);
  const fetchWishlist = useCallback(() => catalog.getWishlist(), []);

  const { data: rawBooksData, isLoading, error, refetch: refetchBooks } = useApi(fetchBooks, []);
  const { data: wishlistData, refetch: refetchWishlist } = useApi(fetchWishlist, []);

  const handleWishlistToggle = useCallback(() => {
    refetchWishlist();
  }, [refetchWishlist]);

  const rawBooks = Array.isArray(rawBooksData) ? rawBooksData : rawBooksData?.results || [];

  // Derived counts for filters
  const { recommendedCount, newArrivalsCount } = useMemo(() => {
     // Mock counts for now based on slice
     return { 
       recommendedCount: Math.max(0, Math.floor(rawBooks.length / 3)), 
       newArrivalsCount: Math.max(0, Math.floor(rawBooks.length / 4)) 
     };
  }, [rawBooks]);

  const wishlistMap = useMemo(() => {
    const map = {};
    const items = Array.isArray(wishlistData) ? wishlistData : wishlistData?.results || [];
    items.forEach(item => {
      if (item.book && item.book.id) {
        map[item.book.id] = item.id;
      }
    });
    return map;
  }, [wishlistData]);

  // Filtering Logic
  const filteredBooks = useMemo(() => {
    return rawBooks.filter((book) => {
      // Bottom Filter
      if (activeBottomFilter === "Available" && (book.available_copies || 0) === 0) return false;
      
      // Top Filter simulation (in a real app, this might hit an API endpoint or check a flag)
      if (activeTopFilter === "Recommended" && book.id % 3 !== 0) return false;
      if (activeTopFilter === "New Arrivals" && book.id % 4 !== 0) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = book.title?.toLowerCase().includes(query);
        const authorMatch = book.author?.toLowerCase().includes(query);
        if (!titleMatch && !authorMatch) return false;
      }
      return true;
    });
  }, [rawBooks, activeBottomFilter, activeTopFilter, searchQuery]);


  // Helper function for styling top buttons
  const getTopButtonStyle = (filterName) => {
    const isActive = activeTopFilter === filterName;
    return `flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm transition-all ${
      isActive
        ? "bg-[#FEF6DD] text-[#E0B220] border border-transparent font-bold"
        : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
    }`;
  };

  // Helper function for styling bottom buttons
  const getBottomButtonStyle = (filterName) => {
    const isActive = activeBottomFilter === filterName;
    return `px-5 py-1.5 rounded-full text-[13px] shadow-sm transition-all ${
      isActive
        ? "bg-[#FEF6DD] text-[#E0B220] border border-transparent font-bold"
        : "bg-white text-gray-600 border border-gray-100 font-semibold hover:bg-gray-50"
    }`;
  };

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden bg-[#F5F5F5]">
      
      {/* Filter and Stats Dash */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-5 sm:p-6 bg-white/80 backdrop-blur-md">
        {/* Top Row Stats & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <button onClick={() => setActiveTopFilter("All Books")} className={getTopButtonStyle("All Books")}>
              All Books <span className={`${activeTopFilter === "All Books" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{rawBooks.length}</span>
            </button>
            <button onClick={() => setActiveTopFilter("Recommended")} className={getTopButtonStyle("Recommended")}>
              Recommended <span className={`${activeTopFilter === "Recommended" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{recommendedCount}</span>
            </button>
            <button onClick={() => setActiveTopFilter("New Arrivals")} className={getTopButtonStyle("New Arrivals")}>
              New Arrivals <span className={`${activeTopFilter === "New Arrivals" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{newArrivalsCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-[13px] text-gray-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button onClick={() => setActiveBottomFilter("All")} className={getBottomButtonStyle("All")}>
              All
            </button>
            <button onClick={() => setActiveBottomFilter("Available")} className={getBottomButtonStyle("Available")}>
              Available Only
            </button>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-4">
            <span>{filteredBooks.length} records</span>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="w-full pb-8">
         <BookList 
           books={filteredBooks} 
           isLoading={isLoading} 
           wishlistMap={wishlistMap} 
           onWishlistToggle={handleWishlistToggle} 
         />
      </div>

    </div>
  );
}
