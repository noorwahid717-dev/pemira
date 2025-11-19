import { useNavigate } from 'react-router-dom'
import { demoAccountCards } from '../data/demoAccounts'
import { demoFeatureList, quickLinks } from '../data/dashboard'
import '../styles/DemoAccounts.css'

const notifyCopy = (text: string) => window.alert(`Copied: ${text}`)

const DemoAccounts = (): JSX.Element => {
  const navigate = useNavigate()

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      notifyCopy(text)
    } catch {
      notifyCopy(text)
    }
  }

  const handleAutoFill = (accountIndex: number) => {
    const account = demoAccountCards[accountIndex]
    window.sessionStorage.setItem('demoAccount', JSON.stringify({ nim: account.nim, tanggalLahir: account.tanggalLahir }))
    navigate('/login')
  }

  return (
    <div className="demo-accounts-page">
      <header className="demo-header">
        <div className="demo-header-container">
          <div className="header-logo">
            <div className="logo-circle">P</div>
            <span className="logo-text">PEMIRA UNIWA</span>
          </div>
          <button className="btn-back" onClick={() => navigate('/')} type="button">
            Kembali ke Beranda
          </button>
        </div>
      </header>

      <main className="demo-main">
        <div className="demo-container">
          <div className="demo-hero">
            <h1 className="demo-title">🧪 Akun Demo untuk Testing</h1>
            <p className="demo-subtitle">Gunakan akun di bawah untuk menguji berbagai fitur dan state aplikasi PEMIRA UNIWA</p>
          </div>

          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <strong>Catatan:</strong>
              <ul>
                <li>
                  Semua akun menggunakan password yang sama: <code>demo123</code>
                </li>
                <li>
                  Untuk login dengan OTP, gunakan kode: <code>123456</code>
                </li>
                <li>Klik tombol &quot;Auto Fill &amp; Login&quot; untuk otomatis mengisi form</li>
                <li>Akun ini hanya untuk demo, data akan di-reset berkala</li>
              </ul>
            </div>
          </div>

          <div className="accounts-grid">
            {demoAccountCards.map((account, index) => (
              <div key={account.nim} className="account-card">
                <div className="account-header">
                  <div className="account-icon">👤</div>
                  <div className="account-role">
                    <h3>{account.role}</h3>
                    <span className={`account-badge badge-${account.hasVoted ? 'success' : 'warning'}`}>{account.statusLabel}</span>
                  </div>
                </div>

                <div className="account-details">
                  <div className="detail-row">
                    <span className="detail-label">NIM:</span>
                    <div className="detail-value">
                      <code>{account.nim}</code>
                      <button className="btn-copy" onClick={() => handleCopy(account.nim)} title="Copy NIM" type="button">
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Password:</span>
                    <div className="detail-value">
                      <code>{account.password}</code>
                      <button className="btn-copy" onClick={() => handleCopy(account.password)} title="Copy Password" type="button">
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
                        type="button"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="detail-info">
                    <span>
                      Voting Status:{' '}
                      <strong>
                        {account.votingStatus === 'open'
                          ? 'Dibuka'
                          : account.votingStatus === 'not_started'
                            ? 'Belum Dibuka'
                            : 'Ditutup'}
                      </strong>
                    </span>
                  </div>
                </div>

                <button className="btn-autofill" onClick={() => handleAutoFill(index)} type="button">
                  Auto Fill &amp; Login →
                </button>
              </div>
            ))}
          </div>

          <div className="demo-footer">
            <h3>Fitur yang dapat ditest:</h3>
            <div className="features-grid">
              {demoFeatureList.map((feature) => (
                <div key={feature.label} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-links">
            <h3>Quick Links:</h3>
            <div className="links-row">
              {quickLinks.map((link) => (
                <a key={link.href} href={link.href} className="quick-link">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DemoAccounts
