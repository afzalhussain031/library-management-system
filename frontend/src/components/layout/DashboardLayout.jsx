import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

// 1. IMPORT THE MODAL COMPONENT
import LendReturnModal from '../admin/LendReturnModal' 

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // 2. CREATE A STATE VARIABLE TO TRACK IF MODAL IS OPEN
  // Initially, it is 'false' (hidden)
  const [isLendModalOpen, setIsLendModalOpen] = useState(false) 

  return (
    <div className="flex h-screen bg-linear-to-r from-gray-100 to-yellow-100 overflow-hidden">
      
      {/* Sidebar Component */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(prev => !prev)}
        // 3. PASS A PROP DOWN TO SIDEBAR TO OPEN THE MODAL
        onOpenLendModal={() => setIsLendModalOpen(true)} 
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

      {/* 4. RENDER THE MODAL COMPONENT */}
      {/* It receives 'open' to know when to show, and 'onClose' to close itself */}
      <LendReturnModal 
        open={isLendModalOpen} 
        onClose={() => setIsLendModalOpen(false)} 
      />
      
    </div>
  )
}