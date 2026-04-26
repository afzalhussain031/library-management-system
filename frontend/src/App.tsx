import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { AuthLoader } from "./components/auth-loader";

import Page from "./pages";

import { Navbar } from "./components/navbar";

import Register from "./pages/register";
import Login from "./pages/login";

import { Dashboard } from "./pages/dashboard";
import AdminDashboard from "./admin/admin-dashboard";

import { PrivateRoute } from "./components/private-route";
import { useAuth } from "./hooks/useAuth";
import type { User } from "./types";

const hasAdminAccess = (user: User | null): boolean => {
  if (!user) {
    return false;
  }

  const normalizedRole = user.role?.trim().toLowerCase();
  const normalizedUserType = user.user_type?.trim().toLowerCase();

  return (
    user.is_staff === true ||
    normalizedRole === "staff" ||
    normalizedRole === "librarian" ||
    normalizedUserType === "staff" ||
    normalizedUserType === "librarian"
  );
};

function DashboardRouteSwitch() {
  const { user } = useAuth();

  return hasAdminAccess(user) ? <AdminDashboard /> : <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-svh grid grid-rows-[auto_1fr] bg-linear-150 from-primary to-secondary">
                <Navbar />
                <Page className="h-full" />
              </div>
            }
          />

          <Route path="*" element={
            <AuthLoader>
              <Routes>
                <Route path="register" element={<Register />} />

                <Route path="login" element={<Login />} />

                <Route
                  path="dashboard/*"
                  element={
                    <PrivateRoute>
                      <DashboardRouteSwitch />
                    </PrivateRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthLoader>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
