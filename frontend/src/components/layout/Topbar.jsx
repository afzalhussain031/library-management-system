import { Bell, SlidersHorizontal } from "lucide-react";
import profileImg from "../../assets/profile.jpg";

const Navbar = () => {
  return (
    <div className="bg-white shadow rounded-4xl px-4 md:px-8 py-3">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:justify-between">

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full md:w-100">
          <input
            type="text"
            placeholder="Search books..."
            className="bg-transparent outline-none flex-1 text-sm"
          />
          <SlidersHorizontal size={18} />
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button className="relative">
            <Bell size={20} />
          </button>

          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <img
              src={profileImg}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />

            {/* Hide username on very small screens */}
            <span className="hidden sm:block text-sm font-medium">
              User
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;