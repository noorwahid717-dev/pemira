import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih } from '../hooks/useDashboardPemilih'
import { fetchPublicCandidates } from '../services/publicCandidates'
import type { Candidate } from '../types/voting'
import { LucideIcon } from '../components/LucideIcon'
import '../styles/VoterCandidates.css'

const VoterCandidates = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa } = useVotingSession()
  const dashboardData = useDashboardPemilih(session?.accessToken || null)
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    
    fetchPublicCandidates({ signal: controller.signal })
      .then((data) => {
        setCandidates(data)
        setError(null)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch candidates:', err)
        setError(err.message || 'Gagal memuat kandidat')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleViewDetail = (candidateId: number) => {
    navigate(`/dashboard/kandidat/detail/${candidateId}`)
  }

  const voterName = dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih'

  return (
    <div className="voter-candidates-page">
      {/* Header */}
      <header className="candidates-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBack}>
            <LucideIcon name="arrowLeft" className="back-icon" size={20} />
          </button>
          <h1 className="header-title">Kandidat</h1>
          <div className="header-spacer"></div>
        </div>
        
        <div className="header-welcome">
          <p className="welcome-text">Halo, <strong>{voterName}</strong></p>
          <p className="welcome-subtitle">Kenali calon ketua BEM Anda</p>
        </div>
      </header>

      {/* Content */}
      <main className="candidates-content">
        {loading && (
          <div className="candidates-loading">
            <div className="loading-spinner"></div>
            <p>Memuat kandidat...</p>
          </div>
        )}

        {error && (
          <div className="candidates-error">
            <LucideIcon name="alertCircle" className="error-icon" size={48} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="candidates-empty">
            <LucideIcon name="users" className="empty-icon" size={64} />
            <h3>Belum Ada Kandidat</h3>
            <p>Kandidat akan ditampilkan setelah masa pendaftaran selesai</p>
          </div>
        )}

        {!loading && !error && candidates.length > 0 && (
          <div className="candidates-grid">
            <div className="candidates-count">
              <LucideIcon name="users" className="count-icon" size={20} />
              <span className="count-text">{candidates.length} Kandidat Terdaftar</span>
            </div>

            {candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-number">
                  <span className="number-text">{candidate.nomorUrut}</span>
                </div>
                
                <div className="candidate-photo">
                  {candidate.foto ? (
                    <img 
                      src={candidate.foto} 
                      alt={candidate.nama}
                      className="photo-img"
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <span className="placeholder-text">
                        {candidate.nama?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="candidate-info">
                  <h3 className="candidate-name">{candidate.nama}</h3>
                  {candidate.prodi && (
                    <p className="candidate-major">{candidate.prodi}</p>
                  )}
                  {candidate.fakultas && (
                    <p className="candidate-nim">{candidate.fakultas}</p>
                  )}
                </div>

                {candidate.tagline && (
                  <div className="candidate-tagline">
                    <LucideIcon name="lightbulb" className="tagline-icon" size={16} />
                    <p className="tagline-text">"{candidate.tagline}"</p>
                  </div>
                )}

                <button 
                  className="view-detail-button"
                  onClick={() => handleViewDetail(candidate.id)}
                >
                  <span className="button-text">Lihat Detail</span>
                  <LucideIcon name="arrowRight" className="button-icon" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="candidates-footer">
        <nav className="footer-nav">
          <button className="nav-item" onClick={handleBack}>
            <LucideIcon name="home" className="nav-icon" size={24} />
            <span className="nav-label">Beranda</span>
          </button>
          <button className="nav-item active">
            <LucideIcon name="users" className="nav-icon" size={24} />
            <span className="nav-label">Kandidat</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/riwayat')}>
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

export default VoterCandidates
