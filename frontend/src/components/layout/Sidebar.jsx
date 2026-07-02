import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
// NEW: Import your Auth Context and the Navigation configuration
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_MENU } from "../../config/navigation";

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

export default function LMSSidebar({ open, onClose, onToggle, onOpenLendModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  // NEW: Grab the current logged-in user from context
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'user'; // Fallback to 'user'
  // NEW: Filter the imported menu based on the user's role
  const accessibleMenuItems = SIDEBAR_MENU.filter((item) => 
    item.allowedRoles.includes(userRole)
  );
  
  // Helper to determine active menu item from current URL path
  const getActiveItem = () => {
    const path = location.pathname;
    
    // Admin Routes
    if (path.includes("/admin/dashboard")) return "Overview"; // Note: Title is Overview in config
    if (path.includes("/admin/books")) return "Inventory"; // Note: Title is Inventory in config
    if (path.includes("/admin/circulation")) return "Circulation";
    if (path.includes("/admin/members")) return "Members";
    if (path.includes("/admin/reservations")) return "Reservations";
    if (path.includes("/admin/fines")) return "Fines & Payments";
    if (path.includes("/admin/reports")) return "Reports";

    // User Routes
    if (path === "/dashboard" || path === "/") return "Dashboard";
    if (path === "/books") return "Browse Books";
    if (path.startsWith("/wishlist")) return "Wishlist";
    
    // Shared Routes
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/help")) return "Help";
    
    return "Dashboard"; // Default fallback
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
          
          {/* Header Area */}
          <div className="h-[88px] flex items-center justify-center shrink-0 mb-4 w-full">
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-yellow-100/50 rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Menu size={18} className="text-slate-800" />
            </button>
          </div>

          {/* Sequential map for Icon Sidebar */}
          <div className="flex flex-col gap-2 flex-1 w-full items-center">
            {accessibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.title;
              
              // NEW: We now use the property from the config file!
              const showDivider = item.divider === true; 

              return (
                <div key={item.title} className="flex flex-col items-center w-full">
                  {/* Note: I moved the divider below the button for better layout flow */}
                  <button
                    onClick={() => handleMenuClick(item)}
                    title={item.title}
                    className={`w-9 h-9 flex items-center justify-center rounded-[12px] transition-all duration-200 cursor-pointer
                    ${isActive ? "bg-[#F6CD46] text-white shadow-md shadow-yellow-500/10" : "text-[#8C95A7] hover:bg-yellow-50/50 hover:text-slate-850"}`}
                  >
                    <Icon size={16} className={isActive ? "fill-white stroke-white stroke-[1.5]" : "stroke-[2.2]"} />
                  </button>
                  {showDivider && (
                    <div className="w-6 h-[1px] bg-gray-200 my-1.5 shrink-0 opacity-80" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
        {/* Main Sidebar Panel */}
        <div
          className={`bg-white rounded-[28px] shadow-sm flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 border-slate-100
          fixed md:relative top-3 bottom-3 z-50 left-[76px]
          ${
            open
              ? "w-[190px] p-4 py-5 opacity-100 translate-x-0 border"
              : "w-0 p-0 border-none overflow-hidden opacity-0 -translate-x-10"
          }
          md:left-auto md:top-auto md:bottom-auto md:translate-x-0 md:opacity-100 md:border md:p-4 md:py-5 md:w-[190px] md:overflow-visible
          `}
        >
          {/* Header Area */}
          <div className="h-[88px] flex flex-col justify-between shrink-0 mb-4">
            <div className="flex items-center gap-2 mt-0.5">
              <PinkBoxLogo />
              <h1 className="text-[17px] font-bold tracking-tight text-[#1E2538]">LMS</h1>
            </div>
            {/* NEW: Hide Lend/Return button from standard users */}
            {['staff', 'superadmin', 'librarian'].includes(userRole) && (
              <button 
                onClick={onOpenLendModal} 
                className="w-full bg-[#FCE49F] hover:bg-[#FAD980] text-[#332500] font-bold text-[11px] tracking-wider py-2 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-sm h-9 cursor-pointer"
              >
                <OrangeDeviceIcon />
                LEND / RETURN
              </button>
            )}
          </div>
                    {/* Menu items navigation list */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-0.5">
            {accessibleMenuItems.map((item, index) => {
              const isActive = activeMenu === item.title;
              
              // NEW: Use the property from the config file!
              const showDivider = item.divider === true;

              return (
                <div key={item.title} className="flex flex-col">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`h-9 flex items-center justify-between pl-3 pr-1 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer text-left w-full
                    ${isActive ? "bg-[#FFF9E6] text-[#1E2538] font-semibold border-r-[3px] border-[#FF8A00] rounded-r-none" : "text-[#7E8B9B] hover:text-slate-800 hover:bg-slate-50"}`}
                  >
                    <span>{item.title}</span>
                  </button>
                  {/* Note: Divider moved below the button */}
                  {showDivider && (
                    <div className="h-[1px] bg-slate-100 my-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}
