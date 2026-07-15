import React from "react";
import BookCard from "./bookcard";

const BookList = ({ books = [], wishlistMap = {} }) => {
  return (
    <div>
      {books.length === 0 ? (
        <p className="p-4 text-gray-600">No books available in the catalog.</p>
      ) : (
        books.map((book) => (
          <BookCard 
            key={book.id} 
            id={book.id}
            title={book.title} 
            author={book.author} 
            initialWishlistId={wishlistMap[book.id] || null}
          />
        ))
      )}
    </div>
  );
};
    

export default BookList;
