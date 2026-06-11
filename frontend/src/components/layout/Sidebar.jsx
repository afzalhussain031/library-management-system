import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserCircle, ShoppingBag, BarChart2, HelpCircle,
  Settings, Users, TrendingUp, Package, Ticket, Shield, Building2,
  ScrollText, UserCog, KeyRound, CreditCard, Flag, Lock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRole } from '../../hook/useRole'
import { NAV_CONFIG } from '../../config/navConfig'

const ICON_MAP = {
  LayoutDashboard, UserCircle, ShoppingBag, BarChart2, HelpCircle,
  Settings, Users, TrendingUp, Package, Ticket, Shield, Building2,
  ScrollText, UserCog, KeyRound, CreditCard, Flag,
}

const ACCENT = {
  user: 'text-green-700 bg-green-50',
  admin: 'text-blue-700 bg-blue-50',
  superadmin: 'text-orange-700 bg-orange-50',
}
const ACCENT_BAR = {
  user: 'bg-green-500',
  admin: 'bg-blue-500',
  superadmin: 'bg-orange-500',
}

export default function Sidebar({ open, onClose }) {
  const { currentUser } = useAuth()
  const { role } = useRole()
  const navItems = NAV_CONFIG[role] ?? []

  const groups = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const activeClass = ACCENT[role] ?? ACCENT.user
  const barClass = ACCENT_BAR[role] ?? ACCENT_BAR.user

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100
        flex flex-col z-30 transition-transform duration-200
        lg:static lg:translate-x-0 lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100 shrink-0 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">D</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm">DashApp</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {Object.entries(groups).map(([groupName, items], gi) => (
            <div key={groupName} className={gi > 0 ? 'mt-4' : ''}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1">
                {groupName}
              </p>
              {items.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors duration-150
                       ${isActive ? `${activeClass} font-medium` : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${barClass}`} />
                        )}
                        <Icon size={15} className="shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.locked && <Lock size={11} className="text-gray-400 shrink-0" />}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {currentUser && (
          <div className="px-3 py-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
