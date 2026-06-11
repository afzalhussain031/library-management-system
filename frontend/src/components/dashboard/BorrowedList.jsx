import { ArrowRight } from "lucide-react";
const books = [
  { title: "Atomic Habits", author: "James Clear", date: "02 Dec 2022" },
  { title: "Python Basics", author: "Eric Matthews", date: "30 Dec 2022" },
  {
    title: "Critique of Pure...",
    author: "Immanuel Kant",
    date: "15 Nov 2022",
  },
];

export default function BorrowedList() {
  return (
    <div className="bg-white p-4 rounded-4xl shadow-sm text-gray-900 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">My Borrowed Books</h2>

        <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
          See All →
        </button>
      </div>

      {books.map((book, i) => (
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
      ))}
    </div>
  );
}
