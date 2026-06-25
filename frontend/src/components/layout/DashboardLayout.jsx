import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-linear-to-r from-gray-100 to-yellow-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden p-3 pl-0 gap-3">
        <Topbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}