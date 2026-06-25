import React, { useState } from "react";
import { Heart } from "lucide-react";



const BookCard = ({ title, author }) => {
  
  const [liked, setLiked] = useState(false);

  return (
    <div className=" flex justify-between items-center w-full-screen  h-xl p-4 bg-white shadow rounded-[20px] mb-4">
      <div>
        <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
        <p className="text-gray-600">by {author}</p>
      </div>
      <button className= "cursor-pointer "onClick={() => setLiked(!liked)}>
        <Heart
          color={liked ? "red" : "gray"}   
          fill={liked ? "red" : "none"}   
          size={24}                        
        />     
     </button>
     


      
      
      
    </div>
  );
};

export default BookCard;
