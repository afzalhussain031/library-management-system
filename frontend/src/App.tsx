import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";

import Page from "./pages";

import { Navbar } from "./components/navbar";

import Register from "./pages/register";
import Login from "./pages/login";

import { Dashboard } from "./pages/dashboard";

import { PrivateRoute } from "./components/private-route";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen grid grid-rows-[auto_1fr] bg-linear-150 from-primary to-secondary">
                <Navbar />
                <Page className="h-full" />
              </div>
            }
          />

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
