import '../styles/VotingModeSection.css'

const VotingModeSection = (): JSX.Element => (
  <section className="voting-mode">
    <div className="voting-mode-container">
      <h2 className="section-title">Pilih Sesuai Kenyamanan Anda</h2>

      <div className="mode-grid">
        <div className="mode-card">
          <div className="mode-icon">📱</div>
          <h3 className="mode-title">Voting Online</h3>
          <ul className="mode-list">
            <li>Login pakai NIM + OTP</li>
            <li>Pilih kandidat</li>
            <li>Suara langsung tercatat</li>
          </ul>
          <button className="btn-outline">Cara Vote Online</button>
        </div>

        <div className="mode-card">
          <div className="mode-icon">📷</div>
          <h3 className="mode-title">Voting Offline (TPS)</h3>
          <ul className="mode-list">
            <li>Generate QR Hak Suara</li>
            <li>Datang ke lokasi TPS</li>
            <li>Panitia scan QR</li>
          </ul>
          <button className="btn-outline">Lokasi TPS</button>
        </div>
      </div>
    </div>
  </section>
)

export default VotingModeSection
