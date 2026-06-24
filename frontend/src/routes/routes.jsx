import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/user/Dashboard";
import Books from "../pages/user/books";
import Wishlist from "../pages/user/wishlist";
import Profile from "../pages/user/profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/user/dashboard" element={<Dashboard />} />
      <Route path="/user/books" element={<Books />} />
      <Route path="/user/wishlist" element={<Wishlist />} />
      <Route path="/user/profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;