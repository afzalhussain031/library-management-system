import React from "react";
import BookCard from "./bookcard";

const books = [
  { id: 1, title: "Atomic Habits", author: "James Clear" },
  { id: 2, title: "Clean Code", author: "Robert C. Martin" },
  { id: 3, title: "1984", author: "George Orwell" },
  { id: 4, title: "Python Crash Course", author: "Eric Matthes" },
  { id: 5, title: "Deep Work", author: "Cal Newport" },
  

];

const BookList = () => {
  return (
    <div>
      {books.map((book, index) => (
        <BookCard key={book.id} title={book.title} author={book.author} />
      ))}
    </div>
   
  )}
    

export default BookList;
