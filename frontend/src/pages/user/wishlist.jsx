import React, { useState, useEffect } from "react";

import Navbar from "../../components/user/wishlist/Navbar";
import BookList from "../../components/user/wishlist/BookList";
import { catalog, circulation } from "../../services/api";
import { toast } from "react-hot-toast";
export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReservingAll, setIsReservingAll] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await catalog.getWishlist();
      setWishlistItems(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch wishlist items.");
      toast.error(err.response?.data?.message || "Failed to fetch wishlist items.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserveAll = async () => {
    if (wishlistItems.length === 0) return;
    setIsReservingAll(true);
    try {
      await Promise.all(
        wishlistItems.map((item) =>
          circulation.createReservation({ book: item.book.id })
        )
      );
      // Remove all items from wishlist after successful reservation
      await Promise.all(
        wishlistItems.map((item) =>
          catalog.removeFromWishlist(item.id)
        )
      );
      setWishlistItems([]);
      toast.success("All books reserved successfully!");
    } catch (err) {
      console.error("Error reserving all books:", err);
      toast.error(err.response?.data?.message || "Failed to reserve some books. Please try again.");
    } finally {
      setIsReservingAll(false);
    }
  };

  const handleSortChange = (newSort) => {
    const sorted = [...wishlistItems];
    if (newSort === "Newest") {
       sorted.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
    } else if (newSort === "author") {
       sorted.sort((a, b) => (a.book?.author || "").localeCompare(b.book?.author || ""));
    } else {
       sorted.sort((a, b) => (a.book?.title || "").localeCompare(b.book?.title || ""));
    }
    setWishlistItems(sorted);
  };

  return (
    <div className=" flex flex-col rounded-[20px] bg-[#F5F5F5]  mx-auto bg-linear-to-r from-gray-150 to-yellow-100 min-h-screen">
      <div className="shrink-0">
        <Navbar onSortChange={handleSortChange} />
      </div>
      <div className=" flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading wishlist...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            <p>{error}</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>Your wishlist is empty.</p>
          </div>
        ) : (
          <BookList items={wishlistItems} setItems={setWishlistItems} />
        )}
      </div>
      <div className="mt-auto flex flex-col px-4 py-4">
          <div className="flex  flex-wrap  justify-center sm:justify-between gap-5 items-center">
             <div className="w-0 sm:w-38" />
             <span className="bg-yellow-200 rounded-full text-sm px-4 py-1 text-gray-700">
               {wishlistItems.length} items
             </span>
             <button 
               onClick={handleReserveAll}
               disabled={wishlistItems.length === 0 || isReservingAll}
               className="bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-yellow-400 transition hover:scale-[1.01] text-lg text-black font-medium px-4 py-2 rounded-xl flex items-center gap-2 w-42 justify-center"
             >
               {isReservingAll ? "Reserving..." : "Reserve All"}
             </button>
          </div>
      </div>
    </div>
  );
}
