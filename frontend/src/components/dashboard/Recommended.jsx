export default function Recommended() {
  const books = [
    "Deep Work book cover",
    "Educated book cover",
    "Clean Code book cover",
    "Atomic Habits cover",
  ];

  return (
    <div className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recommended For You
        </h2>

        <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1 hover:scale-105 transition">
          View All →
        </button>
      </div>

      {/* Books */}
      <div className="flex gap-4 items-center overflow-x-auto">
        {books.map((title, i) => (
          <div
            key={i}
            className="w-25 min-w-20 h-29 bg-gray-200 rounded-md 
             flex items-center justify-center 
             text-[10px] text-center text-gray-600 
             cursor-pointer shrink-0 
             transition-all duration-200 
             hover:bg-yellow-400 hover:text-black hover:shadow-md">
            {title}
          </div>
        ))}

        {/* Arrow Button */}
        <div className="text-xl text-gray-400 cursor-pointer hover:text-black">
          →
        </div>
      </div>
    </div>
  );
}
