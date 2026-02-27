import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/api";

interface Props {
  children: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;