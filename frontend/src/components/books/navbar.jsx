import { useState } from "react";
import Sortby from "./sortby";
function Navbar1() {
   const [open, setOpen] = useState(false);
  return (
      <div id="navbar1">
      <nav className="w-full h-12 bg-gary-100 rounded flex items-center  px-4 justify-between">
        <ul className="hidden sm:flex space-x-6">
          <li><a href="#AllBooks" className="text-gray-700">All Books</a></li>
          <li><a href="#Available" className="text-gray-700">Available</a></li>
          <li><a href="#Recommended" className="text-gray-700">Recommended</a></li>
          
        </ul>
       
      
        <Sortby/>
        
         
          
     
         
      </nav>
 

      </div>
  );
}

export default Navbar1;
