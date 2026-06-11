import { Navigate } from "react-router-dom"
import { useRole } from "../../hook/useRole"

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role, canAccess } = useRole()

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (!canAccess(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
