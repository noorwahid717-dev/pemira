import '../styles/HeroSection.css';

export default function HeroSection() {
  const currentStatus = "Voting Dibuka 12–15 Juni 2024";
  
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            Pemilihan Ketua BEM<br />
            Universitas Wahidiyah
          </h1>
          
          <p className="hero-subtitle">
            Sistem pemilu kampus yang aman, transparan, dan modern.
          </p>

          <div className="hero-badge">
            <span className="badge-status">Status: {currentStatus}</span>
          </div>

          <div className="hero-info">
            <div className="info-item">
              <span className="info-label">Periode Voting:</span>
              <span className="info-value">12–15 Juni 2024</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Pemilih Terdaftar:</span>
              <span className="info-value">8.432 Mahasiswa</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mode:</span>
              <span className="info-value">Online & TPS Offline</span>
            </div>
          </div>

          <div className="hero-cta">
            <a href="/login">
              <button className="btn-primary btn-large">Masuk untuk Memilih</button>
            </a>
            <a href="#kandidat">
              <button className="btn-outline btn-large">Lihat Kandidat</button>
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="card-mockup">
              <div className="mockup-header">Kandidat BEM 2024</div>
              <div className="mockup-cards">
                <div className="mockup-card">
                  <div className="mockup-avatar"></div>
                  <div className="mockup-text"></div>
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar"></div>
                  <div className="mockup-text"></div>
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar"></div>
                  <div className="mockup-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
