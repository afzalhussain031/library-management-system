import { useState } from "react";

function Sortby() {
  const [sortBy, setSortBy] = useState("popularity");

  return (
    <div className="flex items-center text-gray-700  sm:space-x-3">
      <label>Sort by:</label>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="popularity">Popularity</option>
        <option value="Newest">Newest</option>
        <option value="author">Author</option>
      </select>
    </div>
  );
}


export default Sortby;
