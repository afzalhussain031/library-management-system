import { Bell, SlidersHorizontal, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import profileImg from "../../assets/profile.jpg";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-white shadow rounded-4xl px-4 md:px-8 py-3">
      <div className="flex flex-row items-center justify-between gap-4 md:gap-0">

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-full md:w-100">
          <input
            type="text"
            placeholder="Search books..."
            className="bg-transparent outline-none flex-1 text-sm"
          />
          <SlidersHorizontal size={18} />
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-3 md:gap-4 flex-1 md:flex-none">
          
          {/* Subtle Reading Progress Ring (Students Only) */}
          {(!currentUser?.role || currentUser?.role === 'student') && (
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-full group cursor-pointer">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                <path className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-500" stroke="currentColor" strokeWidth="3" strokeDasharray="50, 100" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="text-[10px] font-bold text-gray-600 z-10 leading-none mt-0.5">5</span>
              
              {/* Tooltip on hover */}
              <div className="absolute top-10 right-1/2 translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center">
                Semester Goal: 5 out of 10 books read. Keep going!
              </div>
            </div>
          )}

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
              {currentUser?.student_name ||
                `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
                currentUser?.user_id ||
                "User"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;