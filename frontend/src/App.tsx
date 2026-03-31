import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

/**
 * App Component
 * Root component that sets up routing and wraps app with AuthProvider
 * All authentication state is managed via Context API (no prop-drilling)
 * 
 * Routes:
 * - / : Home page (redirects to dashboard if authenticated)
 * - /student-dashboard : Student-specific dashboard
 * - /staff-dashboard : Staff/admin-specific dashboard
 * - /books : Book browsing/management (protected)
 * - /profile : User profile (protected)
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/student-dashboard"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/staff-dashboard"
            element={
              <PrivateRoute>
                <StaffDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/books"
            element={
              <PrivateRoute>
                <Books />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;