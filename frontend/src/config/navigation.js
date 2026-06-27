// We import some extra icons for the new pages
import { 
  LayoutGrid, BookOpen, Users, User, Settings, Info, Headphones, 
  Repeat, CreditCard, Bookmark, BarChart 
} from "lucide-react";

export const ROLES = {
  USER: 'user', 
  STAFF: 'staff',
  ADMIN: 'superadmin',
  LIBRARIAN: 'librarian'
};

export const SIDEBAR_MENU = [
  // ==========================================
  // GENERAL USER ROUTES
  // ==========================================
  { title: "Dashboard", icon: LayoutGrid, path: "/dashboard", allowedRoles: [ROLES.USER] },
  { title: "Browse Books", icon: BookOpen, path: "/books", allowedRoles: [ROLES.USER] },
  { title: "Wishlist", icon: Bookmark, path: "/wishlist", allowedRoles: [ROLES.USER], divider: true },

  // ==========================================
  // CORE STAFF/ADMIN ROUTES
  // ==========================================
  { title: "Overview", icon: LayoutGrid, path: "/admin/dashboard", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Inventory", icon: BookOpen, path: "/admin/books", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Circulation", icon: Repeat, path: "/admin/circulation", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Members", icon: Users, path: "/admin/members", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Reservations", icon: Bookmark, path: "/admin/reservations", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Fines & Payments", icon: CreditCard, path: "/admin/fines", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN], divider: true },

  // ==========================================
  // SYSTEM/ADMIN ONLY ROUTES (Bottom Section)
  // ==========================================
  { title: "Reports", icon: BarChart, path: "/admin/reports", allowedRoles: [ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  
  // ==========================================
  // SHARED BOTTOM ROUTES (Everyone sees these)
  // ==========================================
  { title: "Profile", icon: User, path: "/profile", allowedRoles: [ROLES.USER, ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Settings", icon: Settings, path: "/settings", allowedRoles: [ROLES.USER, ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] },
  { title: "Help", icon: Headphones, path: "/help", allowedRoles: [ROLES.USER, ROLES.STAFF, ROLES.ADMIN, ROLES.LIBRARIAN] }
];
