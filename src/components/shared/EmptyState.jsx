import '../../styles/shared/EmptyState.css';

export default function EmptyState({ 
  icon = "📭",
  title,
  description,
  action
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      {title && <p className="empty-title">{title}</p>}
      {description && <p className="empty-text">{description}</p>}
      {action && (
        <button className="empty-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
