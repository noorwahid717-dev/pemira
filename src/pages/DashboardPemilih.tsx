import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { mockCandidates } from '../data/mockCandidates'
import { dashboardAnnouncements, pemiraInfo } from '../data/dashboard'
import { useVotingSession } from '../hooks/useVotingSession'
import type { VotingRecord, VotingStatus } from '../types/voting'
import '../styles/DashboardPemilih.css'

type BannerContent = {
  type: 'info' | 'success' | 'warning'
  icon: string
  title: string
  subtitle: string
  description?: string
  showCTA: boolean
  ctaText?: string
  ctaAction?: () => void
}

type VoteSummary = {
  waktu: string
  token: string
}

const fallbackVoteSummary: VoteSummary = {
  waktu: '14 Juni 2024 — 10:24 WIB',
  token: 'x8e3-a91c-d18f',
}

const pemiraStats = {
  ...pemiraInfo,
  totalKandidat: mockCandidates.length,
}

const formatVoteTime = (record: VotingRecord) => {
  const date = new Date(record.votedAt)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const readStoredVoteData = (): VoteSummary | null => {
  const raw = window.sessionStorage.getItem('voteData')
  if (!raw) return null
  try {
    const voteData = JSON.parse(raw) as VotingRecord
    return {
      waktu: formatVoteTime(voteData),
      token: voteData.token,
    }
  } catch {
    return null
  }
}

const DashboardPemilih = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa, updateSession, clearSession } = useVotingSession()
  const [hasVoted, setHasVoted] = useState(session?.hasVoted ?? false)
  const [votingStatus, setVotingStatus] = useState<VotingStatus>(session?.votingStatus ?? 'open')
  const [qrGenerated, setQrGenerated] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!session) return
    setHasVoted(session.hasVoted)
    setVotingStatus(session.votingStatus)
  }, [session])

  const voteSummary = useMemo<VoteSummary | null>(() => {
    if (!hasVoted) return null
    return readStoredVoteData() ?? fallbackVoteSummary
  }, [hasVoted])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const kandidatPreview = mockCandidates.slice(0, 2)

  const handleStartVotingOnline = () => {
    if (votingStatus !== 'open') return
    navigate('/voting')
  }

  const handleGenerateQR = () => {
    if (votingStatus !== 'open') return
    setQrGenerated(true)
    navigate('/voting-tps')
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      clearSession()
      navigate('/', { replace: true })
    }
  }

  const banner = useMemo<BannerContent>(() => {
    if (votingStatus === 'not_started') {
      return {
        type: 'info',
        icon: 'ℹ️',
        title: 'Voting belum dibuka',
        subtitle: 'Periode voting dimulai 12 Juni pukul 00:00.',
        showCTA: false,
      }
    }

    if (votingStatus === 'closed') {
      return {
        type: 'success',
        icon: '✓',
        title: 'Voting telah ditutup',
        subtitle: 'Terima kasih atas partisipasi Anda.',
        showCTA: false,
      }
    }

    if (hasVoted && voteSummary) {
      return {
        type: 'success',
        icon: '✓',
        title: 'Anda sudah melakukan pemilihan',
        subtitle: `Waktu voting: ${voteSummary.waktu}`,
        showCTA: true,
        ctaText: 'Lihat Informasi Pemira',
        ctaAction: () => window.location.assign('#kandidat'),
      }
    }

    return {
      type: 'warning',
      icon: '⚠',
      title: 'Anda BELUM melakukan pemilihan',
      subtitle: `Periode Voting: ${pemiraStats.periodeVoting}`,
      description: 'Silakan pilih salah satu metode di bawah.',
      showCTA: true,
    }
  }, [hasVoted, voteSummary, votingStatus])

  const dashboardUser = {
    ...mahasiswa,
    fakultas: mahasiswa.fakultas ?? 'Fakultas Teknik Informatika',
  }
  const cycleVotingStatus = () => {
    const states: VotingStatus[] = ['not_started', 'open', 'closed']
    const index = states.indexOf(votingStatus)
    const next = states[(index + 1) % states.length]
    setVotingStatus(next)
    updateSession({ votingStatus: next })
  }

  const toggleHasVoted = () => {
    const next = !hasVoted
    setHasVoted(next)
    updateSession({ hasVoted: next, votingStatus: next ? 'voted' : 'open' })
  }

  return (
    <div className="dashboard-page">
      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '0.875rem',
        }}
      >
        <strong>Dev Controls:</strong>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={toggleHasVoted} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }} type="button">
            Toggle Voted: {hasVoted ? '✓ Sudah' : '✗ Belum'}
          </button>
          <button onClick={cycleVotingStatus} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }} type="button">
            Status: {votingStatus}
          </button>
        </div>
      </div>

      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="header-left">
            <div className="header-logo">
              <div className="logo-circle">P</div>
              <span className="logo-text">PEMIRA UNIWA</span>
            </div>
            <span className="header-divider">|</span>
            <span className="header-title">Dashboard Pemilih</span>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <button className="user-menu-trigger" onClick={() => setShowDropdown((prev) => !prev)}>
                <span className="user-avatar">{dashboardUser.nama.charAt(0)}</span>
                <span className="user-name">{dashboardUser.nama}</span>
                <span className="dropdown-icon">▼</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{dashboardUser.nama}</strong>
                      <span>{dashboardUser.nim}</span>
                      {dashboardUser.fakultas && <span>{dashboardUser.fakultas}</span>}
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <a href="#profil" className="dropdown-item">
                    Profil
                  </a>
                  <a href="#aktivitas" className="dropdown-item">
                    Log Aktivitas
                  </a>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout" type="button">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className={`status-banner banner-${banner.type}`}>
            <div className="banner-content">
              <div className="banner-icon">{banner.icon}</div>
              <div className="banner-text">
                <h2 className="banner-title">{banner.title}</h2>
                <p className="banner-subtitle">{banner.subtitle}</p>
                {banner.description && <p className="banner-description">{banner.description}</p>}
              </div>
            </div>

            {banner.showCTA && !hasVoted && votingStatus === 'open' && (
              <div className="banner-cta">
                <button className="btn-primary btn-large" onClick={handleStartVotingOnline} type="button">
                  Mulai Pemilihan Online
                </button>
                <button className="btn-secondary btn-large" onClick={handleGenerateQR} type="button">
                  Pilih via TPS (Offline)
                </button>
              </div>
            )}

            {banner.showCTA && hasVoted && banner.ctaText && (
              <div className="banner-cta">
                <button className="btn-outline btn-large" onClick={banner.ctaAction} type="button">
                  {banner.ctaText}
                </button>
              </div>
            )}
          </section>

          <div className="dashboard-grid">
            <div className="dashboard-left">
              <div className="info-card">
                <h3 className="card-title">Status Pemilu</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Periode Voting</span>
                    <span className="info-value">{pemiraStats.periodeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Mode Voting</span>
                    <span className="info-value">{pemiraStats.modeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Jumlah Kandidat</span>
                    <span className="info-value">{pemiraStats.totalKandidat}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lokasi TPS</span>
                    <span className="info-value">{pemiraStats.lokasiTPS}</span>
                  </div>
                </div>
                <a href="#panduan" className="card-link">
                  Lihat Panduan Pemilihan →
                </a>
              </div>

              <div className="info-card">
                <h3 className="card-title">Daftar Kandidat</h3>
                <p className="card-subtitle">{pemiraStats.totalKandidat} Kandidat terdaftar</p>

                <div className="kandidat-preview">
                  {kandidatPreview.map((kandidat) => (
                    <div key={kandidat.id} className="kandidat-preview-item">
                      <div className="kandidat-avatar">{kandidat.nomorUrut}</div>
                      <span className="kandidat-name">{kandidat.nama}</span>
                    </div>
                  ))}
                </div>

                <button className="btn-outline btn-block" onClick={() => navigate('/kandidat')} type="button">
                  Lihat Semua Kandidat
                </button>
              </div>

              <div className="info-card">
                <h3 className="card-title">Pengumuman Penting</h3>
                <div className="pengumuman-list">
                  {dashboardAnnouncements.map((item) => (
                    <div key={item.id} className="pengumuman-item">
                      <span className="pengumuman-icon">📢</span>
                      <span className="pengumuman-text">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-right">
              {!hasVoted && votingStatus === 'open' && (
                <div className="action-card">
                  <h3 className="card-title">Metode Pemilihan</h3>

                  <div className="method-card">
                    <div className="method-icon">📱</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting Online</h4>
                      <p className="method-description">
                        Pilih kandidat langsung dari aplikasi. Tersimpan secara otomatis dan aman.
                      </p>
                    </div>
                    <button className="btn-primary btn-block" onClick={handleStartVotingOnline} type="button">
                      Mulai Voting Online
                    </button>
                  </div>

                  <div className="method-card">
                    <div className="method-icon">📷</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting di TPS (Offline)</h4>
                      <p className="method-description">
                        Dapatkan QR hak suara Anda. Tunjukkan ke panitia di lokasi TPS.
                      </p>
                    </div>
                    <button className="btn-secondary btn-block" onClick={handleGenerateQR} type="button">
                      Generate QR Hak Suara
                    </button>
                    {qrGenerated && <p className="method-note">✓ QR sudah digenerate</p>}
                  </div>
                </div>
              )}

              {hasVoted && voteSummary && (
                <div className="action-card">
                  <h3 className="card-title">Bukti Pemilihan</h3>

                  <div className="bukti-card">
                    <div className="bukti-icon">✓</div>
                    <h4 className="bukti-title">Anda telah memilih pada:</h4>
                    <p className="bukti-waktu">{voteSummary.waktu}</p>

                    <div className="bukti-token">
                      <span className="token-label">Token voting:</span>
                      <span className="token-value">{voteSummary.token}</span>
                    </div>

                    <p className="bukti-note">🔒 Pilihan Anda tetap rahasia.</p>

                    <button className="btn-outline btn-block" type="button">
                      Lihat Hasil Sementara
                    </button>
                  </div>
                </div>
              )}

              {votingStatus !== 'open' && (
                <div className="action-card">
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p className="empty-text">
                      {votingStatus === 'not_started' ? 'Voting akan segera dibuka' : 'Voting telah ditutup'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPemilih
