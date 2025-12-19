import { LucideIcon } from '../LucideIcon'
import '../../styles/DashboardPemilihHiFi.css'

interface DashboardHeaderProps {
    voterData: {
        nama: string
        nim: string
        mode: 'ONLINE' | 'OFFLINE'
        role?: string
    }
}

const DashboardHeader = ({ voterData }: DashboardHeaderProps) => {
    const getIdLabel = (role?: string) => {
        const r = role?.toUpperCase()
        if (r === 'LECTURER' || r === 'DOSEN') return 'NIDN'
        if (r === 'STAFF' || r === 'TENDIK') return 'NIP'
        return 'NIM'
    }

    return (
        <header className="dashboard-header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo-pemira">
                        <LucideIcon name="ballot" className="logo-icon" size={28} />
                        <span className="logo-text">PEMIRA UNIWA</span>
                    </div>
                </div>

                <div className="header-right">
                    <button className="profile-button">
                        <LucideIcon name="user" className="profile-icon" size={24} />
                    </button>
                </div>
            </div>

            <div className="user-info">
                <h1 className="user-greeting" style={{ color: '#FFFFFF' }}>Halo, {voterData.nama}!</h1>
                <p className="user-details" style={{ color: '#FFFFFF' }}>
                    <span className="user-nim" style={{ color: '#FFFFFF' }}>{getIdLabel(voterData.role)} {voterData.nim}</span>
                    <span className="user-mode-badge" data-mode={voterData.mode.toLowerCase()} style={{ color: '#FFFFFF' }}>
                        Mode: {voterData.mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE (TPS)'}
                    </span>
                </p>
            </div>
        </header>
    )
}

export default DashboardHeader
