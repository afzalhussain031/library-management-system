import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Pages.css";
import { fetchBooks, addBook, deleteBook } from "../services/api";

interface FormErrors {
  title?: string;
  author?: string;
  isbn?: string;
  published_date?: string;
  general?: string;
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    load();
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const usr = JSON.parse(stored);
        setIsStaff(Boolean(usr.is_staff));
      }
    } catch (e) {
      setIsStaff(false);
    }
  }, []);

  async function load() {
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch books", err);
      setBooks([]);
    }
  }

  // Client-side validation
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!publishedDate) newErrors.published_date = "Published date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Form submission with validation
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    // Step 1: Validate client-side
    if (!validateForm()) return;

    try {
      // Step 2: Submit to API (backend validates again)
      await addBook({
        title,
        author,
        isbn,
        published_date: publishedDate,
      });

      // Step 3: Reset form on success
      setTitle("");
      setAuthor("");
      setIsbn("");
      setPublishedDate("");
      setErrors({});

      // Step 4: Refresh book list
      await load();
    } catch (err: any) {
      // Display server-side validation error to user
      setErrors({
        general: err.message || "Failed to add book",
      });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
      await load();
    } catch (err) {
      alert("Delete failed (staff only)");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>📖 Manage Books</h1>
        <p>View, add, and manage library books</p>
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
                />
                {errors.published_date && (
                  <p className="error">{errors.published_date}</p>
                )}
              </div>

              {errors.general && <p className="error">{errors.general}</p>}

              <button type="submit">Add Book</button>
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
