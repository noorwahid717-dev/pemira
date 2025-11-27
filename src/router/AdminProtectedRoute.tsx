import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'

type Props = {
  component: ComponentType
  redirectTo?: string
  allowRoles?: string[]
}

const DEFAULT_ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'PANITIA', 'PANITIA_UNI', 'TPS_OPERATOR', 'KETUA_TPS', 'OPERATOR_PANEL', 'VIEWER']

const AdminProtectedRoute = ({ component: Component, redirectTo = '/admin/login', allowRoles = DEFAULT_ADMIN_ROLES }: Props): JSX.Element => {
  const { token, user } = useAdminAuth()

  if (!token || !user || (allowRoles.length > 0 && !allowRoles.includes(user.role))) {
    return <Navigate to={redirectTo} replace />
  }

  return <Component />
}

export default AdminProtectedRoute
