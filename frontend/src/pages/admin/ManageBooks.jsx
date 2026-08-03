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
  Check,
  X as CloseIcon,
  Filter,
  Search,
} from "lucide-react";
import { catalog } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import { toast } from "react-hot-toast";
import { SkeletonCard, SkeletonText } from "../../components/common/Skeleton";
import AddBookModal from "../../components/admin/dashboard/AddBookModal";
import PhysicalCopiesTable from "../../components/admin/dashboard/PhysicalCopiesTable";
import BookThumbnail from "../../components/common/BookThumbnail";
import EntityLink from "../../components/common/EntityLink";
import { useEntityModal } from "../../context/EntityModalContext";

const Books = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  
  // NEW: Filter States
  const [activeTopFilter, setActiveTopFilter] = useState("All books");
  const [activeBottomFilter, setActiveBottomFilter] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { showBook, showPublisher } = useEntityModal();

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const { data: rawBooks, isLoading: loading, error, refetch: fetchBooks } = useApi(catalog.getBooks, []);
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

    // Search Logic
    if (searchQuery) {
       const query = searchQuery.toLowerCase();
       const matchesSearch = 
           book.title?.toLowerCase().includes(query) ||
           book.author?.toLowerCase().includes(query) ||
           book.isbn?.includes(query);
       if (!matchesSearch) return false;
    }

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




  const handleDeleteConfirm = async (id) => {
    try {
      await catalog.deleteBook(id);
      toast.success("Book deleted successfully!");
      setPendingDeleteId(null);
      fetchBooks(); // Refresh table
    } catch (error) {
      toast.error("Failed to delete book.");
    }
  };

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      {/* Unified Toolbar in Container */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-4 bg-white/50 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: Segmented Control & Dropdown */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Segmented Control for Availability */}
          <div className="flex items-center bg-gray-100/70 p-1 rounded-full">
            {["All", "Available", "Borrowed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveBottomFilter(filter)}
                className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                  activeBottomFilter === filter
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Filter Dropdown for Status */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[13px] font-bold text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Filter size={14} className={activeTopFilter !== "All books" ? "text-[#4386F5]" : "text-gray-400"} /> 
              {activeTopFilter === "All books" ? "Status: All" : `Status: ${activeTopFilter}`}
              <ChevronDown size={14} className="ml-1 text-gray-400" />
            </button>
            
            {isFilterDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 pb-2 mb-2 border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Filter by Status
                  </div>
                  
                  {/* Dropdown Items */}
                  {[
                    { label: "All books", count: books.length, color: "bg-gray-100 text-gray-500" },
                    { label: "Lent", count: lentCount, color: "bg-[#FEF6DD] text-[#E0B220]" },
                    { label: "Returned", count: returnedCount, color: "bg-[#C9F7F5] text-[#1BC5BD]" },
                    { label: "Overdue", count: overdueCount, color: "bg-[#FFE2E5] text-[#F64E60]" },
                    { label: "Requests", count: requestsCount, color: "bg-blue-50 text-blue-500" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setActiveTopFilter(item.label);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors ${
                        activeTopFilter === item.label
                          ? "bg-gray-50 font-bold text-gray-800"
                          : "text-gray-600 font-medium hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.color}`}>
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Stats & Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Local Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by title, author, or ISBN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-full text-[13px] text-gray-600 focus:outline-none focus:border-[#4386F5] focus:ring-1 focus:ring-[#4386F5] transition-all w-64 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-2">
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
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <button 
            onClick={() => {
              setBookToEdit(null); // Ensure it's in Add Mode
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1 px-5 py-2 bg-[#EAF2FF] text-[#4386F5] font-bold text-[13px] rounded-full hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} /> Add Book
          </button>
        </div>
      </div>
      </div>

      {/* Show Error State */}
      {error && <div className="py-8"><ErrorMessage message={error} /></div>}

      {/* Responsive Table Container */}
      {!error && (
        <>
        {/* Desktop Table View */}
        <div className="hidden lg:block w-full overflow-x-auto pb-4">
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
                     <div className="w-[240px] shr,ink-0 pr-4 space-y-2">
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
                    className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white/80 relative hover:z-30"
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
                      <BookThumbnail 
                        title={book.title} 
                        coverImage={book.cover_image} 
                        isbn={book.isbn} 
                        author={book.author}
                        hoverExpand={true} 
                      />
                    </div>
                    <div className="w-[240px] shrink-0 pr-4">
                      <p className="font-bold text-[#1C2434] text-[14px] truncate">
                        <EntityLink onClick={() => showBook(book.id)}>
                          {book.title}
                        </EntityLink>
                      </p>
                      <p className="text-[12px] text-gray-500 truncate">by {book.author}</p>
                    </div>
                    <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium pr-2">
                      {book.publisher ? (
                        <EntityLink onClick={() => showPublisher(book.publisher.id)}>
                          {book.publisher.name}
                        </EntityLink>
                      ) : (
                        "N/A"
                      )}
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
                      <button 
                        className={`hover:text-blue-500 transition-all ${pendingDeleteId === book.id ? 'opacity-30 pointer-events-none' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); setBookToEdit(book); setIsAddModalOpen(true); }}
                        title="Edit Book"
                      >
                        <Edit2 size={16} className="text-[#4386F5]" />
                      </button>

                      {pendingDeleteId === book.id ? (
                        // INLINE DEFENSIVE DELETE UI
                        <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-full px-1.5 py-1 border border-red-50 -my-2 relative z-10">
                          <span className="text-[10px] font-extrabold text-[#F64E60] tracking-wider uppercase pl-2 pr-1">Delete?</span>
                          <button 
                            className="p-1 rounded-full bg-[#FFE2E5] text-[#F64E60] hover:bg-[#F64E60] hover:text-white transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(book.id); }}
                            title="Confirm Delete"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <button 
                            className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); setPendingDeleteId(null); }}
                            title="Cancel"
                          >
                            <CloseIcon size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="hover:text-red-500 transition-colors" 
                          onClick={(e) => { e.stopPropagation(); setPendingDeleteId(book.id); }}
                          title="Delete Book"
                        >
                          <Trash2 size={16} className="text-[#1C2434]" />
                        </button>
                      )}

                      <button 
                        className={`hover:text-gray-700 transition-all ${pendingDeleteId === book.id ? 'opacity-30 pointer-events-none' : ''}`} 
                        onClick={(e) => e.stopPropagation()}
                        title="Print Label"
                      >
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
                          {book.description || "No description provided for this book yet."}
                        </p>
                      </div>

                      {/* Right: Physical Copies Mini-Table */}
                      <PhysicalCopiesTable bookId={book.id} />
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

        {/* Mobile Card View */}
        <div className="flex lg:hidden flex-col gap-4 pb-4">
           {loading ? (
             [1, 2, 3].map(key => (
               <div key={key} className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white flex gap-4">
                  <SkeletonCard className="w-16 h-24 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
                  </div>
               </div>
             ))
           ) : filteredBooks.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-semibold">
                  No books found matching the selected filters.
              </div>
           ) : (
             filteredBooks.map((book) => (
                <div key={book.id} className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white/80">
                  <div className="flex gap-4">
                      <BookThumbnail 
                        title={book.title} 
                        coverImage={book.cover_image} 
                        isbn={book.isbn} 
                        author={book.author}
                        hoverExpand={false} 
                        className="w-16 h-24 text-[14px] rounded-md"
                      />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1C2434] text-[14px] leading-tight mb-1 truncate">
                        <EntityLink onClick={() => showBook(book.id)}>
                          {book.title}
                        </EntityLink>
                      </p>
                      <p className="text-[12px] text-gray-500 mb-2 truncate">by {book.author}</p>
                      
                      {book.total_copies === 0 ? (
                        <span className="px-2 py-1 rounded text-[10px] font-bold inline-block bg-gray-100 text-gray-500">
                          No Copies
                        </span>
                      ) : book.available_copies > 0 ? (
                        <span className="px-2 py-1 rounded text-[10px] font-bold inline-block bg-[#C9F7F5] text-[#1BC5BD]">
                          {book.available_copies} / {book.total_copies} Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold inline-block bg-[#FFE2E5] text-[#F64E60]">
                          0 / {book.total_copies} Available
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                     <button 
                       className="text-gray-500 text-[12px] font-bold flex items-center gap-1 hover:text-gray-700"
                       onClick={() => toggleRow(book.id)}
                     >
                       {expandedRow === book.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Details
                     </button>
                     <div className="flex items-center gap-4">
                       <button className="text-[#4386F5] text-[12px] font-bold flex items-center gap-1" onClick={() => { setBookToEdit(book); setIsAddModalOpen(true); }}>
                         <Edit2 size={14} /> Edit
                       </button>
                       <button className="text-[#F64E60] text-[12px] font-bold flex items-center gap-1" onClick={() => setPendingDeleteId(book.id)}>
                         <Trash2 size={14} /> Delete
                       </button>
                     </div>
                  </div>
                  
                  {/* Inline Delete Confirm on Mobile */}
                  {pendingDeleteId === book.id && (
                     <div className="bg-[#FFE2E5] rounded-xl p-3 flex items-center justify-between mt-2 animate-in zoom-in-95 duration-200">
                       <span className="text-[12px] font-bold text-[#F64E60]">Delete this book?</span>
                       <div className="flex gap-2">
                         <button className="px-3 py-1 bg-[#F64E60] text-white rounded-full text-[11px] font-bold" onClick={() => handleDeleteConfirm(book.id)}>Yes</button>
                         <button className="px-3 py-1 bg-white text-gray-600 rounded-full text-[11px] font-bold" onClick={() => setPendingDeleteId(null)}>No</button>
                       </div>
                     </div>
                  )}

                  {/* Expanded Content on Mobile */}
                  {expandedRow === book.id && (
                    <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                          {book.description || "No description provided for this book yet."}
                        </p>
                      </div>
                      <PhysicalCopiesTable bookId={book.id} />
                    </div>
                  )}
                </div>
             ))
           )}
        </div>
        </>
      )}

      {/* Add Book Modal */}
      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchBooks} 
        bookToEdit={bookToEdit}
      />
    </div>
  );
};

export default Books;
