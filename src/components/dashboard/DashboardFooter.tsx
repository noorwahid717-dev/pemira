import { useNavigate, useLocation } from 'react-router-dom'
import { LucideIcon } from '../LucideIcon'
import '../../styles/DashboardPemilihHiFi.css'

const DashboardFooter = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        // Exact match for root dashboard, startsWith for sub-routes
        if (path === '/dashboard' && location.pathname === '/dashboard') return true
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <footer className="dashboard-footer">
            <nav className="footer-nav">
                <button
                    className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <LucideIcon name="home" className="nav-icon" size={24} />
                    <span className="nav-label">Beranda</span>
                </button>
                <button
                    className={`nav-item ${isActive('/dashboard/kandidat') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard/kandidat')}
                >
                    <LucideIcon name="users" className="nav-icon" size={24} />
                    <span className="nav-label">Kandidat</span>
                </button>
                <button
                    className={`nav-item ${isActive('/dashboard/riwayat') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard/riwayat')}
                >
                    <LucideIcon name="scroll" className="nav-icon" size={24} />
                    <span className="nav-label">Riwayat</span>
                </button>
                <button
                    className={`nav-item ${isActive('/dashboard/bantuan') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard/bantuan')}
                >
                    <LucideIcon name="helpCircle" className="nav-icon" size={24} />
                    <span className="nav-label">Bantuan</span>
                </button>
                <button
                    className={`nav-item ${isActive('/dashboard/profil') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard/profil')}
                >
                    <LucideIcon name="user" className="nav-icon" size={24} />
                    <span className="nav-label">Profil</span>
                </button>
            </nav>
        </footer>
    )
}

export default DashboardFooter
