import { Routes, Route, useLocation } from "react-router-dom";

import { Sidebar } from "../components/dashboard/sidebar";
import { Topbar } from "../components/dashboard/topbar";

export function Dashboard() {
  const location = useLocation();
  const paths = location.pathname.split("/");
  const currentPage = paths[paths.length - 1];

  return (
    <main className="min-h-screen p-4 grid grid-cols-[auto_1fr] gap-4">
      <Sidebar className="sticky top-4 h-[calc(100vh-1rem*2)]" />
      <div className="grid grid-rows-[auto_1fr] gap-4">
        <Topbar className="sticky top-4" />
        <div>
          <Routes>
            <Route path="*" element={
              <span className="block text-center">
                {currentPage}
              </span>
            } />
          </Routes>
        </div>
      </div>
    </main>
  );
}
