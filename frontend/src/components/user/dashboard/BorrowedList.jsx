import { useState, useEffect } from "react";
import { dashboard } from "../../../services/api";
import { ArrowRight } from "lucide-react";

export default function BorrowedList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await dashboard.getBorrowedBooks();
        const loansList = Array.isArray(response) ? response : response.results || [];
        
        // Filter only active loans (not returned)
        const borrowedBooks = loansList
          .filter(loan => !loan.returned_at)
          .slice(0, 3) // Show only first 3
          .map(loan => ({
            title: loan.copy?.book?.title || "Unknown Title",
            author: loan.copy?.book?.author || "Unknown Author",
            date: new Date(loan.borrowed_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })
          }));
        
        setBooks(borrowedBooks);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full flex items-center justify-center">
        <p className="text-gray-500">Loading borrowed books...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">My Borrowed Books</h2>
        <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
          See All →
        </button>
      </div>

      {books.length === 0 ? (
        <p className="text-gray-500 text-sm">No borrowed books</p>
      ) : (
        books.map((book, i) => (
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