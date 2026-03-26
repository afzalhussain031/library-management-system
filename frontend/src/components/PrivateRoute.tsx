import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { PrivateRouteProps } from "../types";

/**
 * PrivateRoute Component
 * Protects routes by redirecting unauthenticated users to home
 * Uses useAuth hook to check authentication status
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
