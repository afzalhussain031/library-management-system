import { Bell, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRole } from '../../hook/useRole'

const ROLE_STYLES = {
  user: { avatar: 'bg-green-100 text-green-700' },
  admin: { avatar: 'bg-blue-100 text-blue-700' },
  superadmin: { avatar: 'bg-orange-100 text-orange-700' },
}

export default function Topbar({ onMenuToggle }) {
  const { currentUser, logout } = useAuth()
  const { role } = useRole()
  const styles = ROLE_STYLES[role] ?? ROLE_STYLES.user

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div className="items-center gap-2 hidden lg:flex">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">D</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm">DashApp</span>
        </div>
      </div>

      <div className="flex items-center gap-2">

        <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${styles.avatar}`}>
          {currentUser?.avatar}
        </div>

        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
