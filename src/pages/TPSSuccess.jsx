import { useEffect, useState } from 'react';
import { useNavigate } from '../utils/navigation';
import '../styles/TPSSuccess.css';

export default function TPSSuccess() {
  const navigate = useNavigate();
  const [voteData, setVoteData] = useState(null);

  useEffect(() => {
    const storedVoteData = sessionStorage.getItem('voteData');
    
    if (!storedVoteData) {
      navigate('/dashboard');
      return;
    }

    setVoteData(JSON.parse(storedVoteData));
  }, []);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      timeZoneName: 'short'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!voteData) return null;

  return (
    <div className="tps-success-page">
      <div className="success-container">
        <div className="success-card">
          
          <div className="success-icon">
            <div className="checkmark-circle">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>

          <h1 className="success-title">Terima Kasih!</h1>
          <p className="success-message">
            Suara Anda telah berhasil dicatat
          </p>

          <div className="success-details">
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <span className="detail-label">Lokasi TPS</span>
                <span className="detail-value">{voteData.tpsName}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">🕐</span>
              <div className="detail-content">
                <span className="detail-label">Waktu Voting</span>
                <span className="detail-value">{formatDateTime(voteData.votedAt)}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">🔐</span>
              <div className="detail-content">
                <span className="detail-label">Token Bukti (Anonim)</span>
                <span className="detail-value token">{voteData.token}</span>
              </div>
            </div>
          </div>

          <div className="success-note">
            <span className="note-icon">ℹ️</span>
            <p>
              Token ini bersifat anonim dan tidak terhubung dengan identitas Anda.
              Simpan token sebagai bukti partisipasi.
            </p>
          </div>

          <div className="success-actions">
            <button 
              className="btn-dashboard"
              onClick={handleBackToDashboard}
            >
              Kembali ke Dashboard
            </button>
          </div>

          <div className="success-footer">
            <p>Suara Anda sangat berarti untuk masa depan UNIWA yang lebih baik.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
