import React, { useState, useEffect } from "react";
import BookCard from "./BookCard";
import { catalog } from "../../../services/api";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await catalog.getBooks();
        // Fallback for either direct array response or paginated results object
        const bookData = Array.isArray(response)
          ? response
          : (response?.results || []);
        setBooks(bookData);
        setError(null);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-600 animate-pulse">Loading catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
        <span className="font-medium">Error: </span> {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">No books found in the catalog.</p>
      </div>
    );
  }

  return (
    <div>
      {books.map((book) => (
        <BookCard key={book.id} title={book.title} author={book.author} />
      ))}
    </div>
  );
};

export default BookList;
