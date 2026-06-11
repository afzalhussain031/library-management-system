import { useAuth } from "../../context/AuthContext"
import { useRole } from "../../hook/useRole"


const ROLES = ['user', 'admin', 'superadmin']
const LABELS = { user: 'User', admin: 'Admin', superadmin: 'Super Admin' }

const BTN = {
  user: 'border-green-300 text-green-700 bg-green-50',
  admin: 'border-blue-300 text-blue-700 bg-blue-50',
  superadmin: 'border-orange-300 text-orange-700 bg-orange-50',
}

export default function RoleSwitcher() {
  const { switchRole } = useAuth()
  const { role } = useRole()

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {ROLES.map(r => (
        <button
          key={r}
          onClick={() => switchRole(r)}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all border
            ${role === r ? `${BTN[r]} shadow-sm` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {LABELS[r]}
        </button>
      ))}
    </div>
  )
}
