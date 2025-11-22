import { useEffect, useMemo, useState } from 'react'
import type { PublicElection } from '../services/publicElection'
import '../styles/HeroSection.css'

type Props = {
  election: PublicElection | null
  loading?: boolean
  error?: string | null
}

const FALLBACK_VOTING_DATE = (import.meta.env.VITE_FALLBACK_VOTING_START as string | undefined) ?? '2026-01-01T08:00:00+07:00'

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  target: Date
}

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Pemilu disiapkan',
  REGISTRATION: 'Pendaftaran calon',
  REGISTRATION_OPEN: 'Pendaftaran calon',
  CAMPAIGN: 'Masa kampanye',
  VOTING_OPEN: 'Voting dibuka',
  VOTING_CLOSED: 'Voting ditutup',
  CLOSED: 'Pemilu selesai',
  ARCHIVED: 'Arsip',
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const resolveTargetDate = (election?: PublicElection | null): Date => {
  return parseDate(election?.voting_start_at) ?? parseDate(FALLBACK_VOTING_DATE) ?? new Date('2026-01-01T00:00:00Z')
}

const buildCountdown = (target: Date): CountdownState => {
  const now = Date.now()
  const diff = Math.max(target.getTime() - now, 0)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: diff === 0,
    target,
  }
}

const HeroSection = ({ election, loading = false, error }: Props): JSX.Element => {
  const hasElection = Boolean(election)
  const isNoActiveElectionError = error?.toLowerCase().includes('pemilu aktif')
  const showNoElectionState = !hasElection && !loading
  const statusLabel = loading ? 'Memuat status...' : hasElection ? statusLabelMap[election?.status ?? ''] ?? 'Pemilu aktif' : 'Belum ada pemilu aktif'
  const isVotingOpen = election?.status === 'VOTING_OPEN'
  const primaryCtaLabel = isVotingOpen ? 'Lihat cara memilih' : 'Lihat cara memilih'
  const primaryCtaHref = isVotingOpen ? '/panduan' : '/panduan'
  const subtitle = 'Sistem pemilu kampus yang aman, rahasia, dan mudah digunakan oleh seluruh mahasiswa.'
  const friendlyError =
    !loading && error && !isNoActiveElectionError ? 'Data jadwal belum dapat dimuat. Panitia sedang memperbarui informasi.' : null
  const targetDate = useMemo(() => resolveTargetDate(election), [election])
  const [countdown, setCountdown] = useState<CountdownState>(() => buildCountdown(targetDate))

  useEffect(() => {
    setCountdown(buildCountdown(targetDate))
    const interval = window.setInterval(() => {
      setCountdown(buildCountdown(targetDate))
    }, 1000) // Update setiap detik
    return () => window.clearInterval(interval)
  }, [targetDate])

  const targetLabel = useMemo(
    () => targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [targetDate],
  )

  const countdownTitle = isVotingOpen ? 'Sisa waktu voting' : 'Menuju hari pemilihan'
  const countdownCaption = isVotingOpen ? 'Pemilihan akan ditutup otomatis setelah waktu habis.' : 'Hitungan mundur hingga TPS dibuka.'

  return (
    <section className="hero" id="tentang">
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-brand">
            <span className="hero-brand-text">PEMIRA UNIWA 2025</span>
          </div>

          <h1 className="hero-title">Pemilihan Ketua BEM Universitas Wahidiyah</h1>

          <p className="hero-subtitle">{subtitle}</p>

          <div className="hero-badge">
            <span className="badge-status-dot">●</span>
            <span className="badge-status-text">{statusLabel}</span>
          </div>

          {showNoElectionState ? (
            <div className="countdown-card no-election">
              <div className="no-election-icon">📋</div>
              <h3 className="no-election-title">Tidak ada pemilu aktif</h3>
              <p className="no-election-text">Panitia belum membuka jadwal resmi pemilihan.</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          ) : (
            <div className="countdown-card">
              <div className="countdown-header">
                <div className="countdown-header-left">
                  <div>
                    <h3 className="countdown-title">{countdownTitle}</h3>
                    <p className="countdown-date">{targetLabel}</p>
                  </div>
                </div>
                {countdown.isPast && <span className="badge-live">● Sedang berlangsung</span>}
              </div>
              <div className="countdown-grid">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Hari</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Jam</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Menit</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Detik</span>
                </div>
              </div>
              <p className="countdown-caption">{countdownCaption}</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          )}

          <div className="hero-cta">
            <a href={primaryCtaHref}>
              <button className="btn-primary btn-large">{primaryCtaLabel}</button>
            </a>
            <a href="/demo">
              <button className="btn-outline btn-large">Coba akun demo</button>
            </a>
          </div>

          <div className="hero-note">
            <a className="hero-guide-link" href="#kandidat">
              Lihat calon & jadwal lengkap →
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="card-mockup">
              <div className="mockup-header">Kandidat BEM</div>
              <div className="mockup-cards">
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
