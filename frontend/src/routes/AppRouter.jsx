import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import Dashboard from '../pages/user/Dashboard';
import UserProfile from "../pages/user/Profile";
import Wishlist from "../pages/user/Wishlist";
import Books from "../pages/user/Books";
import ManageBooks from '../pages/admin/ManageBooks';
import Members from '../pages/admin/Members';
import AdminDashboard from "../pages/admin/AdminDashboard";
import Circulation from "../pages/admin/Circulation"; // <-- ADD THIS LINE


// ==========================================
// SMART ROOT REDIRECT COMPONENT
// ==========================================
const RootRedirect = () => {
  const { currentUser } = useAuth();
  
  // 1. If not logged in, go to login page
  if (!currentUser) return <Navigate to="/login" replace />;
  
  // 2. If Staff, Admin, or Librarian, go to the Admin Dashboard
  if (['staff', 'librarian', 'superadmin'].includes(currentUser?.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // 3. Otherwise (Students/Users), go to the User Dashboard
  return <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Loading application...</h3>
      </div>
    );
  }

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/login" element={<Login />} />
      <Route path='/register' element={<SignUp />} />

      {/* ================= GROUP 1: GENERAL USER ROUTES ================= */}
      {/* Leaving allowedRoles blank here means ANY logged-in account can access these hallways */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/books" element={<Books />} />
        </Route>
      </Route>

      {/* ================= GROUP 2: STRICT ADMIN ROUTES ================= */}
      <Route element={<ProtectedRoute allowedRoles={['staff', 'librarian', 'superadmin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<ManageBooks />} />
          
          {/* Add these so the app doesn't crash when you click the new links */}
          <Route path="/admin/circulation" element={<Circulation />} />
          <Route path="/admin/members" element={<Members />} />
          <Route path="/admin/reservations" element={<ManageBooks />} /> {/* Placeholder */}
          <Route path="/admin/fines" element={<ManageBooks />} /> {/* Placeholder */}
          <Route path="/admin/reports" element={<ManageBooks />} /> {/* Placeholder */}
        </Route>
      </Route>


      {/* ================= REDIRECTS & FALLBACKS ================= */}
      {/* Landings rule */}
       <Route path="/" element={<RootRedirect />} />

      {/* Catch-all 404 rule: Send stray paths back to safety */}
       <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRouter;
