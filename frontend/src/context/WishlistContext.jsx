import React, { createContext, useContext, useState, useEffect } from 'react';
import { catalog, circulation } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // We only fetch wishlist for regular users (or those with roles that have a wishlist)
  const isStudent = !currentUser?.role || currentUser?.role === 'student' || currentUser?.role === 'user';

  const fetchWishlist = async () => {
    if (!isStudent) return;
    setIsLoading(true);
    try {
      const response = await catalog.getWishlist();
      setWishlistItems(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isStudent) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [currentUser, isStudent]);

  const addToWishlist = async (bookId) => {
    try {
      await catalog.addToWishlist({ book_id: bookId });
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to wishlist");
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await catalog.removeFromWishlist(wishlistId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove from wishlist");
      throw err;
    }
  };

  const reserveItem = async (bookId, wishlistId) => {
    try {
      await circulation.createReservation({ book: bookId });
      await catalog.removeFromWishlist(wishlistId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast.success("Book reserved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reserve the book");
      throw err;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        reserveItem,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
