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
  const statusLabel = loading ? 'Memuat status...' : election ? statusLabelMap[election.status] ?? election.status : 'Belum ada pemilu aktif'
  const period = election ? formatPeriod(election.voting_start_at, election.voting_end_at) : '—'
  const modeActive = election ? [election.online_enabled && 'Online', election.tps_enabled && 'TPS'].filter(Boolean).join(' & ') || 'Belum ditetapkan' : '—'
  const totalVoters = '—'
  const primaryCtaLabel = election?.status === 'VOTING_OPEN' ? 'Masuk untuk Memilih' : 'Masuk'
  const subtitle = election?.name ?? 'Sistem pemilu kampus yang aman, transparan, dan modern.'
  const showError = !loading && error

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            {election?.name ?? 'Pemilihan Ketua BEM'}
            <br />
            {election?.year ? `Tahun ${election.year}` : 'Universitas Wahidiyah'}
          </h1>

          <p className="hero-subtitle">{subtitle}</p>

          <div className="hero-badge">
            <span className="badge-status">Status: {statusLabel}</span>
          </div>

          <div className="hero-info">
            <div className="info-item">
              <span className="info-label">Periode Voting:</span>
              <span className="info-value">{period}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Pemilih Terdaftar:</span>
              <span className="info-value">{totalVoters} Mahasiswa</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mode:</span>
              <span className="info-value">{modeActive}</span>
            </div>
            {showError && <p className="hero-error">{error}</p>}
          </div>

          <div className="hero-cta">
            <a href="/login">
              <button className="btn-primary btn-large">{primaryCtaLabel}</button>
            </a>
            <a href="#kandidat">
              <button className="btn-outline btn-large">Lihat Kandidat</button>
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
