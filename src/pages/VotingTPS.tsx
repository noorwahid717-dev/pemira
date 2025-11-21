import { Navigate, useNavigate } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'
import { useVotingSession } from '../hooks/useVotingSession'
import { tpsInfoChecklist } from '../data/voting'
import '../styles/VotingTPS.css'

const VotingTPS = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa, clearSession } = useVotingSession()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const votingStatus = session.votingStatus ?? 'open'

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const handleScanQR = () => {
    if (votingStatus === 'open') {
      navigate('/voting-tps/scanner')
    }
  }

  return (
    <div className="voting-tps-page">
      <PageHeader title="Voting via TPS" user={mahasiswa} onLogout={handleLogout} />

      <main className="voting-tps-container">
        <div className="voting-tps-content">
          <div className="tps-header">
            <button className="btn-back" onClick={() => navigate('/dashboard')}>
              ← Kembali ke Dashboard
            </button>
          </div>

          <div className="tps-intro-card">
            <div className="tps-icon">🗳️</div>
            <h1>Voting via TPS</h1>
            <p className="tps-description">
              Untuk melakukan voting di Tempat Pemungutan Suara (TPS), silakan scan QR yang ditampilkan oleh panitia.
            </p>

            {votingStatus === 'open' ? (
              <button className="btn-scan-qr" onClick={handleScanQR}>
                <span className="scan-icon">📷</span>
                Scan QR Panitia
              </button>
            ) : votingStatus === 'not_started' ? (
              <div className="voting-status-notice warning">
                <span className="notice-icon">⏳</span>
                <div className="notice-content">
                  <strong>Voting belum dibuka</strong>
                  <p>Coba kembali nanti.</p>
                </div>
              </div>
            ) : (
              <div className="voting-status-notice error">
                <span className="notice-icon">🔒</span>
                <div className="notice-content">
                  <strong>Voting telah ditutup</strong>
                  <p>Terima kasih atas partisipasi Anda.</p>
                </div>
              </div>
            )}
          </div>

          <div className="tps-info-section">
            <h3>Informasi Penting</h3>
            <ul className="tps-info-list">
              {tpsInfoChecklist.map((info) => (
                <li key={info}>
                  <span className="info-icon">✓</span>
                  {info}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VotingTPS
