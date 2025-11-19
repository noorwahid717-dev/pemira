import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'

type PublicOnlyRouteProps = {
  component: ComponentType
  redirectTo?: string
}

const PublicOnlyRoute = ({ component: Component, redirectTo = '/dashboard' }: PublicOnlyRouteProps): JSX.Element => {
  const { session } = useVotingSession()

  if (session) {
    return <Navigate to={redirectTo} replace />
  }

  return <Component />
}

export default PublicOnlyRoute
