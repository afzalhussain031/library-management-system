import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/user/Dashboard';
import UserProfile from "./pages/user/profile";
import Wishlist from "./pages/user/wishlist";
import Books from "./pages/user/books";
import AdminDashboard from "./pages/admin/admin_dashboard"

function AppRoutes() {
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
      {/* Handing the guard an explicit list locks down this folder to admins ONLY */}
      <Route element={<ProtectedRoute allowedRoles={['staff', 'librarian', 'superadmin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add any other future administrator-only pages here */}
        </Route>
      </Route>

      {/* ================= REDIRECTS & FALLBACKS ================= */}
      {/* Landings rule */}
      <Route
        path="/"
        element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
      />

      {/* Catch-all 404 rule: Send stray paths back to safety */}
      <Route
        path="*"
        element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}