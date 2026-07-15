import { useState, useEffect } from "react";

function Sortby({ sort, onSortChange }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex items-center text-gray-800 space-x-3">
      <label className="text-gray-800" >Sort by:</label>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {isMobile && (
          <>
            <option value="all-books">All Books</option>
            <option value="available">Available</option>
            <option value="recommended">Recommended</option>
            <option disabled>──────────</option>
          </>
        )}

        <option value="popularity">Popularity</option>
        <option value="newest">Newest</option>
        <option value="author">Author</option>
      </select>
    </div>
  );
}

export default Sortby;