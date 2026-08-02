import { useNavigate } from "react-router-dom";
import { catalog } from "../../../services/api";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonCard } from "../../common/Skeleton";

export default function Recommended() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useApi(catalog.getRecommendations, null);
  
  const bookList = data?.results || [];

  const recommendedBooks = bookList.slice(0, 5).map(book => ({
    id: book.id,
    title: book.title || "Unknown Title",
    author: book.author || "",
    cover: book.cover_image || null
  }));

  if (error) {
    return (
      <div className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 h-[260px]">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 h-[260px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          <button 
            onClick={() => navigate('/books', { state: { initialFilter: 'Recommended' } })}
            className="text-sm text-gray-600 hover:text-black flex items-center gap-1 hover:scale-105 transition cursor-pointer"
          >
            View All →
          </button>
        </div>
 
        <div className="flex gap-4 items-center overflow-x-auto pt-1 pb-2">
          {loading ? (
            [1, 2, 3, 4].map(key => (
              <SkeletonCard key={key} className="w-25 min-w-20 h-29 rounded-md shrink-0" />
            ))
          ) : (
            recommendedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate('/books', { state: { initialFilter: 'Recommended' } })}
                title={`${book.title} ${book.author ? `by ${book.author}` : ''}`}
                className="w-25 min-w-20 h-29 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-[10px] text-center font-medium text-gray-700 cursor-pointer shrink-0 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:shadow-md p-2"
              >
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <span className="line-clamp-3">{book.title}</span>
                )}
              </div>
            ))
          )}
 
          <div 
            onClick={() => navigate('/books', { state: { initialFilter: 'Recommended' } })}
            className="text-xl text-gray-400 cursor-pointer hover:text-black transition pl-1"
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
}