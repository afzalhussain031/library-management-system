import { useState, useEffect, useRef } from "react";
import { Bell, SlidersHorizontal, LogOut, Loader2, Search, Book, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import profileImg from "../../assets/profile.jpg";
import NotificationDropdown from "./NotificationDropdown";
import WishlistDropdown from "./WishlistDropdown";
import { toast } from "react-hot-toast";
import { useDebounce } from "../../hook/useDebounce";
import { catalog } from "../../services/api";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  const isStudent = !currentUser?.role || currentUser?.role === 'student' || currentUser?.role === 'user';

  // Handle Search
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      setIsDropdownOpen(true);
      catalog.globalSearch(debouncedSearchTerm)
        .then(res => {
          setResults(res.data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setIsSearching(false);
        });
    } else {
      setResults(null);
      setIsDropdownOpen(false);
    }
  }, [debouncedSearchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const handleResultClick = (type, id) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    if (type === 'book') {
      navigate(`/books?search_book=${id}`);
    } else if (type === 'user') {
      navigate(`/admin/members?search_user=${id}`);
    }
  };

  return (
    <div className="bg-white shadow rounded-4xl px-4 md:px-8 py-3">
      <div className="flex flex-row items-center justify-between gap-4 md:gap-0">

        {/* Search Bar Container */}
        <div className="hidden md:flex relative w-full md:w-100" ref={searchRef}>
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-sm">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search books, authors..."
              className="bg-transparent outline-none flex-1 text-sm text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
              }}
            />
            {isSearching ? (
              <Loader2 size={16} className="text-indigo-500 animate-spin" />
            ) : (
              <SlidersHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-indigo-600" />
            )}
          </div>

          {/* Search Dropdown */}
          {isDropdownOpen && (searchQuery.trim().length > 0) && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[400px]">
              
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" /> Searching...
                </div>
              ) : (
                <div className="overflow-y-auto p-2">
                  
                  {/* Books Section */}
                  {results?.books?.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-1 mb-1">Books</div>
                      {results.books.map(book => (
                        <div 
                          key={`book-${book.id}`}
                          onClick={() => handleResultClick('book', book.id)}
                          className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                        >
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-8 h-10 object-cover rounded shadow-sm" />
                          ) : (
                            <div className="w-8 h-10 bg-indigo-100 rounded flex items-center justify-center text-indigo-400">
                              <Book size={16} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{book.title}</p>
                            <p className="text-xs text-gray-500 truncate">{book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Users Section (Admin only) */}
                  {results?.users?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-1 mb-1 border-t pt-2">Users</div>
                      {results.users.map(user => (
                        <div 
                          key={`user-${user.id}`}
                          onClick={() => handleResultClick('user', user.id)}
                          className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 shrink-0">
                            <User size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.user_id} • {user.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {results && results.books?.length === 0 && results.users?.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-3 md:gap-4 flex-1 md:flex-none">
          
          {/* Subtle Reading Progress Ring (Students Only) */}
          {isStudent && (
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

          {isStudent && <WishlistDropdown />}
          <NotificationDropdown />

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