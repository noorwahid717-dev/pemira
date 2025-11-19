import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'

type ProtectedRouteProps = {
  component: ComponentType
  redirectTo?: string
}

const ProtectedRoute = ({ component: Component, redirectTo = '/login' }: ProtectedRouteProps): JSX.Element => {
  const { session } = useVotingSession()

  if (!session) {
    return <Navigate to={redirectTo} replace />
  }

  return <Component />
}

export default ProtectedRoute
