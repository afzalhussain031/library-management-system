import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { catalog, dashboard, circulation } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import BookList from "../../components/user/catalog/BookList";

export default function Books() {
  const [activeTopFilter, setActiveTopFilter] = useState("All Books");
  const [activeBottomFilter, setActiveBottomFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [activeAuthorFilter, setActiveAuthorFilter] = useState("All");
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  
  const [activeYearFilter, setActiveYearFilter] = useState("All");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  
  const [activeLanguageFilter, setActiveLanguageFilter] = useState("All");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);


  const fetchBooks = useCallback(() => catalog.getBooks({ sort: 'popularity' }), []);


  const { data: rawBooksData, isLoading, error, refetch: refetchBooks } = useApi(fetchBooks, []);

  const handleReservationUpdate = useCallback(() => {
    refetchBooks(); // Update copies count and user interaction
  }, [refetchBooks]);

  const rawBooks = Array.isArray(rawBooksData) ? rawBooksData : rawBooksData?.results || [];

  // Derived counts for filters
  const { recommendedCount, newArrivalsCount } = useMemo(() => {
     // Mock counts for now based on slice
     return { 
       recommendedCount: Math.max(0, Math.floor(rawBooks.length / 3)), 
       newArrivalsCount: Math.max(0, Math.floor(rawBooks.length / 4)) 
     };
  }, [rawBooks]);



  // Derived filter options
  const availableCategories = useMemo(() => {
    return ['All', ...new Set(rawBooks.map(b => b.category?.name).filter(Boolean))].sort();
  }, [rawBooks]);

  const availableAuthors = useMemo(() => {
    return ['All', ...new Set(rawBooks.map(b => b.author).filter(Boolean))].sort();
  }, [rawBooks]);

  const availableYears = useMemo(() => {
    return ['All', ...new Set(rawBooks.map(b => b.published_date?.substring(0, 4)).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  }, [rawBooks]);

  const availableLanguages = useMemo(() => {
    return ['All', ...new Set(rawBooks.map(b => b.language?.name).filter(Boolean))].sort();
  }, [rawBooks]);



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
      
      // Faceted Filters
      if (activeCategoryFilter !== "All" && book.category?.name !== activeCategoryFilter) return false;
      if (activeAuthorFilter !== "All" && book.author !== activeAuthorFilter) return false;
      if (activeYearFilter !== "All" && book.published_date?.substring(0, 4) !== activeYearFilter) return false;
      if (activeLanguageFilter !== "All" && book.language?.name !== activeLanguageFilter) return false;
      
      return true;
    });
  }, [rawBooks, activeBottomFilter, activeTopFilter, searchQuery, activeCategoryFilter, activeAuthorFilter, activeYearFilter, activeLanguageFilter]);


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
      <div className="relative z-20 w-full rounded-[40px] shadow-sm mb-8 border border-white p-5 sm:p-6 bg-white/80 backdrop-blur-md">
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
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <button onClick={() => setActiveBottomFilter("All")} className={getBottomButtonStyle("All")}>
              All
            </button>
            <button onClick={() => setActiveBottomFilter("Available")} className={getBottomButtonStyle("Available")}>
              Available Only
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-sm"
              >
                {activeCategoryFilter === 'All' ? 'Category' : activeCategoryFilter} <ChevronDown size={14} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {availableCategories.map(tag => (
                        <li key={tag}>
                          <button
                            onClick={() => { setActiveCategoryFilter(tag); setIsCategoryDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                              activeCategoryFilter === tag ? 'text-[#E0B220] font-bold bg-[#FEF6DD]/50' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Author Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-sm"
              >
                {activeAuthorFilter === 'All' ? 'Author' : activeAuthorFilter} <ChevronDown size={14} className={`transition-transform ${isAuthorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAuthorDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsAuthorDropdownOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {availableAuthors.map(tag => (
                        <li key={tag}>
                          <button
                            onClick={() => { setActiveAuthorFilter(tag); setIsAuthorDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                              activeAuthorFilter === tag ? 'text-[#E0B220] font-bold bg-[#FEF6DD]/50' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-sm"
              >
                {activeYearFilter === 'All' ? 'Year' : activeYearFilter} <ChevronDown size={14} className={`transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isYearDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsYearDropdownOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {availableYears.map(tag => (
                        <li key={tag}>
                          <button
                            onClick={() => { setActiveYearFilter(tag); setIsYearDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                              activeYearFilter === tag ? 'text-[#E0B220] font-bold bg-[#FEF6DD]/50' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-sm"
              >
                {activeLanguageFilter === 'All' ? 'Language' : activeLanguageFilter} <ChevronDown size={14} className={`transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLanguageDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLanguageDropdownOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {availableLanguages.map(tag => (
                        <li key={tag}>
                          <button
                            onClick={() => { setActiveLanguageFilter(tag); setIsLanguageDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                              activeLanguageFilter === tag ? 'text-[#E0B220] font-bold bg-[#FEF6DD]/50' : 'text-gray-700 font-medium'
                            }`}
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

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
           books={finalBooks} 
           isLoading={isLoading} 
           onReservationUpdate={handleReservationUpdate}
         />
      </div>

    </div>
  );
}
