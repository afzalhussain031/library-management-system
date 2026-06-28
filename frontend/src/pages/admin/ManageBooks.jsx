import React, { useState, useEffect } from "react";
import client from "../../services/httpClient";
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

const Books = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  
  // 1. Setup new state variables
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // 2. Fetch data from the backend when component mounts
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await client.get('/books/');
        setBooks(response.data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load inventory data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="px-0 py-0 sm:p-0 md:p-0 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      {/* Filter and Stats Dash */}
      <div className="w-full rounded-[40px] shadow-sm overflow-hidden mb-8 border border-white p-0">
        {/* Top Row Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <button className="flex items-center gap-2 bg-[#FEF6DD] text-[#E0B220] px-4 py-2 rounded-full font-bold text-[14px]">
              All books{" "}
              <span className="bg-white text-[#E0B220] px-2 py-0.5 rounded-full text-xs">
                {books.length}
              </span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Lent <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">...</span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Returned <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">...</span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Overdue <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">...</span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Requests <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">...</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-gray-600 font-semibold px-4 py-2 rounded-full text-[13px] shadow-sm border border-gray-100">
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
            <button className="bg-[#FEF6DD] text-[#E0B220] px-5 py-1.5 rounded-full font-bold text-[13px]">All</button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">Available</button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">Borrowed</button>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-4">
            <span>{books.length} records</span>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-700">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-700">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Loading/Error States */}
      {loading && <div className="text-center py-8 text-gray-500 font-semibold">Loading books...</div>}
      {error && <div className="text-center py-8 text-red-500 font-semibold">{error}</div>}

      {/* Responsive Table Container */}
      {!loading && !error && (
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

            {/* 3. Render fetched Books */}
            <div className="space-y-3">
              {books.map((book, idx) => (
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
              ))}
            </div>
            
            {books.length === 0 && (
                <div className="text-center py-10 text-gray-500 font-semibold">
                    No books found in the inventory.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
