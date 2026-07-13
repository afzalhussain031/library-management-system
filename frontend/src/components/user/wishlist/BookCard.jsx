import React, { useState } from "react";



const BookCard = ({ title, author }) => {
  

  return (
    <div className=" flex justify-between items-center w-full   p-4 bg-white shadow rounded-[20px] mb-4">
      <div  className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        <p className="text-gray-600">by {author}</p>
      </div>
     
     <button className="bg-yellow-400 cursor-pointer  hover:bg-yellow-500 transition hover:scale-[1.01]  text-black font-medium px-6 py-2 rounded-xl text-center ">Borrow
     </button>
   </div>
  );
};

export default BookCard;
