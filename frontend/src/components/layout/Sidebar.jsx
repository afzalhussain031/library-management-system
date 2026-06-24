import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  LayoutGrid,
  BookOpen,
  Users,
  User,
  Settings,
  Info,
  Headphones,
} from "lucide-react";

// Isometric 3D Pink Box Logo SVG (Figma accurate, smaller size)
const PinkBoxLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    {/* top face */}
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F472B6" />
    {/* left face */}
    <path d="M2 7V17L12 22V12L2 7Z" fill="#EC4899" />
    {/* right face */}
    <path d="M12 12V22L22 17V7L12 12Z" fill="#DB2777" />
  </svg>
);

// Small Orange Tablet/Device SVG inside LEND / RETURN button
const OrangeDeviceIcon = () => (
  <svg width="10" height="13" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="12" height="16" rx="2" fill="#FF7A00" />
    <rect x="3" y="3" width="2" height="10" rx="0.5" fill="white" />
  </svg>
);

export default function LMSSidebar({ open, onClose, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Overview", icon: LayoutGrid, path: "/dashboard" },
    { title: "Books", icon: BookOpen, path: "/books" },
    { title: "Wishlist", icon: Users, path: "/wishlist" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "About", icon: Info, path: "/about" },
    { title: "Help & support", icon: Headphones, path: "/help" },
  ];

  // Helper to determine active menu item from current URL path
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") return "Overview";
    if (path === "/books") return "Books";
    if (path.startsWith("/wishlist")) return "Wishlist";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/about")) return "About";
    if (path.startsWith("/help")) return "Help & support";
    return "Overview";
  };

  const activeMenu = getActiveItem();

  const handleMenuClick = (item) => {
    navigate(item.path);
    if (onClose) onClose(); // close mobile sidebar drawer on click
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Layout Container - Always visible on desktop and mobile */}
      <div className="flex p-3 pr-0 gap-3 bg-transparent select-none shrink-0 h-screen">
        
        {/* Left Icon Sidebar - Always visible, compact width: 56px (w-14) & Full Height */}
        <div className="w-14 h-full bg-[#FFFBE5] rounded-[28px] flex flex-col items-center py-5 px-1 shadow-sm border border-[#FFF7D4]/40 shrink-0">
          
          {/* Header Area - Height matches the main white panel header exactly to keep lists parallel */}
          <div className="h-[88px] flex items-center justify-center shrink-0 mb-4 w-full">
            {/* Hamburger menu button toggles main panel state on mobile */}
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-yellow-100/50 rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Menu size={18} className="text-slate-800" />
            </button>
          </div>

          {/* Sequential map with same spacing rules to stay parallel */}
          <div className="flex flex-col gap-2 flex-1 w-full items-center">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.title;
              const showDivider = index === 4;

              return (
                <div key={item.title} className="flex flex-col items-center w-full">
                  {showDivider && (
                    <div className="w-6 h-[1px] bg-white my-1.5 shrink-0 opacity-80" />
                  )}
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-9 h-9 flex items-center justify-center rounded-[12px] transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-[#F6CD46] text-white shadow-md shadow-yellow-500/10"
                        : "text-[#8C95A7] hover:bg-yellow-50/50 hover:text-slate-850"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? "fill-white stroke-white stroke-[1.5]"
                          : "stroke-[2.2]"
                      }
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Sidebar Panel - Permanent on Desktop (190px), Slide drawer toggle on Mobile */}
        <div
          className={`bg-white rounded-[28px] shadow-sm flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 border-slate-100
          
          /* Mobile specific styling: fixed drawer next to yellow icon sidebar */
          fixed md:relative top-3 bottom-3 z-50 left-[76px]
          
          /* Mobile show/hide drawer states */
          ${
            open
              ? "w-[190px] p-4 py-5 opacity-100 translate-x-0 border"
              : "w-0 p-0 border-none overflow-hidden opacity-0 -translate-x-10"
          }
          
          /* Desktop overrides (always visible, width locked to 190px) */
          md:left-auto md:top-auto md:bottom-auto md:translate-x-0 md:opacity-100 md:border md:p-4 md:py-5 md:w-[190px] md:overflow-visible
          `}
        >
          {/* Header Area - Same height (88px) and margin (mb-4) to align lists */}
          <div className="h-[88px] flex flex-col justify-between shrink-0 mb-4">
            <div className="flex items-center gap-2 mt-0.5">
              <PinkBoxLogo />
              <h1 className="text-[17px] font-bold tracking-tight text-[#1E2538]">LMS</h1>
            </div>

            {/* Lend Return Button */}
            <button className="w-full bg-[#FCE49F] hover:bg-[#FAD980] text-[#332500] font-bold text-[11px] tracking-wider py-2 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-sm h-9 cursor-pointer">
              <OrangeDeviceIcon />
              LEND / RETURN
            </button>
          </div>

          {/* Menu items navigation list - Parallel items */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-0.5">
            {menuItems.map((item, index) => {
              const isActive = activeMenu === item.title;
              const showDivider = index === 4;

              return (
                <div key={item.title} className="flex flex-col">
                  {showDivider && (
                    <div className="h-[1px] bg-slate-100 my-1.5 shrink-0" />
                  )}
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`h-9 flex items-center justify-between pl-3 pr-1 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer text-left w-full
                    ${
                      isActive
                        ? "bg-[#FFF9E6] text-[#1E2538] font-semibold border-r-[3px] border-[#FF8A00] rounded-r-none"
                        : "text-[#7E8B9B] hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.title}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}