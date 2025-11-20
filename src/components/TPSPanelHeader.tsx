import { useEffect, useRef, useState } from 'react'
import type { TPSPanitiaProfile } from '../types/tpsPanel'

type TPSPanelHeaderProps = {
  panitia: TPSPanitiaProfile
  locationLabel: string
  subtitle?: string
  onLogout?: () => void
}

const TPSPanelHeader = ({ panitia, locationLabel, subtitle, onLogout }: TPSPanelHeaderProps): JSX.Element => {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    setOpenMenu(false)
    if (onLogout) {
      onLogout()
      return
    }
    if (window.confirm('Keluar dari TPS Panel?')) {
      window.location.href = '/'
    }
  }

  return (
    <header className="tps-panel-header">
      <div className="header-left">
        <div className="brand-line">
          <span className="brand-text">PEMIRA UNIWA</span>
          <span className="brand-divider">–</span>
          <span className="brand-subtitle">TPS Panel</span>
        </div>
        {subtitle && <p className="panel-subtitle">{subtitle}</p>}
      </div>

      <div className="header-right" ref={menuRef}>
        <span className="tps-label">TPS: {locationLabel}</span>
        <button className="panitia-trigger" onClick={() => setOpenMenu((prev) => !prev)}>
          Panitia: {panitia.nama}
          <span className="caret">▼</span>
        </button>

        {openMenu && (
          <div className="panitia-dropdown">
            <div className="dropdown-section">
              <span className="dropdown-title">Panitia</span>
              <p className="dropdown-value">{panitia.nama}</p>
              <p className="dropdown-value muted">{panitia.role}</p>
              <p className="dropdown-value muted">{panitia.shift}</p>
            </div>
            <button className="dropdown-item" type="button">
              Profil panitia
            </button>
            <button className="dropdown-item" type="button">
              Ganti TPS
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default TPSPanelHeader
