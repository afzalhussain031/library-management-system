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

const MOCK_BOOKS = Array(8)
  .fill(null)
  .map((_, i) => ({
    id: i + 1,
    title: "Lorem Ipsum",
    author: "Jon Doe",
    publisher: "ABC Publication",
    bookId: "#4235532",
    isbn: "978-3-16-148410-0",
    status: i === 0 ? "Borrowed" : "Available",
    requests:
      i === 0
        ? 0
        : i === 1
          ? 2
          : i === 2
            ? 0
            : i === 3
              ? 4
              : i === 4
                ? 1
                : i === 5
                  ? 3
                  : 0,
    description:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et",
    keywords: ["sadipscing", "eirmod", "aliquyam", "tempor", "sed diam"],
    details: {
      edition: "2nd",
      language: "English",
      publishDate: "23 Feb 2010",
      series: "NIL",
      pageNo: "389",
      addedDate: "20 Jan 2022",
      cost: "₹ 420",
      callNumber: "QA 200.86.550",
      department: "Lorem Ipsum",
      subject: "Lorem Ipsum",
    },
  }));

const Books = () => {
  const [expandedRow, setExpandedRow] = useState(1);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

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
                10,360
              </span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Lent{" "}
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                360
              </span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Returned{" "}
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                304
              </span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Overdue{" "}
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                60
              </span>
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-500 px-4 py-2 rounded-full font-semibold text-[14px] shadow-sm border border-gray-100">
              Requests{" "}
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                43
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-gray-600 font-semibold px-4 py-2 rounded-full text-[13px] shadow-sm border border-gray-100">
              <Calendar size={14} className="text-gray-400" /> 01 Jan 2022 to 14
              Dec 2022
            </button>
            <button className="flex items-center gap-1 px-5 py-2 bg-[#EAF2FF] text-[#4386F5] font-bold text-[13px] rounded-full hover:bg-blue-100 transition-colors">
              <Plus size={14} /> Add Book
            </button>
          </div>
        </div>

        {/* Bottom Row Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button className="bg-[#FEF6DD] text-[#E0B220] px-5 py-1.5 rounded-full font-bold text-[13px]">
              All
            </button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">
              Available
            </button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">
              Borrowed
            </button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">
              Overdue
            </button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">
              Damaged
            </button>
            <button className="bg-white text-gray-600 font-semibold px-5 py-1.5 rounded-full text-[13px] shadow-sm border border-gray-100 hover:bg-gray-50">
              Missing
            </button>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium pr-4">
            <span>1-25 of 405</span>
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

      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[1220px]">
          {/* Books List Header */}
          <div className="flex items-center px-6 py-2 text-[12px] font-bold text-gray-400 mb-2">
            <div className="w-[50px] shrink-0">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
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

          {/* Books List */}
          <div className="space-y-3">
            {MOCK_BOOKS.map((book, idx) => (
              <div
                key={book.id}
                className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white transition-all duration-200 overflow-hidden"
              >
                {/* Main Row */}
                <div
                  className="flex items-center px-6 py-4 cursor-pointer"
                  onClick={() => toggleRow(book.id)}
                >
                  <div
                    className="w-[50px] shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      defaultChecked={idx === 0}
                      className="rounded border-gray-300 text-[#4386F5] focus:ring-[#4386F5] w-4 h-4"
                    />
                  </div>
                  <div className="w-[80px] shrink-0">
                    <div className="w-[40px] h-[50px] bg-[#EAEAEA] flex items-center justify-center text-[10px] text-gray-400 font-medium rounded-sm">
                      {idx === 0 ? "40 x 60" : idx + 1}
                    </div>
                  </div>
                  <div className="w-[240px] shrink-0 pr-4">
                    <p className="font-bold text-[#1C2434] text-[14px] truncate">
                      {book.title}
                    </p>
                    <p className="text-[12px] text-gray-500 truncate">
                      by {book.author}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium pr-2">
                    {book.publisher}
                  </div>
                  <div className="w-[120px] shrink-0 text-[13px] text-gray-600 font-medium">
                    {book.bookId}
                  </div>
                  <div className="w-[160px] shrink-0 text-[13px] text-gray-600 font-medium">
                    {book.isbn}
                  </div>
                  <div className="w-[120px] shrink-0">
                    <span
                      className={`px-3 py-1 rounded text-[11px] font-bold inline-block ${
                        book.status === "Borrowed"
                          ? "bg-[#FFE2E5] text-[#F64E60]"
                          : "bg-[#C9F7F5] text-[#1BC5BD]"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                  <div className="w-[90px] shrink-0 text-[13px] text-gray-600 font-medium text-center">
                    {book.requests}
                  </div>
                  <div className="flex-1 min-w-[160px] flex items-center justify-end gap-3 text-gray-400 pr-2">
                    <button
                      className="hover:text-blue-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit2 size={16} className="text-[#4386F5]" />
                    </button>
                    <button
                      className="hover:text-red-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={16} className="text-[#1C2434]" />
                    </button>
                    <button
                      className="hover:text-gray-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Printer size={16} className="text-[#1C2434]" />
                    </button>
                    <button className="hover:text-gray-700 transition-colors ml-1">
                      {expandedRow === book.id ? (
                        <ChevronUp size={18} className="text-[#1C2434]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#1C2434]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedRow === book.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex gap-8">
                    {/* Left: Description */}
                    <div className="w-[280px] shrink-0">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Description
                      </h4>
                      <p className="text-[13px] text-gray-600 leading-relaxed pr-4">
                        {book.description}
                      </p>
                    </div>

                    {/* Middle: Keywords */}
                    <div className="w-[200px] shrink-0">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {book.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              i === 0
                                ? "bg-[#EAF2FF] text-[#4386F5] border-[#EAF2FF]"
                                : "bg-white text-gray-500 border-gray-200"
                            }`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Grid Details */}
                    <div className="flex-1 grid grid-cols-3 gap-y-4 gap-x-4 min-w-[500px]">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Edition
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.edition}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Language
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.language}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Publish date
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.publishDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Series
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.series}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Page no.
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.pageNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Added date
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.addedDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Cost
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.cost}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Books call number
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.callNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Department
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.department}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-gray-400 mb-1">
                          Subject
                        </p>
                        <p className="text-[13px] font-bold text-[#1C2434]">
                          {book.details.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;