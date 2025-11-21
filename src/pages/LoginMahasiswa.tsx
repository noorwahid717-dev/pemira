import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { loginUser } from '../services/auth'
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
    const info = infoRef.current
    if (header) header.classList.add('reveal-in')
    if (info) info.classList.add('reveal-left')
    if (card) card.classList.add('reveal-card')

    const onMouseMove = (event: MouseEvent) => {
      if (!info) return
      const rect = info.getBoundingClientRect()
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 6
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 6
      info.style.setProperty('--parallax-x', `${offsetX}px`)
      info.style.setProperty('--parallax-y', `${offsetY}px`)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
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
      <header className="login-hero" ref={headerRef}>
        <div className="login-hero-inner">
          <div className="hero-logos">
            <div className="hero-logo">PEMIRA</div>
            <div className="hero-logo muted">UNIVA</div>
          </div>
          <p className="badge">PEMIRA UNIVA 2025</p>
          <h1>Masuk untuk Mengikuti Pemilihan</h1>
          <p className="subcopy">Gunakan kredensial yang telah Anda daftarkan melalui sistem PEMIRA.</p>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-left premium-left" ref={infoRef}>
            <div className="info-panel">
              <h2>Info Penting</h2>
              <ul>
                <li>Gunakan kredensial yang diberikan KPUM atau yang Anda daftarkan.</li>
                <li>Jangan membagikan username & password kepada siapapun.</li>
                <li>Jika belum punya akun, daftar melalui halaman pendaftaran resmi.</li>
              </ul>
              <p className="small-note">Kendala? Hubungi KPUM di helpdesk PEMIRA.</p>
              <div className="mini-illustration" aria-hidden="true" />
            </div>
          </div>

          <div className="login-right">
            <div className={`login-card premium-card ${shake ? 'shake' : ''}`} ref={cardRef}>
              <div className="card-header">
                <p className="label">Login</p>
                <h3>Masuk Pemilih</h3>
                <p className="card-subtitle">Masukkan kredensial untuk mengakses bilik suara online.</p>
              </div>
              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  <input name="username" placeholder=" " value={formData.username} onChange={handleInputChange} autoComplete="username" required />
                  <span className="floating-label">Username / Email UNIVA</span>
                </label>
                <label>
                  <div className="password-field">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder=" "
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                    />
                    <span className="floating-label">Password</span>
                    <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                {error && <div className="error-box">{error}</div>}

                <p className="micro-security">Pastikan Anda mengakses dari perangkat yang aman.</p>

                <button type="submit" className="btn-primary cta-premium" disabled={loading || !formData.username || !formData.password}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
                <p className="helper">
                  Belum punya akun? <a href="/register">Daftar sekarang</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginMahasiswa
