import type { PublicElection } from '../services/publicElection'
import '../styles/HeroSection.css'

type Props = {
  election: PublicElection | null
  loading?: boolean
  error?: string | null
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const formatPeriod = (start?: string | null, end?: string | null) => {
  const startText = formatDate(start)
  const endText = formatDate(end)
  if (startText && endText) return `${startText} – ${endText}`
  if (startText) return `${startText} dst`
  return 'Jadwal voting belum diumumkan'
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

const HeroSection = ({ election, loading = false, error }: Props): JSX.Element => {
  const hasElection = Boolean(election)
  const isNoActiveElectionError = error?.toLowerCase().includes('pemilu aktif')
  const statusLabel = loading ? 'Memuat status...' : hasElection ? statusLabelMap[election?.status ?? ''] ?? 'Pemilu aktif' : 'Belum ada pemilu aktif'
  const period = election ? formatPeriod(election.voting_start_at, election.voting_end_at) : 'Jadwal voting akan diumumkan panitia.'
  const modeActive = election ? [election.online_enabled && 'Online', election.tps_enabled && 'TPS'].filter(Boolean).join(' & ') || 'Mode akan diumumkan' : 'Online & TPS akan diumumkan'
  const isVotingOpen = election?.status === 'VOTING_OPEN'
  const primaryCtaLabel = isVotingOpen ? 'Masuk untuk Memilih' : 'Lihat Jadwal & Calon'
  const primaryCtaHref = isVotingOpen ? '/login' : '#kandidat'
  const subtitle = 'Sistem pemilu kampus yang aman, rahasia, dan mudah digunakan untuk seluruh mahasiswa UNIWA.'
  const friendlyError =
    !loading && error && !isNoActiveElectionError ? 'Tidak dapat memuat data saat ini. Coba lagi beberapa saat.' : null

  return (
    <section className="hero" id="tentang">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">Pemilihan Ketua BEM Universitas Wahidiyah</h1>
          <div id="jadwal" />

          <p className="hero-subtitle">{subtitle}</p>

          <div className="hero-badge">
            <span className="badge-status">{statusLabel}</span>
          </div>

          <div className="hero-info">
            <div className="info-item">
              <span className="info-label">Periode voting</span>
              <span className="info-value">{period}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mode yang tersedia</span>
              <span className="info-value">{modeActive}</span>
            </div>
            {friendlyError && <p className="hero-error">{friendlyError}</p>}
          </div>

          <div className="hero-cta">
            <a href={primaryCtaHref}>
              <button className="btn-primary btn-large">{primaryCtaLabel}</button>
            </a>
            <a href="#kandidat">
              <button className="btn-outline btn-large">Lihat Calon Ketua BEM</button>
            </a>
          </div>

          <div className="hero-note">
            <a className="hero-guide-link" href="/panduan">
              Lihat panduan lengkap pemilu →
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
