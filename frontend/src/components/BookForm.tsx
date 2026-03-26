import React, { useState } from "react";
import type { BookFormProps } from "../types";

const BookForm: React.FC<BookFormProps> = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [author, setAuthor] = useState(initialData ? initialData.author : "");
  const [isbn, setIsbn] = useState(initialData ? initialData.isbn : "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn) {
      setError("All fields are required");
      return;
    }
    setError("");
    onSubmit({ title, author, isbn });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label>Author:</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>
      <div>
        <label>ISBN:</label>
        <input
          type="text"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
};

export default BookForm;

