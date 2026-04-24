import { Routes, Route, Navigate } from "react-router-dom";

import { Sidebar } from "../components/dashboard/sidebar";
import { Topbar } from "../components/dashboard/topbar";

import { Overview } from "./dashboard/overview";
import { Books } from "./dashboard/books";
import { Wishlist } from "./dashboard/wishlist";
import { Settings } from "./dashboard/settings";

export function Dashboard() {
  return (
    <main className="min-h-svh bg-linear-150 from-secondary to-primary p-4 grid grid-cols-[auto_1fr] gap-4">
      <Sidebar className="sticky top-4 h-[calc(100vh-1rem*2)]" />

      <div className="grid grid-rows-[auto_1fr] gap-4">
        <Topbar className="sticky top-4" />

        <div>
          <Routes>
            <Route path="overview" element={<Overview />} />
            <Route path="books" element={<Books />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}
