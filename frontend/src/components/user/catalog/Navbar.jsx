import { useState } from "react";
import Sortby from "./sortby";
function Navbar1({ filter, onFilterChange, sort, onSortChange }) {
   const [open, setOpen] = useState(false);
  return (
      <div id="navbar1">
      <nav className="w-full h-12 bg-gary-100 rounded flex items-center  px-4 justify-between">
        <ul className="hidden sm:flex space-x-6">
          <li>
            <button 
              onClick={() => onFilterChange('AllBooks')} 
              className={filter === 'AllBooks' ? "text-yellow-600 font-semibold cursor-pointer" : "text-gray-700 cursor-pointer"}
            >
              All Books
            </button>
          </li>
          <li>
            <button 
              onClick={() => onFilterChange('Available')} 
              className={filter === 'Available' ? "text-yellow-600 font-semibold cursor-pointer" : "text-gray-700 cursor-pointer"}
            >
              Available
            </button>
          </li>
          <li>
            <button 
              onClick={() => onFilterChange('Recommended')} 
              className={filter === 'Recommended' ? "text-yellow-600 font-semibold cursor-pointer" : "text-gray-700 cursor-pointer"}
            >
              Recommended
            </button>
          </li>
          
        </ul>
       
      
        <Sortby sort={sort} onSortChange={onSortChange}/>
        
         
          
     
         
      </nav>
 

      </div>
  );
}

export default Navbar1;
