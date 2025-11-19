import { useState } from 'react';
import '../styles/DashboardPemilih.css';

export default function DashboardPemilih() {
  // Get user state from sessionStorage
  const currentUser = sessionStorage.getItem('currentUser') 
    ? JSON.parse(sessionStorage.getItem('currentUser')) 
    : null;

  // Simulasi status pemilih
  const [hasVoted, setHasVoted] = useState(currentUser?.hasVoted || false);
  const [votingStatus, setVotingStatus] = useState(currentUser?.votingStatus || 'open'); // 'not_started', 'open', 'closed'
  const [qrGenerated, setQrGenerated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const mahasiswaData = {
    nama: currentUser?.nim === '2110510001' ? "Budi Santoso" :
          currentUser?.nim === '2110510002' ? "Siti Nurhaliza" :
          currentUser?.nim === '2110510003' ? "Ahmad Fauzi" :
          currentUser?.nim === '2110510004' ? "Dewi Lestari" :
          "Ahmad Fauzi",
    nim: currentUser?.nim || "2110510023",
    fakultas: "Fakultas Teknik Informatika"
  };

  const pemiraInfo = {
    periodeVoting: "12–15 Juni 2024",
    modeVoting: "Online & TPS",
    jumlahKandidat: 3,
    lokasiTPS: "Aula Utama, Gedung FTI, Gedung FEB"
  };

  const votingData = hasVoted ? {
    waktu: "14 Juni 2024 — 10:24 WIB",
    token: "x8e3-a91c-d18f"
  } : null;

  const kandidatPreview = [
    { id: 1, nama: "Ahmad Fauzi", foto: "1" },
    { id: 2, nama: "Siti Nurhaliza", foto: "2" }
  ];

  const pengumuman = [
    { id: 1, text: "Debat publik akan dilaksanakan 13 Juni pukul 14.00 di Aula Utama." },
    { id: 2, text: "Voting online dibuka mulai 12 Juni 00:00." },
    { id: 3, text: "Pastikan data Anda sudah valid sebelum melakukan pemilihan." }
  ];

  const handleStartVotingOnline = () => {
    if (votingStatus !== 'open') return;
    window.location.href = '/voting';
  };

  const handleGenerateQR = () => {
    if (votingStatus !== 'open') return;
    setQrGenerated(true);
    alert('QR Hak Suara berhasil digenerate!');
    // Redirect ke halaman QR
    // window.location.href = '/qr-hak-suara';
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      window.location.href = '/';
    }
  };

  const getBannerContent = () => {
    if (votingStatus === 'not_started') {
      return {
        type: 'info',
        icon: 'ℹ️',
        title: 'Voting belum dibuka',
        subtitle: 'Periode voting dimulai 12 Juni pukul 00:00.',
        showCTA: false
      };
    }

    if (votingStatus === 'closed') {
      return {
        type: 'success',
        icon: '✓',
        title: 'Voting telah ditutup',
        subtitle: 'Terima kasih atas partisipasi Anda.',
        showCTA: false
      };
    }

    if (hasVoted) {
      return {
        type: 'success',
        icon: '✓',
        title: 'Anda sudah melakukan pemilihan',
        subtitle: `Waktu voting: ${votingData.waktu}`,
        showCTA: true,
        ctaText: 'Lihat Informasi Pemira',
        ctaAction: () => window.location.href = '#kandidat'
      };
    }

    return {
      type: 'warning',
      icon: '⚠',
      title: 'Anda BELUM melakukan pemilihan',
      subtitle: `Periode Voting: ${pemiraInfo.periodeVoting}`,
      description: 'Silakan pilih salah satu metode di bawah.',
      showCTA: true
    };
  };

  const banner = getBannerContent();

  return (
    <div className="dashboard-page">
      {/* Dev Controls - Remove in production */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        fontSize: '0.875rem'
      }}>
        <strong>Dev Controls:</strong>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setHasVoted(!hasVoted)}
            style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}
          >
            Toggle Voted: {hasVoted ? '✓ Sudah' : '✗ Belum'}
          </button>
          <button 
            onClick={() => {
              const states = ['not_started', 'open', 'closed'];
              const current = states.indexOf(votingStatus);
              const next = states[(current + 1) % states.length];
              setVotingStatus(next);
            }}
            style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}
          >
            Status: {votingStatus}
          </button>
        </div>
      </div>

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
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="user-avatar">{mahasiswaData.nama.charAt(0)}</span>
                <span className="user-name">{mahasiswaData.nama}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{mahasiswaData.nama}</strong>
                      <span>{mahasiswaData.nim}</span>
                      <span>{mahasiswaData.fakultas}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="#profil" className="dropdown-item">Profil</a>
                  <a href="#aktivitas" className="dropdown-item">Log Aktivitas</a>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Banner Status */}
          <section className={`status-banner banner-${banner.type}`}>
            <div className="banner-content">
              <div className="banner-icon">{banner.icon}</div>
              <div className="banner-text">
                <h2 className="banner-title">{banner.title}</h2>
                <p className="banner-subtitle">{banner.subtitle}</p>
                {banner.description && (
                  <p className="banner-description">{banner.description}</p>
                )}
              </div>
            </div>
            
            {banner.showCTA && !hasVoted && votingStatus === 'open' && (
              <div className="banner-cta">
                <button 
                  className="btn-primary btn-large"
                  onClick={handleStartVotingOnline}
                >
                  Mulai Pemilihan Online
                </button>
                <button 
                  className="btn-secondary btn-large"
                  onClick={handleGenerateQR}
                >
                  Pilih via TPS (Offline)
                </button>
              </div>
            )}

            {banner.showCTA && hasVoted && (
              <div className="banner-cta">
                <button 
                  className="btn-outline btn-large"
                  onClick={banner.ctaAction}
                >
                  {banner.ctaText}
                </button>
              </div>
            )}
          </section>

          {/* Main Grid Content */}
          <div className="dashboard-grid">
            {/* Kolom Kiri - Informasi */}
            <div className="dashboard-left">
              {/* Kartu Status Pemilu */}
              <div className="info-card">
                <h3 className="card-title">Status Pemilu</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Periode Voting</span>
                    <span className="info-value">{pemiraInfo.periodeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Mode Voting</span>
                    <span className="info-value">{pemiraInfo.modeVoting}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Jumlah Kandidat</span>
                    <span className="info-value">{pemiraInfo.jumlahKandidat}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lokasi TPS</span>
                    <span className="info-value">{pemiraInfo.lokasiTPS}</span>
                  </div>
                </div>
                <a href="#panduan" className="card-link">Lihat Panduan Pemilihan →</a>
              </div>

              {/* Kartu Kandidat */}
              <div className="info-card">
                <h3 className="card-title">Daftar Kandidat</h3>
                <p className="card-subtitle">{pemiraInfo.jumlahKandidat} Kandidat terdaftar</p>
                
                <div className="kandidat-preview">
                  {kandidatPreview.map((kandidat) => (
                    <div key={kandidat.id} className="kandidat-preview-item">
                      <div className="kandidat-avatar">{kandidat.foto}</div>
                      <span className="kandidat-name">{kandidat.nama}</span>
                    </div>
                  ))}
                </div>

                <a href="/kandidat">
                  <button className="btn-outline btn-block">Lihat Semua Kandidat</button>
                </a>
              </div>

              {/* Kartu Pengumuman */}
              <div className="info-card">
                <h3 className="card-title">Pengumuman Penting</h3>
                <div className="pengumuman-list">
                  {pengumuman.map((item) => (
                    <div key={item.id} className="pengumuman-item">
                      <span className="pengumuman-icon">📢</span>
                      <span className="pengumuman-text">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kolom Kanan - Tindakan */}
            <div className="dashboard-right">
              {!hasVoted && votingStatus === 'open' && (
                <div className="action-card">
                  <h3 className="card-title">Metode Pemilihan</h3>
                  
                  {/* Metode 1: Online */}
                  <div className="method-card">
                    <div className="method-icon">📱</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting Online</h4>
                      <p className="method-description">
                        Pilih kandidat langsung dari aplikasi.
                        Tersimpan secara otomatis dan aman.
                      </p>
                    </div>
                    <button 
                      className="btn-primary btn-block"
                      onClick={handleStartVotingOnline}
                    >
                      Mulai Voting Online
                    </button>
                  </div>

                  {/* Metode 2: TPS */}
                  <div className="method-card">
                    <div className="method-icon">📷</div>
                    <div className="method-content">
                      <h4 className="method-title">Voting di TPS (Offline)</h4>
                      <p className="method-description">
                        Dapatkan QR hak suara Anda.
                        Tunjukkan ke panitia di lokasi TPS.
                      </p>
                    </div>
                    <button 
                      className="btn-secondary btn-block"
                      onClick={handleGenerateQR}
                    >
                      Generate QR Hak Suara
                    </button>
                    {qrGenerated && (
                      <p className="method-note">✓ QR sudah digenerate</p>
                    )}
                  </div>
                </div>
              )}

              {hasVoted && (
                <div className="action-card">
                  <h3 className="card-title">Bukti Pemilihan</h3>
                  
                  <div className="bukti-card">
                    <div className="bukti-icon">✓</div>
                    <h4 className="bukti-title">Anda telah memilih pada:</h4>
                    <p className="bukti-waktu">{votingData.waktu}</p>
                    
                    <div className="bukti-token">
                      <span className="token-label">Token voting:</span>
                      <span className="token-value">{votingData.token}</span>
                    </div>

                    <p className="bukti-note">
                      🔒 Pilihan Anda tetap rahasia.
                    </p>

                    <button className="btn-outline btn-block">
                      Lihat Hasil Sementara
                    </button>
                  </div>
                </div>
              )}

              {votingStatus !== 'open' && (
                <div className="action-card">
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p className="empty-text">
                      {votingStatus === 'not_started' 
                        ? 'Voting akan segera dibuka' 
                        : 'Voting telah ditutup'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
