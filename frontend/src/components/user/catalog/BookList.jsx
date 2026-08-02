import React from "react";
import BookCard from "./BookCard";

const BookList = ({ books = [], isLoading = false, onReservationUpdate, highlightBookId }) => {
  return (
    <div className="w-full">
      {/* Desktop Table View Header */}
      <div className="hidden lg:flex items-center px-6 py-2 text-[12px] font-bold text-gray-400 mb-2">
        <div className="w-[80px] shrink-0">Thumbnail</div>
        <div className="w-[240px] shrink-0">Title & Author</div>
        <div className="w-[160px] shrink-0">Category</div>
        <div className="w-[120px] shrink-0">Book ID</div>
        <div className="w-[160px] shrink-0">ISBN</div>
        <div className="w-[120px] shrink-0">Status</div>
        <div className="flex-1 min-w-[160px] text-right pr-4">Actions</div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
           // Render Skeletons
           [1,2,3,4,5].map(key => (
               <div key={key} className="bg-white/60 backdrop-blur-xl rounded-[20px] shadow-sm border border-white flex items-center px-6 py-4 animate-pulse">
                   <div className="w-[80px] shrink-0"><div className="w-[40px] h-[50px] bg-gray-200 rounded-sm"></div></div>
                   <div className="w-[240px] shrink-0 pr-4 space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                   </div>
                   <div className="hidden lg:block w-[160px] shrink-0 pr-2"><div className="h-4 bg-gray-200 rounded w-2/3"></div></div>
                   <div className="hidden lg:block w-[120px] shrink-0"><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
                   <div className="hidden lg:block w-[160px] shrink-0"><div className="h-4 bg-gray-200 rounded w-2/3"></div></div>
                   <div className="hidden lg:block w-[120px] shrink-0"><div className="h-6 bg-gray-200 rounded w-3/4"></div></div>
                   <div className="hidden lg:flex flex-1 min-w-[160px] justify-end gap-3 pr-2">
                       <div className="h-6 bg-gray-200 rounded-full w-6"></div>
                       <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                   </div>
               </div>
           ))
        ) : books.length === 0 ? (
           <div className="text-center py-10 bg-white/40 backdrop-blur-md rounded-[20px] border border-white shadow-sm">
               <p className="text-gray-500 font-bold text-[14px]">No books found matching the selected filters.</p>
               <p className="text-gray-400 text-[12px] mt-1">Try adjusting your search query or filter categories.</p>
           </div>
        ) : (
          books.map((book, idx) => (
            <BookCard 
              key={book.id} 
              book={book} 
              idx={idx} 
              onReservationUpdate={onReservationUpdate}
              isHighlighted={highlightBookId && book.id.toString() === highlightBookId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BookList;
