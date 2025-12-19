import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import PemiraLogos from '../shared/PemiraLogos'
import { LucideIcon, type IconName } from '../LucideIcon'
import '../../styles/AdminDashboard.css'

export const adminMenuItems: Array<{ label: string; href: string; exact?: boolean; icon: IconName }> = [
  { label: 'Dashboard', href: '/admin', exact: true, icon: 'layoutDashboard' },
  { label: 'Kandidat', href: '/admin/kandidat', icon: 'users' },
  { label: 'DPT', href: '/admin/dpt', icon: 'folder' },
  { label: 'TPS', href: '/admin/tps', icon: 'building' },
  { label: 'Monitoring', href: '/admin/monitoring', icon: 'satellite' },
  { label: 'Pengaturan', href: '/admin/pengaturan', icon: 'settings' },
]

type AdminLayoutProps = {
  children: ReactNode
  title?: string
}

const AdminLayout = ({ children, title = 'Admin Panel' }: AdminLayoutProps): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAdminAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href
    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }
  const mobileMenuItems = adminMenuItems.filter((item) => item.href !== '/admin')

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <PemiraLogos size="sm" variant="kpu" showText={!sidebarCollapsed} />
        </div>
        <nav>
          <ul>
            {adminMenuItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className={isActive(item.href, item.exact) ? 'active' : ''}>
                  <LucideIcon name={item.icon} className="nav-icon" size={20} />
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              type="button"
              className={`sidebar-floating-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
              aria-label={sidebarCollapsed ? 'Buka sidebar' : 'Kecilkan sidebar'}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              {sidebarCollapsed ? '»' : '«'}
            </button>
          </div>
          <div className="header-center">
            <div className="header-status">
              <span className="status-dot live" aria-hidden />
              <span>Status Voting Aktif</span>
            </div>
            <h1>{title}</h1>
          </div>
          <div className="header-right">
            <div className="header-meta">
              <span className="meta-label">Mode</span>
              <strong>Online + TPS</strong>
            </div>
            <div className="admin-user">
              <button type="button" className="avatar-button">
                <span className="avatar-circle">{user?.username?.charAt(0).toUpperCase() ?? 'A'}</span>
                <span className="avatar-name">{user ? user.username : 'Admin'}</span>
              </button>
              <div className="user-dropdown">
                <button type="button" onClick={() => navigate('/admin')}>Dashboard</button>
                <button type="button" onClick={() => navigate('/admin/pengaturan')}>Pengaturan</button>
                <button type="button" onClick={() => logout()}>Logout</button>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-content-shell">{children}</div>
        </main>

        <nav className="admin-mobile-nav" aria-label="Menu admin">
          {mobileMenuItems.map((item) => (
            <Link key={item.href} to={item.href} className={isActive(item.href, item.exact) ? 'active' : ''}>
              <LucideIcon name={item.icon} className="nav-icon" size={20} />
              <span className="mobile-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default AdminLayout
