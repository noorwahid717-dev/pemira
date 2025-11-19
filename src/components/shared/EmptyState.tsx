import type { MouseEventHandler, ReactNode } from 'react'
import '../../styles/shared/EmptyState.css'

type EmptyStateAction = {
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

type EmptyStateProps = {
  icon?: ReactNode
  title?: string
  description?: string
  action?: EmptyStateAction
}

const EmptyState = ({ icon = '📭', title, description, action }: EmptyStateProps): JSX.Element => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    {title && <p className="empty-title">{title}</p>}
    {description && <p className="empty-text">{description}</p>}
    {action && (
      <button className="empty-action" onClick={action.onClick} type="button">
        {action.label}
      </button>
    )}
  </div>
)

export default EmptyState
