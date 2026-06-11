import { useAuth } from '../context/AuthContext'

export function useRole() {
  const { currentUser } = useAuth()
  const role = currentUser?.role ?? null

  return {
    role,
    isUser: role === 'user',
    isAdmin: role === 'admin',
    isSuperAdmin: role === 'superadmin',
    // canAccess(['admin','superadmin']) → true if current role is in the list
    canAccess: (allowedRoles) => allowedRoles.includes(role),
  }
}
