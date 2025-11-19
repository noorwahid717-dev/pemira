import { useState } from 'react'
import '../styles/Header.css'

const Header = (): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <div className="logo-circle">P</div>
          <span className="logo-text">PEMIRA UNIWA</span>
        </div>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <a href="#tentang">Tentang</a>
          <a href="#kandidat">Kandidat</a>
          <a href="#panduan">Panduan</a>
        </nav>

        <div className="header-actions">
          <a href="/login">
            <button className="btn-primary">Masuk Mahasiswa</button>
          </a>
          <a href="/demo">
            <button className="btn-secondary">Akun Demo</button>
          </a>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
          ☰
        </button>
      </div>
    </header>
  )
}

export default Header
