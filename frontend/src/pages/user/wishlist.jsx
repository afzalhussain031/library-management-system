import React from "react"

import Navbar from "../../components/wishlist/navbar.jsx";
import BookList from "../../components/wishlist/booklist.jsx";


export default function Wishlist() {
  return (
    <div className=" flex flex-col rounded-[20px] bg-[#F5F5F5]  mx-auto bg-linear-to-r from-gray-150 to-yellow-100 min-h-screen">
      <div className="shrink-0">
        <Navbar/>
      
      </div>
      <div className=" flex-1 overflow-y-auto px-4">
      <BookList />
      </div>
      <div className="mt-auto flex flex-col px-4 py-4">
          <div className="flex  flex-wrap  justify-center sm:justify-between gap-5">
                <div className="w-0 sm:w-38" />
       
             <button className="bg-yellow-200 cursor-pointer hover:bg-yellow-400 transition   rounded-full text-sm  px-4 py-1   text-gray-700"> 1-25 of 21 → </button>
          
          
             <button className="bg-yellow-300 cursor-pointer hover:bg-yellow-400 transition hover:scale-[1.01] text-lg text-black font-medium px-4 py-2 rounded-xl flex items-center gap-2 w-36 justify-center ">Borrow All</button>
          </div>
      </div>
    </div>
  
  
    
  



  

    
    
  );
}

