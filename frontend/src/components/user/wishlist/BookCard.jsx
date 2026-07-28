import React from "react";

const BookCard = ({ title, author, onReserve, onRemove }) => {
  return (
    <div className="flex justify-between items-center w-full p-4 bg-white shadow rounded-[20px] mb-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        <p className="text-gray-600">by {author}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 font-medium px-4 py-2 cursor-pointer transition"
        >
          Remove
        </button>
        <button 
          onClick={onReserve}
          className="bg-yellow-400 cursor-pointer hover:bg-yellow-500 transition hover:scale-[1.01] text-black font-medium px-6 py-2 rounded-xl text-center"
        >
          Reserve
        </button>
      </div>
   </div>
  );
};

export default BookCard;
