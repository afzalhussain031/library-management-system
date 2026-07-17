import { useNavigate } from "react-router-dom";
import { dashboard } from "../../../services/api";
import { ArrowRight } from "lucide-react";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonText } from "../../common/Skeleton";

export default function BorrowedList() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useApi(dashboard.getBorrowedBooks, []);
  const loansList = Array.isArray(data) ? data : data?.results || [];
  
  // Filter only active loans (not returned)
  const borrowedBooks = loansList
    .filter(loan => !loan.returned_at)
    .slice(0, 3) // Show only first 3
    .map(loan => ({
      title: loan.book_title || "Unknown Title",
      author: loan.book_author || "Unknown Author",
      date: new Date(loan.due_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    }));



  // Remove early loading return

  if (error) {
    return (
      <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">My Borrowed Books</h2>
        <button 
          onClick={() => navigate('/my-loans')}
          className="text-sm text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
        >
          See All →
        </button>
      </div>

      {loading ? (
        [1, 2, 3].map(key => (
          <div key={key} className="flex justify-between items-center mb-4">
            <div className="space-y-2">
              <SkeletonText className="h-4 w-32" />
              <SkeletonText className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2 flex flex-col items-end">
              <SkeletonText className="h-3 w-16" />
              <SkeletonText className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))
      ) : borrowedBooks.length === 0 ? (
        <p className="text-gray-500 text-sm">No borrowed books</p>
      ) : (
        borrowedBooks.map((book, i) => (
          <div key={i} className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">{book.date}</p>
              <button className="bg-yellow-400 px-4 py-1 rounded-full text-sm mt-1 text-black font-medium hover:bg-yellow-500 transition hover:scale-[1.01] cursor-pointer">
                Renew
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}