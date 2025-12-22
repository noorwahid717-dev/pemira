import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PemiraLogos from '../components/shared/PemiraLogos'
import LoadingScreen from '../components/LoadingScreen'
import { resetPassword } from '../services/auth'
import '../styles/LoginMahasiswa.css'

type ResetFormData = {
  identifier: string
  newPassword: string
  confirmPassword: string
}

const ResetPassword = (): JSX.Element => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ResetFormData>({
    identifier: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [shake, setShake] = useState(false)
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setReveal(true))
    return () => window.cancelAnimationFrame(raf)
  }, [])

  const triggerShake = () => {
    setShake(true)
    window.setTimeout(() => setShake(false), 300)
  }

  const resolveResetError = (err: any) => {
    if (err?.code === 'VOTER_NOT_REGISTERED') {
      return err?.message ?? 'NIM/NIDN/NIP tidak terdaftar atau belum memiliki akun.'
    }
    const fallback = 'Reset password gagal. Coba lagi.'
    const message = err?.message
    if (!message) return fallback
    const lowered = String(message).toLowerCase()
    if (lowered.includes('username')) {
      return 'NIM/NIDN/NIP tidak terdaftar atau belum memiliki akun.'
    }
    return message
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const identifier = formData.identifier.trim()

    if (!identifier) {
      setError('NIM/NIDN/NIP wajib diisi.')
      triggerShake()
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password minimal 6 karakter.')
      triggerShake()
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      triggerShake()
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await resetPassword(identifier, formData.newPassword)
      setSuccess(response?.message ?? 'Password berhasil direset.')
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }))
    } catch (err: any) {
      setError(resolveResetError(err))
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page premium-page">
      <header className={`login-topbar new-appbar ${reveal ? 'reveal-in' : ''}`}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <PemiraLogos size="lg" title="PEMIRA UNIWA 2025" className="auth-logo-large" />
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="auth-shell fade-in-up">
          <div className="auth-heading">
            <p className="eyebrow">RESET PASSWORD</p>
            <h1>Atur Ulang Password</h1>
            <p className="heading-sub">Masukkan NIM/NIDN/NIP dan password baru Anda.</p>
          </div>

          <div className={`login-card premium-card ${reveal ? 'reveal-card' : ''} ${shake ? 'shake' : ''}`}>
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">!</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">OK</span>
                <span>{success}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="login-form">
              <label className="form-field">
                <span className="field-label">NIM/NIDN/NIP</span>
                <input
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="form-field">
                <span className="field-label">Password Baru</span>
                <div className="password-field">
                  <input
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <label className="form-field">
                <span className="field-label">Konfirmasi Password</span>
                <div className="password-field">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button type="button" className="btn-ghost" onClick={() => setShowConfirm((prev) => !prev)}>
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button type="submit" className="btn-primary cta-premium btn-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Reset Password'}
              </button>
              <div className="auth-links">
                <a href="/login" onClick={(event) => { event.preventDefault(); navigate('/login') }}>
                  Kembali ke Login
                </a>
                <a href="/kontak">Butuh bantuan? Hubungi panitia</a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {loading && (
        <div className="app-loading-overlay">
          <LoadingScreen message="Memproses reset password..." inline />
        </div>
      )}
    </div>
  )
}

export default ResetPassword
