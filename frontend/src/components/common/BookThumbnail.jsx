import React, { useState, useEffect } from 'react';

const BOOK_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400', 
  'bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 
  'bg-indigo-400', 'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 
  'bg-pink-400', 'bg-rose-400'
];

const getColorForBook = (title) => {
  if (!title) return 'bg-gray-400';
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BOOK_COLORS.length;
  return BOOK_COLORS[index];
};

const BookThumbnail = ({ title, coverImage, hoverExpand = false, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const [highResError, setHighResError] = useState(false);

  // Reset error states when cover image changes
  useEffect(() => {
    setImgError(false);
    setHighResError(false);
  }, [coverImage]);

  const initial = title ? title.charAt(0).toUpperCase() : 'B';
  const colorClass = getColorForBook(title);

  // URL mutation to fetch high-res image (replace -M.jpg with -L.jpg)
  const highResUrl = coverImage ? coverImage.replace('-M.jpg', '-L.jpg') : null;

  // Desktop default 40x50px, mobile default 48x60px
  const thumbnailClasses = className || "w-[48px] h-[60px] md:w-[40px] md:h-[50px] shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden select-none transition-all duration-200 hover:scale-[1.03]";

  const renderSmallThumbnail = () => {
    if (coverImage && !imgError) {
      return (
        <img
          src={coverImage}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return (
      <div className={`w-full h-full ${colorClass} flex items-center justify-center rounded-lg text-sm md:text-xs font-bold text-white uppercase`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="group relative flex items-center shrink-0">
      {/* Default State (small thumbnail) */}
      <div className={thumbnailClasses}>
        {renderSmallThumbnail()}
      </div>

      {/* Hover State (Desktop only, hidden on mobile screens below md) */}
      {hoverExpand && (coverImage || title) && (
        <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out origin-left">
          <div className="bg-white p-2.5 rounded-2xl shadow-2xl border border-gray-100/80 flex flex-col items-center min-w-[170px] max-w-[200px]">
            {/* Enlarged image preview: 150x200px */}
            <div className="w-[150px] h-[200px] rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 select-none shadow-md">
              {highResUrl && !highResError ? (
                <img
                  src={highResUrl}
                  alt={title}
                  onError={() => setHighResError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${colorClass} flex items-center justify-center text-4xl font-black text-white uppercase`}>
                  {initial}
                </div>
              )}
            </div>
            {title && (
              <span className="text-[11px] font-bold text-gray-800 mt-2 truncate w-[140px] text-center">
                {title}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookThumbnail;
