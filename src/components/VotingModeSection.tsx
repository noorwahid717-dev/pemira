import '../styles/VotingModeSection.css'

type Props = {
  onlineEnabled: boolean
  tpsEnabled: boolean
  loading?: boolean
  error?: string | null
}

const VotingModeSection = ({ onlineEnabled, tpsEnabled, loading = false, error }: Props): JSX.Element => {
  const onlineStatus = loading ? 'Memuat...' : onlineEnabled ? 'Aktif' : 'Tidak tersedia'
  const tpsStatus = loading ? 'Memuat...' : tpsEnabled ? 'Aktif' : 'Tidak tersedia'

  return (
    <section className="voting-mode">
      <div className="voting-mode-container">
        <h2 className="section-title">Pilih Sesuai Kenyamanan Anda</h2>
        {error && !loading && <p className="error-text">{error}</p>}

        <div className="mode-grid">
          <div className={`mode-card ${onlineEnabled ? '' : 'disabled-mode'}`}>
            <div className="mode-icon">📱</div>
            <h3 className="mode-title">Voting Online</h3>
            <div className={`mode-badge ${onlineEnabled ? 'active' : 'inactive'}`}>{onlineStatus}</div>
            <ul className="mode-list">
              <li>Login pakai username + password</li>
              <li>Pilih kandidat</li>
              <li>Suara langsung tercatat</li>
            </ul>
            <button className="btn-outline" disabled={!onlineEnabled}>
              Cara Vote Online
            </button>
          </div>

          <div className={`mode-card ${tpsEnabled ? '' : 'disabled-mode'}`}>
            <div className="mode-icon">📷</div>
            <h3 className="mode-title">Voting Offline (TPS)</h3>
            <div className={`mode-badge ${tpsEnabled ? 'active' : 'inactive'}`}>{tpsStatus}</div>
            <ul className="mode-list">
              <li>Generate QR Hak Suara</li>
              <li>Datang ke lokasi TPS</li>
              <li>Panitia scan QR</li>
            </ul>
            <button className="btn-outline" disabled={!tpsEnabled}>
              Lokasi TPS
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VotingModeSection
