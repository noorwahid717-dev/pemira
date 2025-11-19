import '../styles/DemoAccounts.css';

export default function DemoAccounts() {
  const demoAccounts = [
    {
      role: "Mahasiswa (Belum Voting)",
      nim: "2110510001",
      password: "demo123",
      tanggalLahir: "01/01/2000",
      status: "Belum memilih",
      votingStatus: "open",
      hasVoted: false
    },
    {
      role: "Mahasiswa (Sudah Voting)",
      nim: "2110510002",
      password: "demo123",
      tanggalLahir: "02/02/2000",
      status: "Sudah memilih",
      votingStatus: "open",
      hasVoted: true
    },
    {
      role: "Mahasiswa (Voting Belum Dibuka)",
      nim: "2110510003",
      password: "demo123",
      tanggalLahir: "03/03/2000",
      status: "Menunggu",
      votingStatus: "not_started",
      hasVoted: false
    },
    {
      role: "Mahasiswa (Voting Ditutup)",
      nim: "2110510004",
      password: "demo123",
      tanggalLahir: "04/04/2000",
      status: "Sudah memilih",
      votingStatus: "closed",
      hasVoted: true
    }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const handleAutoFill = (account) => {
    // Store demo account data in sessionStorage
    sessionStorage.setItem('demoAccount', JSON.stringify(account));
    window.location.href = '/login';
  };

  return (
    <div className="demo-accounts-page">
      <header className="demo-header">
        <div className="demo-header-container">
          <div className="header-logo">
            <div className="logo-circle">P</div>
            <span className="logo-text">PEMIRA UNIWA</span>
          </div>
          <a href="/" className="btn-back">Kembali ke Beranda</a>
        </div>
      </header>

      <main className="demo-main">
        <div className="demo-container">
          <div className="demo-hero">
            <h1 className="demo-title">🧪 Akun Demo untuk Testing</h1>
            <p className="demo-subtitle">
              Gunakan akun di bawah untuk menguji berbagai fitur dan state aplikasi PEMIRA UNIWA
            </p>
          </div>

          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <strong>Catatan:</strong>
              <ul>
                <li>Semua akun menggunakan password yang sama: <code>demo123</code></li>
                <li>Untuk login dengan OTP, gunakan kode: <code>123456</code></li>
                <li>Klik tombol "Auto Fill & Login" untuk otomatis mengisi form</li>
                <li>Akun ini hanya untuk demo, data akan di-reset berkala</li>
              </ul>
            </div>
          </div>

          <div className="accounts-grid">
            {demoAccounts.map((account, index) => (
              <div key={index} className="account-card">
                <div className="account-header">
                  <div className="account-icon">👤</div>
                  <div className="account-role">
                    <h3>{account.role}</h3>
                    <span className={`account-badge badge-${account.hasVoted ? 'success' : 'warning'}`}>
                      {account.status}
                    </span>
                  </div>
                </div>

                <div className="account-details">
                  <div className="detail-row">
                    <span className="detail-label">NIM:</span>
                    <div className="detail-value">
                      <code>{account.nim}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopy(account.nim)}
                        title="Copy NIM"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Password:</span>
                    <div className="detail-value">
                      <code>{account.password}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopy(account.password)}
                        title="Copy Password"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Tanggal Lahir:</span>
                    <div className="detail-value">
                      <code>{account.tanggalLahir}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopy(account.tanggalLahir)}
                        title="Copy Tanggal Lahir"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="detail-info">
                    <span>Voting Status: <strong>{
                      account.votingStatus === 'open' ? 'Dibuka' :
                      account.votingStatus === 'not_started' ? 'Belum Dibuka' :
                      'Ditutup'
                    }</strong></span>
                  </div>
                </div>

                <button 
                  className="btn-autofill"
                  onClick={() => handleAutoFill(account)}
                >
                  Auto Fill & Login →
                </button>
              </div>
            ))}
          </div>

          <div className="demo-footer">
            <h3>Fitur yang dapat ditest:</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>Login dengan NIM + Tanggal Lahir</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Login dengan OTP Email</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Dashboard dengan berbagai state</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🗳️</span>
                <span>Proses voting online</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📷</span>
                <span>Generate QR untuk TPS</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Bukti pemilihan</span>
              </div>
            </div>
          </div>

          <div className="quick-links">
            <h3>Quick Links:</h3>
            <div className="links-row">
              <a href="/" className="quick-link">🏠 Landing Page</a>
              <a href="/login" className="quick-link">🔐 Login</a>
              <a href="/dashboard" className="quick-link">📊 Dashboard</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
