import '../styles/VotingModeSection.css'

type Props = {
  onlineEnabled: boolean
  tpsEnabled: boolean
  loading?: boolean
  error?: string | null
}

const VotingModeSection = ({ onlineEnabled, tpsEnabled, loading = false, error }: Props): JSX.Element => {
  const onlineStatus = loading ? 'Memuat...' : onlineEnabled ? 'Tersedia' : 'Belum dibuka'
  const tpsStatus = loading ? 'Memuat...' : tpsEnabled ? 'Tersedia' : 'Belum dibuka'
  const friendlyError = !loading && error ? 'Status mode voting belum bisa dimuat. Coba lagi sebentar.' : null

  return (
    <section className="voting-mode" id="mode-voting">
      <div className="voting-mode-container">
        <h2 className="section-title">Pilih Cara yang Paling Nyaman</h2>
        <p className="section-subtitle">Anda bebas memilih metode pemilihan sesuai preferensi Anda.</p>
        {friendlyError && <p className="error-text">{friendlyError}</p>}

        <div className="mode-grid">
          <div className={`mode-card ${onlineEnabled ? '' : 'disabled-mode'}`}>
            <div className="mode-icon">💻</div>
            <h3 className="mode-title">Voting Online</h3>
            <div className={`mode-badge ${onlineEnabled ? 'active' : 'inactive'}`}>{onlineStatus}</div>
            <ul className="mode-list">
              <li>Akses langsung dari perangkat Anda.</li>
              <li>Tidak perlu datang ke TPS.</li>
              <li>Suara terekam secara aman di sistem.</li>
            </ul>
            <a className="guide-link small-guide" href="/panduan">
              Lihat panduan lengkap →
            </a>
          </div>

          <div className={`mode-card ${tpsEnabled ? '' : 'disabled-mode'}`}>
            <div className="mode-icon">🏛️</div>
            <h3 className="mode-title">Voting Offline (TPS)</h3>
            <div className={`mode-badge ${tpsEnabled ? 'active' : 'inactive'}`}>{tpsStatus}</div>
            <ul className="mode-list">
              <li>Hadir langsung ke TPS kampus.</li>
              <li>Scan QR pendaftaran dari panitia.</li>
              <li>Masukkan surat suara ke kotak pemilihan.</li>
            </ul>
            <a className="guide-link small-guide" href="/panduan">
              Lihat panduan TPS →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VotingModeSection
