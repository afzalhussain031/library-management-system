import { useNavigate } from "react-router-dom";
import { catalog } from "../../../services/api";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonCard } from "../../common/Skeleton";

export default function Recommended() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useApi(catalog.getBooks, []);
  
  const bookList = Array.isArray(data) ? data : data?.results || [];
  const recommendedBooks = bookList.slice(0, 4).map(book => ({
    id: book.id,
    title: book.title || "Unknown Title",
    cover: book.cover_image || null
  }));



  // Remove early loading return

  if (error) {
    return (
      <div className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 h-full">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recommended For You</h2>
        <button 
          onClick={() => navigate('/books')}
          className="text-sm text-gray-600 hover:text-black flex items-center gap-1 hover:scale-105 transition cursor-pointer"
        >
          View All →
        </button>
      </div>

      <div className="flex gap-4 items-center overflow-x-auto">
        {loading ? (
          [1, 2, 3, 4].map(key => (
            <SkeletonCard key={key} className="w-25 min-w-20 h-29 rounded-md shrink-0" />
          ))
        ) : (
          recommendedBooks.map((book) => (
            <div
              key={book.id}
              className="w-25 min-w-20 h-29 bg-gray-200 rounded-md flex items-center justify-center text-[10px] text-center text-gray-600 cursor-pointer shrink-0 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:shadow-md p-2"
            >
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-md" />
              ) : (
                book.title
              )}
            </div>
          ))
        )}

        <div className="text-xl text-gray-400 cursor-pointer hover:text-black">→</div>
      </div>
    </div>
  );
}