import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { catalog } from "../../../services/api";
import BookThumbnail from "../../common/BookThumbnail";

const BookCard = ({ id, title, author, coverImage, initialWishlistId, onWishlistToggle }) => {
  
  const [wishlistId, setWishlistId] = useState(initialWishlistId);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setWishlistId(initialWishlistId);
  }, [initialWishlistId]);

  const liked = !!wishlistId;

  const handleLikeClick = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (liked) {
        await catalog.removeFromWishlist(wishlistId);
        setWishlistId(null);
      } else {
        const response = await catalog.addToWishlist({ book_id: id });
        setWishlistId(response.id || response.data?.id);
      }
      if (onWishlistToggle) {
        onWishlistToggle();
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-between items-center w-full p-4 bg-white shadow rounded-[20px] mb-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <BookThumbnail title={title} coverImage={coverImage} hoverExpand={true} />
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-800 text-lg truncate">{title}</h3>
          <p className="text-gray-600 truncate">by {author}</p>
        </div>
      </div>
      <button 
        className={`cursor-pointer shrink-0 ml-4 ${isUpdating ? "opacity-50" : ""}`}
        onClick={handleLikeClick}
        disabled={isUpdating}
      >
        <Heart
          color={liked ? "red" : "gray"}   
          fill={liked ? "red" : "none"}   
          size={24}                        
        />     
     </button>
    </div>
  );
};

export default BookCard;
