import React from "react";
import BookCard from "./bookcard";
import { catalog, circulation } from "../../../services/api";

const BookList = ({ items, setItems }) => {
  const handleReserve = async (bookId, wishlistId) => {
    try {
      await circulation.createReservation({ book: bookId });
      await catalog.removeFromWishlist(wishlistId);
      setItems((prev) => prev.filter((item) => item.id !== wishlistId));
      alert("Book reserved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to reserve the book.");
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      await catalog.removeFromWishlist(wishlistId);
      setItems((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove from wishlist.");
    }
  };

  return (
    <div>
      {items.map((item) => (
        <BookCard 
          key={item.id} 
          title={item.book?.title} 
          author={item.book?.author} 
          onReserve={() => handleReserve(item.book?.id, item.id)}
          onRemove={() => handleRemove(item.id)}
        />
      ))}
    </div>
  );
};

export default BookList;
