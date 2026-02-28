/**
 * useBooks Hook
 * Custom hook for book-related operations
 * Provides CRUD functions for books
 */

import { useState, useCallback } from "react";
import { bookService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import type { Book } from "../types";

interface UseBooksState {
  books: Book[];
  loading: boolean;
  error: string | null;
}

export const useBooks = () => {
  const [state, setState] = useState<UseBooksState>({
    books: [],
    loading: false,
    error: null,
  });

  /**
   * Fetch all books from server
   */
  const fetchBooks = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const books = await bookService.fetchAll();
      setState((prev) => ({ ...prev, books, loading: false }));
      return books;
    } catch (err) {
      const errorMsg = handleError(err);
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      throw err;
    }
  }, []);

  /**
   * Add a new book
   */
  const addBook = useCallback(async (bookData: Book) => {
    try {
      const newBook = await bookService.create(bookData);
      setState((prev) => ({
        ...prev,
        books: [...prev.books, newBook],
      }));
      return newBook;
    } catch (err) {
      const errorMsg = handleError(err);
      throw new Error(errorMsg);
    }
  }, []);

  /**
   * Update an existing book
   */
  const updateBook = useCallback(
    async (bookId: number, bookData: Partial<Book>) => {
      try {
        const updatedBook = await bookService.update(bookId, bookData);
        setState((prev) => ({
          ...prev,
          books: prev.books.map((b) => (b.id === bookId ? updatedBook : b)),
        }));
        return updatedBook;
      } catch (err) {
        const errorMsg = handleError(err);
        throw new Error(errorMsg);
      }
    },
    [],
  );

  /**
   * Delete a book
   */
  const deleteBook = useCallback(async (bookId: number) => {
    try {
      await bookService.delete(bookId);
      setState((prev) => ({
        ...prev,
        books: prev.books.filter((b) => b.id !== bookId),
      }));
    } catch (err) {
      const errorMsg = handleError(err);
      throw new Error(errorMsg);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    books: state.books,
    loading: state.loading,
    error: state.error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    clearError,
  };
};
