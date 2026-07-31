import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

// Premium color palettes for placeholder fallbacks with gradient support
const FALLBACK_PALETTES = [
  { bg: "bg-[#FEF6DD]", text: "text-[#E0B220]", grad: "from-[#FEF6DD] to-[#FCE49F]" },
  { bg: "bg-[#EAF2FF]", text: "text-[#4386F5]", grad: "from-[#EAF2FF] to-[#C2DAFF]" },
  { bg: "bg-[#FFE2E5]", text: "text-[#F64E60]", grad: "from-[#FFE2E5] to-[#FFC4CB]" },
  { bg: "bg-[#C9F7F5]", text: "text-[#1BC5BD]", grad: "from-[#C9F7F5] to-[#A3FAF6]" },
  { bg: "bg-[#F3E8FF]", text: "text-[#A855F7]", grad: "from-[#F3E8FF] to-[#E2C4FF]" },
  { bg: "bg-[#FFEDD5]", text: "text-[#F97316]", grad: "from-[#FFEDD5] to-[#FFD8B3]" },
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
  author = null,
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
    if (isLarge) {
      return (
        <div 
          className={`w-full h-full flex flex-col justify-between p-4 rounded-xl relative overflow-hidden bg-gradient-to-br ${palette.grad} ${palette.text}`}
        >
          {/* Spine simulation */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10 backdrop-blur-[1px]" />
          
          {/* Top Section */}
          <div className="flex justify-between items-start pl-1.5">
            <BookOpen size={20} className="opacity-80" />
            <span className="text-[9px] font-extrabold tracking-wider opacity-60 uppercase">LIBRARY</span>
          </div>

          {/* Middle Section: Title & Author */}
          <div className="flex-1 flex flex-col justify-center pl-1.5 py-4">
            <span className="font-extrabold text-[14px] leading-tight line-clamp-4 tracking-tight drop-shadow-sm font-sans">
              {title}
            </span>
            {author && (
              <span className="text-[10px] font-semibold opacity-70 mt-1 truncate">
                by {author}
              </span>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-center pl-1.5 border-t border-black/5 pt-2">
            <span className="text-[8px] font-bold tracking-wider opacity-50">CLASSIC</span>
            <span className="text-[8px] font-mono tracking-wider opacity-50">
              #{isbn ? isbn.toString().trim().replace(/[-\s]/g, "").slice(-4) : 'BOOK'}
            </span>
          </div>
        </div>
      );
    }

    const initial = title ? title.charAt(0).toUpperCase() : "";
    return (
      <div 
        className={`w-full h-full flex items-center justify-center font-bold rounded-sm shadow-sm transition-all ${palette.bg} ${palette.text}`}
      >
        {initial ? (
          <span className="text-[18px]">{initial}</span>
        ) : (
          <BookOpen size={20} />
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
          className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none 
                     hidden lg:flex flex-col
                     w-[180px] h-[260px] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden
                     opacity-0 invisible group-hover:opacity-100 group-hover:visible
                     shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]
                     transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0"
        >
          {hasImage ? (
            <div className="relative w-full h-full">
              {/* Spine simulation */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10 backdrop-blur-[1px] z-10" />
              {/* Cover Image */}
              <img 
                src={largeCoverUrl} 
                alt={`${title} Cover`} 
                className="w-full h-full object-cover object-center"
                onError={() => setImageError(true)}
              />
              {/* Subtle glass overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
              {/* Bottom text info overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 text-white flex flex-col justify-end z-10">
                <p className="font-bold text-[13px] leading-snug line-clamp-2 drop-shadow-sm font-sans">
                  {title}
                </p>
                {author && (
                  <p className="text-[10px] text-gray-300 font-medium truncate mt-0.5 font-sans">
                    by {author}
                  </p>
                )}
              </div>
            </div>
          ) : (
            renderPlaceholder(true)
          )}
        </div>
      )}
    </div>
  );
};

export default BookThumbnail;
