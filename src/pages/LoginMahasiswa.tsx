import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PemiraLogos from '../components/shared/PemiraLogos'
import { useVotingSession } from '../hooks/useVotingSession'
import { loginUser } from '../services/auth'
import LoadingScreen from '../components/LoadingScreen'
import '../styles/LoginMahasiswa.css'

type LoginFormData = {
  username: string
  password: string
}

const LoginMahasiswa = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()
  const headerRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const infoRef = useRef<HTMLDivElement | null>(null)

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const header = headerRef.current
    const card = cardRef.current
    if (header) header.classList.add('reveal-in')
    if (card) card.classList.add('reveal-card')
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    loginUser(formData.username.trim(), formData.password)
      .then((response) => {
        setSession({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: {
            id: response.user.id,
            username: response.user.username,
            role: response.user.role,
            voterId: response.user.voter_id,
            profile: response.user.profile,
          },
          votingStatus: 'not_started',
          hasVoted: false,
        })
        navigate('/dashboard')
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Login gagal. Periksa username/password.')
        setShake(true)
        setTimeout(() => setShake(false), 300)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="login-page premium-page">
      <header className="login-topbar new-appbar" ref={headerRef}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <PemiraLogos size="lg" title="PEMIRA UNIWA 2025" className="auth-logo-large" />
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="auth-shell fade-in-up">
          <div className="auth-heading">
            <p className="eyebrow">LOGIN</p>
            <h1>Masuk Pemilih</h1>
            <p className="heading-sub">Gunakan akun PEMIRA atau akun kampus Anda.</p>
          </div>

          <div className={`login-card premium-card ${shake ? 'shake' : ''}`} ref={cardRef}>
            <form onSubmit={handleSubmit} className="login-form">
              <label className="form-field">
                <span className="field-label">NIM/NIDN/NIP / Email UNIWA</span>
                <input name="username" value={formData.username} onChange={handleInputChange} autoComplete="username" required />
              </label>
              <label className="form-field">
                <span className="field-label">Password</span>
                <div className="password-field">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {error && <p className="field-error">{error}</p>}
              </label>

              <p className="micro-security">Pastikan Anda mengakses dari perangkat yang aman.</p>

              <button type="submit" className="btn-primary cta-premium btn-full" disabled={loading || !formData.username || !formData.password}>
                {loading ? 'Memproses...' : 'Masuk untuk Memilih'}
              </button>
              <div className="auth-links">
                <a href="/register">Belum punya akun? Daftar sekarang</a>
                <a href="/panduan">Lupa password? Hubungi panitia PEMIRA</a>
              </div>
            </form>
          </div>

          <details className="info-accordion" ref={infoRef}>
            <summary>
              <span>ℹ️ Info penting</span>
              <span className="accordion-icon">+</span>
            </summary>
            <div className="accordion-body">
              <ul>
                <li>Gunakan kredensial yang diberikan PEMIRA atau yang Anda daftarkan.</li>
                <li>Jangan membagikan email & password kepada siapapun.</li>
                <li>Jika belum punya akun, daftar melalui halaman pendaftaran resmi.</li>
              </ul>
            </div>
          </details>
        </div>
      </main>

      {loading && (
        <div className="app-loading-overlay">
          <LoadingScreen message="Memproses login..." inline />
        </div>
      )}
    </div>
  )
}

export default LoginMahasiswa
