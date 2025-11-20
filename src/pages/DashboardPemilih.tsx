import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { mockCandidates } from '../data/mockCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import { fetchPublicCandidates } from '../services/publicCandidates'
import { fetchCurrentElection, type PublicElection } from '../services/publicElection'
import { fetchVoterStatus, type VoterMeStatus } from '../services/voterStatus'
import type { Candidate, VotingStatus } from '../types/voting'
import '../styles/DashboardPemilih.css'

type BannerContent = {
  type: 'info' | 'success' | 'warning'
  icon: string
  title: string
  subtitle: string
  description?: string
  showCTA: boolean
}

const methodLabelMap: Record<string, string> = {
  ONLINE: 'Voting Online',
  TPS: 'Voting TPS',
  NONE: 'Belum memilih',
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return 'Jadwal voting belum diumumkan'
  const dateStart = start ? new Date(start) : null
  const dateEnd = end ? new Date(end) : null
  const format = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  if (dateStart && dateEnd) return `${format(dateStart)} – ${format(dateEnd)}`
  if (dateStart) return `${format(dateStart)} dst`
  if (dateEnd) return `Sampai ${format(dateEnd)}`
  return 'Jadwal voting belum diumumkan'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
}

const DashboardPemilih = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa, updateSession, clearSession } = useVotingSession()

  const [election, setElection] = useState<PublicElection | null>(null)
  const [meStatus, setMeStatus] = useState<VoterMeStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [candidatesError, setCandidatesError] = useState<string | null>(null)

  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    const loadStatus = async () => {
      setStatusLoading(true)
      try {
        const current = await fetchCurrentElection({ signal: controller.signal })
        setElection(current)
        const status = await fetchVoterStatus(session.accessToken, current.id, { signal: controller.signal })
        setMeStatus(status)
        setStatusError(null)

        const computed: VotingStatus = status.has_voted
          ? 'voted'
          : current.status === 'VOTING_OPEN'
            ? 'open'
            : current.status === 'VOTING_CLOSED' || current.status === 'CLOSED'
              ? 'closed'
              : 'not_started'
        updateSession({ hasVoted: status.has_voted, votingStatus: computed })
      } catch (err: any) {
        if ((err as Error).name === 'AbortError') return
        setStatusError(err?.message ?? 'Gagal memuat status pemilu.')
        setMeStatus(null)
      } finally {
        setStatusLoading(false)
      }
    }

    loadStatus()
    return () => controller.abort()
  }, [session, updateSession])

  useEffect(() => {
    const controller = new AbortController()
    fetchPublicCandidates({ signal: controller.signal, token: session?.accessToken })
      .then((items) => {
        setCandidates(items)
        setCandidatesError(null)
      })
      .catch(() => {
        setCandidatesError('Menampilkan data sementara.')
        setCandidates(mockCandidates)
      })

    return () => controller.abort()
  }, [session?.accessToken])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const hasVoted = meStatus?.has_voted ?? false
  const isEligible = meStatus?.eligible ?? true
  const isVotingOpen = election?.status === 'VOTING_OPEN'
  const votingStatus: VotingStatus = hasVoted ? 'voted' : isVotingOpen ? 'open' : election ? 'closed' : 'not_started'
  const canOnline = Boolean(isVotingOpen && isEligible && meStatus?.online_allowed)
  const canTPS = Boolean(isVotingOpen && isEligible && meStatus?.tps_allowed)
  const lastVoteTime = formatDateTime(meStatus?.last_vote_at)
  const methodLabel = methodLabelMap[meStatus?.method ?? 'NONE'] ?? 'Belum memilih'
  const modeVoting = election ? [election.online_enabled && 'Online', election.tps_enabled && 'TPS'].filter(Boolean).join(' & ') || 'Belum ditetapkan' : '—'
  const periodeVoting = election ? formatDateRange(election.voting_start_at, election.voting_end_at) : '—'
  const kandidatPreview = candidates.slice(0, 2)
  const voteData = hasVoted ? (() => {
    const raw = sessionStorage.getItem('voteData')
    if (!raw) return null
    try {
      return JSON.parse(raw) as { token?: string }
    } catch {
      return null
    }
  })() : null

  const banner = useMemo<BannerContent>(() => {
    if (statusLoading) {
      return {
        type: 'info',
        icon: '⏳',
        title: 'Memuat status pemilu...',
        subtitle: 'Mohon tunggu sebentar.',
        showCTA: false,
      }
    }

    if (statusError) {
      return {
        type: 'warning',
        icon: '⚠',
        title: 'Gagal memuat status',
        subtitle: statusError,
        showCTA: false,
      }
    }

    if (!election) {
      return {
        type: 'warning',
        icon: 'ℹ️',
        title: 'Belum ada pemilu aktif',
        subtitle: 'Cek kembali nanti atau hubungi panitia.',
        showCTA: false,
      }
    }

    if (!isEligible) {
      return {
        type: 'warning',
        icon: '⚠',
        title: 'Anda belum terdaftar sebagai pemilih',
        subtitle: 'Hubungi panitia untuk validasi data.',
        showCTA: false,
      }
    }

    if (hasVoted) {
      return {
        type: 'success',
        icon: '✓',
        title: 'Anda sudah melakukan pemilihan',
        subtitle: lastVoteTime ? `Terakhir memilih: ${lastVoteTime}` : `Metode: ${methodLabel}`,
        description: methodLabel !== 'Belum memilih' ? `Metode: ${methodLabel}` : undefined,
        showCTA: true,
      }
    }

    if (!isVotingOpen) {
      return {
        type: 'info',
        icon: 'ℹ️',
        title: election.status === 'VOTING_CLOSED' || election.status === 'CLOSED' ? 'Voting telah ditutup' : 'Voting belum dibuka',
        subtitle: periodeVoting,
        showCTA: false,
      }
    }

    return {
      type: 'warning',
      icon: '⚠',
      title: 'Anda BELUM melakukan pemilihan',
      subtitle: `Periode Voting: ${periodeVoting}`,
      description: 'Silakan pilih salah satu metode di bawah.',
      showCTA: true,
    }
  }, [statusLoading, statusError, election, isEligible, hasVoted, isVotingOpen, lastVoteTime, methodLabel, periodeVoting])

  const handleStartVotingOnline = () => {
    if (!canOnline || hasVoted) return
    navigate('/voting')
  }

  const handleOpenTPS = () => {
    if (!canTPS || hasVoted) return
    navigate('/voting-tps/scanner')
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      clearSession()
      navigate('/', { replace: true })
    }
  }

  const dashboardUser = {
    ...mahasiswa,
    fakultas: mahasiswa.fakultas ?? 'Fakultas Teknik Informatika',
  }

  return (
    <div className="dashboard-page">
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
            <button className="btn-outline" onClick={handleLogout} type="button">
              Logout
            </button>
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

            {banner.showCTA && !hasVoted && (
              <div className="banner-cta">
                <button className="btn-primary btn-large" onClick={handleStartVotingOnline} type="button" disabled={!canOnline}>
                  {canOnline ? 'Mulai Pemilihan Online' : 'Voting Online tidak tersedia'}
                </button>
                <button className="btn-secondary btn-large" onClick={handleOpenTPS} type="button" disabled={!canTPS}>
                  {canTPS ? 'Scan QR di TPS' : 'TPS tidak tersedia'}
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
                    <span className="info-value">{periodeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Mode Voting</span>
                    <span className="info-value">{modeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value">{election?.status ?? '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Kanal tersedia</span>
                    <span className="info-value">
                      {canOnline ? 'Online' : ''} {canOnline && canTPS ? '&' : ''} {canTPS ? 'TPS' : ''} {!canOnline && !canTPS && 'Tidak tersedia'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Terakhir memilih</span>
                    <span className="info-value">{hasVoted ? lastVoteTime ?? methodLabel : 'Belum memilih'}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3 className="card-title">Daftar Kandidat</h3>
                {candidatesError && <p className="error-text-small">{candidatesError}</p>}
                <p className="card-subtitle">{candidates.length} Kandidat terdaftar</p>

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
            </div>

            <div className="dashboard-right">
              {!hasVoted && votingStatus === 'open' && (
                <div className="action-card">
                  <h3 className="card-title">Metode Pemilihan</h3>

                  <div className={`method-card ${!canOnline ? 'method-disabled' : ''}`}>
                    <div className="method-icon">📱</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting Online</h4>
                      <p className="method-description">Pilih kandidat langsung dari aplikasi. Tersimpan secara otomatis dan aman.</p>
                    </div>
                    <button className="btn-primary btn-block" onClick={handleStartVotingOnline} type="button" disabled={!canOnline}>
                      {canOnline ? 'Mulai Voting Online' : 'Tidak tersedia'}
                    </button>
                  </div>

                  <div className={`method-card ${!canTPS ? 'method-disabled' : ''}`}>
                    <div className="method-icon">📷</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting di TPS (Offline)</h4>
                      <p className="method-description">Panitia menyiapkan QR hak suara. Scan QR di TPS dan konfirmasi pilihan Anda.</p>
                    </div>
                    <button className="btn-secondary btn-block" onClick={handleOpenTPS} type="button" disabled={!canTPS}>
                      {canTPS ? 'Buka Scanner TPS' : 'Tidak tersedia'}
                    </button>
                  </div>
                </div>
              )}

              {hasVoted && (
                <div className="action-card">
                  <h3 className="card-title">Bukti Pemilihan</h3>

                  <div className="bukti-card">
                    <div className="bukti-icon">✓</div>
                    <h4 className="bukti-title">Anda telah memilih</h4>
                    <p className="bukti-waktu">{lastVoteTime ?? methodLabel}</p>

                    <div className="bukti-token">
                      <span className="token-label">Metode:</span>
                      <span className="token-value">{methodLabel}</span>
                    </div>
                    {voteData?.token && (
                      <div className="bukti-token">
                        <span className="token-label">Token:</span>
                        <span className="token-value">{voteData.token}</span>
                      </div>
                    )}

                    <p className="bukti-note">🔒 Pilihan Anda tetap rahasia.</p>
                  </div>
                </div>
              )}

              {votingStatus !== 'open' && !hasVoted && (
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
