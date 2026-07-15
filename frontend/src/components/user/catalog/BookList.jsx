import React from "react";
import BookCard from "./bookcard";

const BookList = ({ books = [] }) => {
  return (
    <div>
      {books.length === 0 ? (
        <p className="p-4 text-gray-600">No books available in the catalog.</p>
      ) : (
        books.map((book) => (
          <BookCard key={book.id} title={book.title} author={book.author} />
        ))
      )}
    </div>
  );
};
    

export default BookList;
