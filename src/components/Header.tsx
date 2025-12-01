import { useEffect, useState, type JSX } from 'react'
import PemiraLogos from './shared/PemiraLogos'
import '../styles/Header.css'

const navLinks = [
  { href: '#kandidat', label: 'Kandidat' },
  { href: '#cara-memilih', label: 'Cara Memilih' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/kontak', label: 'Kontak Panitia' },
]

const Header = (): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    requestAnimationFrame(() => setMounted(true))
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClass = ['header']
  if (mounted) headerClass.push('mounted')
  if (isScrolled) headerClass.push('scrolled')

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={headerClass.join(' ')}>
      <div className="header-container">
        <div className="header-brand">
          <a href="/" className="header-logo-link">
            <PemiraLogos
              size="sm"
              title="PEMIRA UNIWA"
              subtitle="2025"
              className="header-logo-cluster"
            />
          </a>
        </div>

        <nav className="header-nav desktop-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions desktop-actions">
          <a href="/login" className="appbar-login">
            <span className="login-icon">🔒</span>
            <span>Masuk</span>
          </a>
        </div>

        <div className="mobile-actions">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu" role="menu">
          <a
            href="/login"
            className="mobile-menu-item mobile-menu-login"
            onClick={closeMenu}
            role="menuitem"
          >
            <span className="login-icon">🔒</span>
            <span>Masuk</span>
          </a>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-menu-item"
              onClick={closeMenu}
              role="menuitem"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

export default Header
