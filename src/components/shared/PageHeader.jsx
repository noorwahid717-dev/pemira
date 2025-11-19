import { useState } from 'react';
import '../../styles/shared/PageHeader.css';

export default function PageHeader({ 
  logo = true,
  title,
  user,
  showUserMenu = true,
  onLogout
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) {
      onLogout();
    } else {
      if (confirm('Yakin ingin keluar?')) {
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
  };

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
              <button 
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
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
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/dashboard" className="dropdown-item">Dashboard</a>
                  <a href="#profil" className="dropdown-item">Profil</a>
                  <a href="#aktivitas" className="dropdown-item">Log Aktivitas</a>
                  <div className="dropdown-divider"></div>
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
  );
}
