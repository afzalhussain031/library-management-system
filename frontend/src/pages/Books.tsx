import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBooks } from "../hooks/useBooks";
import "../styles/Pages.css";
import type { FormErrors } from "../types";

/**
 * Books Page
 * Displays book list and form to add/delete books (staff only)
 * Uses useAuth hook for user info and useBooks hook for book CRUD
 */
const Books: React.FC = () => {
  const { user } = useAuth();
  const { books, fetchBooks, addBook, deleteBook } = useBooks();
  const isStaff = user?.is_staff || false;

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Load books on mount
  useEffect(() => {
    const load = async () => {
      try {
        await fetchBooks();
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    };
    load();
  }, [fetchBooks]);

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!publishedDate) newErrors.published_date = "Published date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission with validation
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await addBook({
        title,
        author,
        isbn,
        published_date: publishedDate,
      });

      // Reset form on success
      setTitle("");
      setAuthor("");
      setIsbn("");
      setPublishedDate("");
      setErrors({});
    } catch (err: any) {
      setErrors({
        general: err.message || "Failed to add book",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
    } catch (err) {
      alert("Delete failed (staff only)");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>📖 Manage Books</h1>
        <p>
          {isStaff
            ? "You can add, edit, and delete books"
            : "View books in the library"}
        </p>
      </div>

      <div className="page-content">
        <div className="books-actions">
          <h2>Books</h2>

          {isStaff ? (
            <form onSubmit={handleAdd} className="add-book-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  disabled={loading}
                />
                {errors.title && <p className="error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  disabled={loading}
                />
                {errors.author && <p className="error">{errors.author}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Enter ISBN"
                  disabled={loading}
                />
                {errors.isbn && <p className="error">{errors.isbn}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="publishedDate">Published Date</label>
                <input
                  id="publishedDate"
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  disabled={loading}
                />
                {errors.published_date && (
                  <p className="error">{errors.published_date}</p>
                )}
              </div>

              {errors.general && <p className="error">{errors.general}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Book"}
              </button>
            </form>
          ) : (
            <div style={{ opacity: 0.9, fontStyle: "italic" }}>
              Login as staff to add books.
            </div>
          )}
        </div>

        <ul className="book-list">
          {books.map((b) => (
            <li key={b.id} className="book-item">
              <div>
                <strong>{b.title}</strong>
                {b.author ? <span> — {b.author}</span> : null}
                {b.published_date ? (
                  <span className="date"> • {b.published_date}</span>
                ) : null}
              </div>
              <div>
                {isStaff ? (
                  <button onClick={() => handleDelete(b.id)}>Delete</button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Books;
