import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih } from '../hooks/useDashboardPemilih'
import { fetchVoterHistory, type HistoryItem } from '../services/voterHistory'
import { LucideIcon, type IconName } from '../components/LucideIcon'
import '../styles/VoterHistory.css'

const VoterHistory = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa } = useVotingSession()
  const dashboardData = useDashboardPemilih(session?.accessToken || null)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.accessToken || !dashboardData.election?.id) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    fetchVoterHistory(session.accessToken, dashboardData.election.id, { signal: controller.signal })
      .then((data) => {
        // Flatten and sort the response
        const allItems: HistoryItem[] = [
          ...(data.voting || []),
          ...(data.checkins || []),
          ...(data.registration || []),
          ...(data.qr || []),
          ...(data.activities || [])
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setHistory(allItems)
        setError(null)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch history:', err)
        setError(err.message || 'Gagal memuat riwayat')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [session?.accessToken, dashboardData.election?.id])

  const getHistoryIcon = (rawType: string): IconName => {
    const type = rawType.toLowerCase()
    switch (type) {
      case 'registration': return 'smartphone'
      case 'voting': return 'ballot'
      case 'tps_checkin': return 'mapPin'
      case 'qr_generated': return 'ticket'
      case 'qr_rotated': return 'refreshCw'
      case 'login': return 'lock'
      case 'logout': return 'logOut'
      default: return 'fileText'
    }
  }

  const getHistoryTitle = (rawType: string): string => {
    const type = rawType.toLowerCase()
    switch (type) {
      case 'registration': return 'Registrasi Akun'
      case 'voting': return 'Voting Berhasil'
      case 'tps_checkin': return 'Check-in TPS'
      case 'qr_generated': return 'QR Code Dibuat'
      case 'qr_rotated': return 'QR Code Diperbarui'
      case 'login': return 'Login'
      case 'logout': return 'Logout'
      default: return rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
    }
  }

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) + ' WIB'
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  const voterName = dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih'
  const voterNim = dashboardData.user?.username || mahasiswa?.nim || '-'

  return (
    <div className="voter-history-page">
      {/* Header */}
      <header className="history-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBack}>
            <LucideIcon name="arrowLeft" className="back-icon" size={20} />
          </button>
          <h1 className="header-title">Riwayat Aktivitas</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="voter-info-card">
          <div className="voter-avatar">
            <span className="avatar-text">{voterName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="voter-details">
            <h2 className="voter-name">{voterName}</h2>
            <p className="voter-nim">NIM: {voterNim}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="history-content">
        {loading && (
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Memuat riwayat...</p>
          </div>
        )}

        {error && (
          <div className="history-error">
            <LucideIcon name="alertCircle" className="error-icon" size={48} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <LucideIcon name="scroll" className="empty-icon" size={64} />
            <h3>Belum Ada Riwayat</h3>
            <p>Aktivitas Anda akan muncul di sini</p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="history-timeline">
            <div className="timeline-header">
              <h3 className="timeline-title">
                <LucideIcon name="scroll" className="timeline-title-icon" size={20} />
                Kronologi Aktivitas
              </h3>
              <p className="timeline-subtitle">{history.length} aktivitas tercatat</p>
            </div>

            <div className="timeline-list">
              {history.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-icon">
                      <LucideIcon name={getHistoryIcon(item.type)} size={24} />
                    </div>
                    {index < history.length - 1 && <div className="marker-line"></div>}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-card">
                      <div className="card-header">
                        <h4 className="card-title">{getHistoryTitle(item.type)}</h4>
                        <span className="card-time">{formatDateTime(item.timestamp)}</span>
                      </div>

                      <p className="card-description">{item.details || 'Aktivitas tercatat.'}</p>

                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="card-metadata">
                          {item.metadata.method && (
                            <div className="metadata-item">
                              <span className="metadata-label">Metode:</span>
                              <span className="metadata-value">{item.metadata.method}</span>
                            </div>
                          )}
                          {item.metadata.tps_name && (
                            <div className="metadata-item">
                              <span className="metadata-label">Lokasi TPS:</span>
                              <span className="metadata-value">{item.metadata.tps_name}</span>
                            </div>
                          )}
                          {item.metadata.tps_location && (
                            <div className="metadata-item">
                              <span className="metadata-label">Alamat:</span>
                              <span className="metadata-value">{item.metadata.tps_location}</span>
                            </div>
                          )}
                          {item.metadata.qr_status && (
                            <div className="metadata-item">
                              <span className="metadata-label">Status QR:</span>
                              <span className="metadata-value">{item.metadata.qr_status}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="history-footer">
        <nav className="footer-nav">
          <button className="nav-item" onClick={handleBack}>
            <LucideIcon name="home" className="nav-icon" size={24} />
            <span className="nav-label">Beranda</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/kandidat')}>
            <LucideIcon name="users" className="nav-icon" size={24} />
            <span className="nav-label">Kandidat</span>
          </button>
          <button className="nav-item active">
            <LucideIcon name="scroll" className="nav-icon" size={24} />
            <span className="nav-label">Riwayat</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/bantuan')}>
            <LucideIcon name="helpCircle" className="nav-icon" size={24} />
            <span className="nav-label">Bantuan</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/profil')}>
            <LucideIcon name="user" className="nav-icon" size={24} />
            <span className="nav-label">Profil</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}

export default VoterHistory
