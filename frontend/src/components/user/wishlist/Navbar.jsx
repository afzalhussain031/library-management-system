import SortBy from "./sortby";
function Navbar() {
  return (
      <div id="navbar1" >
      <nav className="w-full h-12 bg-gary-100 rounded flex items-center px-4 py-7 justify-between">
        <ul className="flex space-x-6">
          <li><h1 className=" font-semibold text-lg sm:text-xl  md:text-2xl text-gray-800 ">Wishlist</h1></li>
         

          
        </ul>
         <SortBy />
      </nav>
      </div>
  );
}

export default Navbar;
