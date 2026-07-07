import React, { useState } from "react";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { catalog } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonCard, SkeletonText } from "../../components/common/Skeleton";

const Books = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  
  // NEW: Filter States
  const [activeTopFilter, setActiveTopFilter] = useState("All books");
  const [activeBottomFilter, setActiveBottomFilter] = useState("All");

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const { data: rawBooks, isLoading: loading, error } = useApi(catalog.getBooks, []);
  const books = rawBooks || [];

  // NEW: Filtering Logic
  const filteredBooks = books.filter((book) => {
    // Bottom Filter Logic
    if (activeBottomFilter === "Available" && book.available_copies === 0) return false;
    // If available copies are equal to total copies, none are borrowed
    if (activeBottomFilter === "Borrowed" && book.available_copies === book.total_copies) return false;

    // Top Filter Logic
    if (activeTopFilter === "Lent" && (book.lent_copies || 0) === 0) return false;
    if (activeTopFilter === "Returned" && (book.returned_copies || 0) === 0) return false; 
    if (activeTopFilter === "Overdue" && (book.overdue_copies || 0) === 0) return false; 
    if (activeTopFilter === "Requests" && (book.requests_count || 0) === 0) return false; 

    return true;
  });

  // Calculate badge counts (How many books fall into each category)
  const { lentCount, returnedCount, overdueCount, requestsCount } = books.reduce(
    (acc, b) => {
      if ((b.lent_copies || 0) > 0) acc.lentCount += 1;
      if ((b.returned_copies || 0) > 0) acc.returnedCount += 1;
      if ((b.overdue_copies || 0) > 0) acc.overdueCount += 1;
      if ((b.requests_count || 0) > 0) acc.requestsCount += 1;
      return acc;
    },
    { lentCount: 0, returnedCount: 0, overdueCount: 0, requestsCount: 0 }
  );


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

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      {/* Filter and Stats Dash */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-0">
        {/* Top Row Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <button 
              onClick={() => setActiveTopFilter("All books")}
              className={getTopButtonStyle("All books")}
            >
              All books <span className={`${activeTopFilter === "All books" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{books.length}</span>
            </button>

            <button 
              onClick={() => setActiveTopFilter("Lent")}
              className={getTopButtonStyle("Lent")}
            >
              Lent <span className={`${activeTopFilter === "Lent" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{lentCount}</span>
            </button>
            <button 
              onClick={() => setActiveTopFilter("Returned")}
              className={getTopButtonStyle("Returned")}
            >
              Returned <span className={`${activeTopFilter === "Returned" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{returnedCount}</span>
            </button>
            <button 
              onClick={() => setActiveTopFilter("Overdue")}
              className={getTopButtonStyle("Overdue")}
            >
              Overdue <span className={`${activeTopFilter === "Overdue" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{overdueCount}</span>
            </button>
            <button 
              onClick={() => setActiveTopFilter("Requests")}
              className={getTopButtonStyle("Requests")}
            >
              Requests <span className={`${activeTopFilter === "Requests" ? "bg-white text-[#E0B220]" : "bg-gray-100 text-gray-500"} px-2 py-0.5 rounded-full text-xs transition-colors`}>{requestsCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-gray-600 font-semibold px-4 py-2 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
              <Calendar size={14} className="text-gray-400" /> This Month
            </button>
            <button className="flex items-center gap-1 px-5 py-2 bg-[#EAF2FF] text-[#4386F5] font-bold text-[13px] rounded-full hover:bg-blue-100 transition-colors">
              <Plus size={14} /> Add Book
            </button>
          </div>
        </div>

        {/* Bottom Row Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button 
              onClick={() => setActiveBottomFilter("All")}
              className={getBottomButtonStyle("All")}
            >
              All
            </button>
            <button 
              onClick={() => setActiveBottomFilter("Available")}
              className={getBottomButtonStyle("Available")}
            >
              Available
            </button>
            <button 
              onClick={() => setActiveBottomFilter("Borrowed")}
              className={getBottomButtonStyle("Borrowed")}
            >
              Borrowed
            </button>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-4">
            {/* NEW: Show the count of filtered books instead of all books */}
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

      {/* Show Error State */}
      {error && <div className="py-8"><ErrorMessage message={error} /></div>}

      {/* Responsive Table Container */}
      {!error && (
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[1220px]">
            {/* Books List Header */}
            <div className="flex items-center px-6 py-2 text-[12px] font-bold text-gray-400 mb-2">
              <div className="w-[50px] shrink-0">
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
              <div className="w-[80px] shrink-0">Thumbnail</div>
              <div className="w-[240px] shrink-0">Title & Author</div>
              <div className="w-[160px] shrink-0">Publisher</div>
              <div className="w-[120px] shrink-0">Book ID</div>
              <div className="w-[160px] shrink-0">ISBN</div>
              <div className="w-[120px] shrink-0">Status</div>
              <div className="w-[90px] shrink-0 text-center">Requests</div>
              <div className="flex-1 min-w-[160px] text-right pr-4">Actions</div>
            </div>

            {/* NEW: Render filteredBooks instead of books */}
            <div className="space-y-3">
              {loading ? (
                // Render 5 Skeleton Rows
                [1, 2, 3, 4, 5].map(key => (
                  <div key={key} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4">
                     <div className="w-[50px] shrink-0">
                       <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                     </div>
                     <div className="w-[80px] shrink-0">
                       <SkeletonCard className="w-[40px] h-[50px] rounded-sm" />
                     </div>
                     <div className="w-[240px] shrink-0 pr-4 space-y-2">
                       <SkeletonText className="h-4 w-3/4" />
                       <SkeletonText className="h-3 w-1/2" />
                     </div>
                     <div className="w-[160px] shrink-0 pr-2">
                       <SkeletonText className="h-4 w-2/3" />
                     </div>
                     <div className="w-[120px] shrink-0">
                       <SkeletonText className="h-4 w-1/2" />
                     </div>
                     <div className="w-[160px] shrink-0">
                       <SkeletonText className="h-4 w-2/3" />
                     </div>
                     <div className="w-[120px] shrink-0">
                       <SkeletonText className="h-6 w-3/4 rounded" />
                     </div>
                     <div className="w-[90px] shrink-0 text-center">
                       <SkeletonText className="h-4 w-1/3 mx-auto" />
                     </div>
                     <div className="flex-1 min-w-[160px] flex justify-end gap-3 pr-2">
                       <SkeletonText className="h-4 w-4 rounded-full" />
                       <SkeletonText className="h-4 w-4 rounded-full" />
                     </div>
                  </div>
                ))
              ) : (
                filteredBooks.map((book, idx) => (
                  <div
                  key={book.id}
                  className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white transition-all duration-200 overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="flex items-center px-6 py-4 cursor-pointer"
                    onClick={() => toggleRow(book.id)}
                  >
                    <div className="w-[50px] shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-[#4386F5]" />
                    </div>
                    <div className="w-[80px] shrink-0">
                      <div className="w-[40px] h-[50px] bg-[#EAEAEA] flex items-center justify-center text-[10px] text-gray-400 font-medium rounded-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="w-[240px] shrink-0 pr-4">
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">{book.title}</p>
                      <p className="text-[12px] text-gray-500 truncate">by {book.author}</p>
                    </div>
                    <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium pr-2">
                      {book.publisher?.name || "N/A"}
                    </div>
                    <div className="w-[120px] shrink-0 text-[13px] text-gray-600 font-medium">
                      #{book.id}
                    </div>
                    <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium">
                      {book.isbn}
                    </div>
                    <div className="w-[120px] shrink-0">
                      {book.total_copies === 0 ? (
                        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-gray-100 text-gray-500">
                          No Copies
                        </span>
                      ) : book.available_copies > 0 ? (
                        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-[#C9F7F5] text-[#1BC5BD]">
                          {book.available_copies} / {book.total_copies} Available
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded text-[11px] font-bold inline-block bg-[#FFE2E5] text-[#F64E60]">
                          0 / {book.total_copies} Available
                        </span>
                      )}
                    </div>

                    <div className="w-[90px] shrink-0 text-[13px] text-gray-600 font-medium text-center">
                      0
                    </div>
                    <div className="flex-1 min-w-[160px] flex items-center justify-end gap-3 text-gray-400 pr-2">
                      <button className="hover:text-blue-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Edit2 size={16} className="text-[#4386F5]" />
                      </button>
                      <button className="hover:text-red-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Trash2 size={16} className="text-[#1C2434]" />
                      </button>
                      <button className="hover:text-gray-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Printer size={16} className="text-[#1C2434]" />
                      </button>
                      <button className="hover:text-gray-700 transition-colors ml-1">
                        {expandedRow === book.id ? <ChevronUp size={18} className="text-[#1C2434]" /> : <ChevronDown size={18} className="text-[#1C2434]" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedRow === book.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex gap-8">
                      {/* Left: Description */}
                      <div className="w-[280px] shrink-0">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-[13px] text-gray-600 leading-relaxed pr-4">
                          No description provided for this book yet.
                        </p>
                      </div>

                      {/* Right: Grid Details */}
                      <div className="flex-1 grid grid-cols-3 gap-y-4 gap-x-4 min-w-[500px]">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 mb-1">Publish date</p>
                          <p className="text-[13px] font-bold text-[#1C2434]">{book.published_date || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 mb-1">Language</p>
                          <p className="text-[13px] font-bold text-[#1C2434]">N/A</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 mb-1">Cost</p>
                          <p className="text-[13px] font-bold text-[#1C2434]">N/A</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )))}
            </div>
            
            {/* NEW: Changed to check filteredBooks length */}
            {filteredBooks.length === 0 && (
                <div className="text-center py-10 text-gray-500 font-semibold">
                    No books found matching the selected filters.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
