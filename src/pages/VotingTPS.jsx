import { useState, useEffect } from 'react';
import { useNavigate } from '../utils/navigation';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import '../styles/VotingTPS.css';

export default function VotingTPS() {
  const navigate = useNavigate();
  const [votingStatus, setVotingStatus] = useState('open'); // open, closed, not_started
  
  const currentUser = sessionStorage.getItem('currentUser') 
    ? JSON.parse(sessionStorage.getItem('currentUser')) 
    : null;

  const mahasiswaData = {
    nama: currentUser?.nim === '2110510001' ? "Budi Santoso" :
          currentUser?.nim === '2110510002' ? "Siti Nurhaliza" :
          currentUser?.nim === '2110510003' ? "Ahmad Fauzi" :
          currentUser?.nim === '2110510004' ? "Dewi Lestari" :
          "Ahmad Fauzi",
    nim: currentUser?.nim || "2110510023"
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleScanQR = () => {
    if (votingStatus === 'open') {
      navigate('/voting-tps/scanner');
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="voting-tps-page">
      <PageHeader 
        title="Voting via TPS"
        user={mahasiswaData}
        onLogout={handleLogout}
      />

      <main className="voting-tps-container">
        <div className="voting-tps-content">
          <div className="tps-header">
            <button 
              className="btn-back"
              onClick={() => navigate('/dashboard')}
            >
              ← Kembali ke Dashboard
            </button>
          </div>

          <div className="tps-intro-card">
            <div className="tps-icon">🗳️</div>
            <h1>Voting via TPS</h1>
            <p className="tps-description">
              Untuk melakukan voting di Tempat Pemungutan Suara (TPS), 
              silakan scan QR yang ditampilkan oleh panitia.
            </p>

            {votingStatus === 'open' ? (
              <button 
                className="btn-scan-qr"
                onClick={handleScanQR}
              >
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
              <li>
                <span className="info-icon">✓</span>
                QR hanya dapat dipindai di lokasi TPS
              </li>
              <li>
                <span className="info-icon">✓</span>
                Pastikan QR yang dipindai adalah QR resmi dari panitia
              </li>
              <li>
                <span className="info-icon">✓</span>
                Setiap mahasiswa hanya dapat memilih satu kali
              </li>
              <li>
                <span className="info-icon">✓</span>
                Pilihan yang telah disubmit tidak dapat diubah
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
