import '../styles/Footer.css'

const Footer = (): JSX.Element => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-circle">P</div>
            <span className="logo-text">PEMIRA UNIWA</span>
          </div>
          <p className="footer-tagline">
            Sistem pemilu kampus yang aman, transparan, dan modern.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Informasi</h4>
            <a href="#tentang">Tentang</a>
            <a href="#kandidat">Kandidat</a>
            <a href="#panduan">Panduan</a>
          </div>
          <div className="footer-column">
            <h4>Bantuan</h4>
            <a href="#tutorial">Tutorial Voting</a>
            <a href="#faq">FAQ</a>
            <a href="#kontak">Kontak Panitia</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#privacy">Kebijakan Privasi</a>
            <a href="#terms">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 PEMIRA UNIWA. All rights reserved.</p>
        <div className="footer-contact">
          <span>📞 Hotline Panitia: 0800-123-456</span>
          <span>📧 pemira@uniwa.ac.id</span>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
