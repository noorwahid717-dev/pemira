import { useState } from 'react'
import type { VoterProfile } from '../../types/voting'
import '../../styles/shared/PageHeader.css'

const fallbackRedirect = () => {
  if (window.confirm('Yakin ingin keluar?')) {
    window.sessionStorage.clear()
    window.location.href = '/'
  }
}

type PageHeaderProps = {
  logo?: boolean
  title?: string
  user?: VoterProfile
  showUserMenu?: boolean
  onLogout?: () => void
}

const PageHeader = ({
  logo = true,
  title,
  user,
  showUserMenu = true,
  onLogout,
}: PageHeaderProps): JSX.Element => {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    setShowDropdown(false)
    if (onLogout) {
      onLogout()
      return
    }
    fallbackRedirect()
  }

  return (
    <header className="page-header-nav">
      <div className="page-header-container">
        <div className="header-left">
          {logo && (
            <>
              <div className="header-logo">
                <div className="logo-circle">P</div>
                <span className="logo-text">PEMIRA UNIWA</span>
              </div>
              {title && <span className="header-divider">|</span>}
            </>
          )}
          {title && <span className="header-title">{title}</span>}
        </div>

        {showUserMenu && user && (
          <div className="header-right">
            <div className="user-menu">
              <button className="user-menu-trigger" onClick={() => setShowDropdown((prev) => !prev)}>
                <span className="user-avatar">{user.nama.charAt(0)}</span>
                <span className="user-name">{user.nama}</span>
                <span className="dropdown-icon">▼</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{user.nama}</strong>
                      <span>{user.nim}</span>
                      {user.fakultas && <span>{user.fakultas}</span>}
                      {user.prodi && <span>{user.prodi}</span>}
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <a href="/dashboard" className="dropdown-item">
                    Dashboard
                  </a>
                  <a href="#profil" className="dropdown-item">
                    Profil
                  </a>
                  <a href="#aktivitas" className="dropdown-item">
                    Log Aktivitas
                  </a>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default PageHeader
