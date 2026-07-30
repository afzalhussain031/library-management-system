import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

// Premium color palettes for placeholder fallbacks
const FALLBACK_PALETTES = [
  { bg: "bg-[#FEF6DD]", text: "text-[#E0B220]" },
  { bg: "bg-[#EAF2FF]", text: "text-[#4386F5]" },
  { bg: "bg-[#FFE2E5]", text: "text-[#F64E60]" },
  { bg: "bg-[#C9F7F5]", text: "text-[#1BC5BD]" },
  { bg: "bg-[#F3E8FF]", text: "text-[#A855F7]" },
  { bg: "bg-[#FFEDD5]", text: "text-[#F97316]" },
];

// Helper to get a stable color palette based on title hash
const getFallbackPalette = (title) => {
  if (!title) return FALLBACK_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_PALETTES.length;
  return FALLBACK_PALETTES[index];
};

const BookThumbnail = ({ 
  title = "Unknown", 
  coverImage = null, 
  isbn = null, 
  hoverExpand = true, 
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Construct the Open Library cover image URLs
  // Use M (medium) for default view and L (large) for hover preview
  let defaultCoverUrl = coverImage;
  let largeCoverUrl = coverImage;

  if (!defaultCoverUrl && isbn) {
    // Standardize ISBN (remove spaces, hyphens)
    const cleanIsbn = isbn.toString().trim().replace(/[-\s]/g, "");
    if (cleanIsbn) {
      defaultCoverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
      largeCoverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
    }
  } else if (defaultCoverUrl) {
    // If coverImage URL is provided, try mutating -M to -L for large view
    largeCoverUrl = defaultCoverUrl.replace("-M.jpg", "-L.jpg");
  }

  // Reset error state if cover URL changes
  useEffect(() => {
    setImageError(false);
  }, [coverImage, isbn]);

  const palette = getFallbackPalette(title);
  const initial = title ? title.charAt(0).toUpperCase() : "";

  // Render fallback placeholder
  const renderPlaceholder = (isLarge = false) => {
    const textClass = isLarge ? "text-[42px]" : "text-[18px]";
    const iconSize = isLarge ? 48 : 20;

    return (
      <div 
        className={`w-full h-full flex items-center justify-center font-bold rounded-sm shadow-sm transition-all ${palette.bg} ${palette.text}`}
      >
        {initial ? (
          <span className={textClass}>{initial}</span>
        ) : (
          <BookOpen size={iconSize} />
        )}
      </div>
    );
  };

  const hasImage = (defaultCoverUrl || largeCoverUrl) && !imageError;

  return (
    <div className="relative group select-none shrink-0">
      {/* Thumbnail Container */}
      <div className={`w-[40px] h-[50px] overflow-hidden rounded-sm shadow-sm border border-gray-100 flex items-center justify-center bg-gray-50 ${className}`}>
        {hasImage ? (
          <img 
            src={defaultCoverUrl} 
            alt={title} 
            onError={() => setImageError(true)} 
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          renderPlaceholder(false)
        )}
      </div>

      {/* Floating Desktop Hover Expand Card */}
      {hoverExpand && (
        <div 
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none 
                     hidden lg:group-hover:flex flex-col
                     w-[160px] h-[220px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden
                     opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform scale-95 origin-left group-hover:scale-100"
        >
          {hasImage ? (
            <img 
              src={largeCoverUrl} 
              alt={`${title} Cover`} 
              className="w-full h-full object-cover object-center"
              onError={() => setImageError(true)}
            />
          ) : (
            renderPlaceholder(true)
          )}
        </div>
      )}
    </div>
  );
};

export default BookThumbnail;
