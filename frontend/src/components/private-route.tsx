import React from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function PrivateRoute({ children }: { children: React.ReactNode; }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
