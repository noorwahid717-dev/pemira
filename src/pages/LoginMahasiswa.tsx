import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateDemoCredentials } from '../data/mockVoters'
import { useVotingSession } from '../hooks/useVotingSession'
import type { DemoVoter } from '../types/voting'
import '../styles/LoginMahasiswa.css'

type LoginFormData = {
  nim: string
  tanggalLahir: string
  otp: string
}

type LoginErrors = Partial<Record<'nim' | 'tanggalLahir' | 'otp' | 'general', string>>

type DemoAccountPrefill = {
  nim?: string
  tanggalLahir?: string
}

const readDemoPrefill = (): DemoAccountPrefill => {
  const raw = window.sessionStorage.getItem('demoAccount')
  if (!raw) return {}
  try {
    return JSON.parse(raw) as DemoAccountPrefill
  } catch {
    return {}
  }
}

const LoginMahasiswa = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()

  const demoAccount = readDemoPrefill()

  const [formData, setFormData] = useState<LoginFormData>({
    nim: demoAccount.nim ?? '',
    tanggalLahir: demoAccount.tanggalLahir ?? '',
    otp: '',
  })
  const [useOTP, setUseOTP] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [countdown])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'nim') {
      const numericValue = value.replace(/\D/g, '')
      setFormData((prev) => ({ ...prev, nim: numericValue }))
    } else if (name === 'tanggalLahir') {
      let formatted = value.replace(/\D/g, '')
      if (formatted.length >= 2) {
        formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`
      }
      if (formatted.length >= 5) {
        formatted = `${formatted.slice(0, 5)}/${formatted.slice(5, 9)}`
      }
      setFormData((prev) => ({ ...prev, tanggalLahir: formatted.slice(0, 10) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleOTPToggle = () => {
    setUseOTP((prev) => !prev)
    setFormData((prev) => ({ ...prev, tanggalLahir: '', otp: '' }))
    setErrors({})
  }

  const sendOTP = () => {
    if (!formData.nim) {
      setErrors({ nim: 'NIM harus diisi terlebih dahulu' })
      return
    }

    setLoading(true)

    window.setTimeout(() => {
      setOtpSent(true)
      setCountdown(30)
      setLoading(false)
      window.alert('OTP telah dikirim ke email kampus Anda')
    }, 1000)
  }

  const validateForm = () => {
    const newErrors: LoginErrors = {}

    if (!formData.nim) {
      newErrors.nim = 'NIM harus diisi'
    } else if (formData.nim.length < 8) {
      newErrors.nim = 'NIM tidak valid'
    }

    if (useOTP) {
      if (!otpSent) {
        newErrors.otp = 'Silakan kirim OTP terlebih dahulu'
      } else if (!formData.otp) {
        newErrors.otp = 'Kode OTP harus diisi'
      } else if (formData.otp.length !== 6) {
        newErrors.otp = 'Kode OTP harus 6 digit'
      }
    } else if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir harus diisi'
    } else if (formData.tanggalLahir.length !== 10) {
      newErrors.tanggalLahir = 'Format tanggal tidak valid (DD/MM/YYYY)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const persistLogin = (voter: DemoVoter) => {
    setSession({
      nim: voter.nim,
      hasVoted: voter.hasVoted,
      votingStatus: voter.votingStatus,
    })
    window.sessionStorage.removeItem('demoAccount')
    navigate('/dashboard', { replace: true })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isBlocked) return
    if (!validateForm()) return

    setLoading(true)

    window.setTimeout(() => {
      const matchedAccount = useOTP
        ? validateDemoCredentials({ method: 'otp', nim: formData.nim, otp: formData.otp })
        : validateDemoCredentials({ method: 'birthdate', nim: formData.nim, tanggalLahir: formData.tanggalLahir })

      if (matchedAccount) {
        persistLogin(matchedAccount)
      } else {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        if (newAttempts >= 3) {
          setIsBlocked(true)
          setErrors({
            general: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit atau hubungi panitia.',
          })
          window.setTimeout(() => {
            setIsBlocked(false)
            setLoginAttempts(0)
            setErrors({})
          }, 300000)
        } else if (useOTP) {
          setErrors({ otp: 'Kode OTP tidak valid atau sudah kedaluwarsa' })
        } else {
          setErrors({ tanggalLahir: 'Tanggal lahir tidak sesuai dengan data kampus' })
        }
      }

      setLoading(false)
    }, 1500)
  }

  const isFormValid = () => {
    if (!formData.nim || formData.nim.length < 8) return false
    if (useOTP) {
      return otpSent && formData.otp.length === 6
    }
    return formData.tanggalLahir.length === 10
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-container">
          <div className="header-logo">
            <div className="logo-circle">P</div>
            <span className="logo-text">PEMIRA UNIWA</span>
          </div>
          <a href="/" className="btn-back">
            Kembali ke Beranda
          </a>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-left">
            <div className="login-illustration">
              <div className="illustration-mockup">
                <div className="mockup-voting-card">
                  <div className="voting-icon">🗳️</div>
                  <div className="voting-lines">
                    <div className="line" />
                    <div className="line" />
                    <div className="line short" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="login-title">
              Masuk untuk Mengikuti
              <br />
              PEMIRA UNIWA
            </h1>
            <p className="login-subtitle">Akses voting online dan informasi kandidat.</p>
          </div>

          <div className="login-right">
            <div className="login-card">
              <h2 className="card-title">Masuk sebagai Mahasiswa</h2>
              <p className="card-subtitle">Gunakan NIM dan verifikasi identitas Anda.</p>

              {errors.general && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠</span>
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="nim">NIM</label>
                  <input
                    type="text"
                    id="nim"
                    name="nim"
                    value={formData.nim}
                    onChange={handleInputChange}
                    placeholder="contoh: 2110510023"
                    maxLength={15}
                    className={errors.nim ? 'error' : ''}
                    disabled={isBlocked}
                  />
                  {errors.nim && (
                    <span className="error-message">
                      <span className="error-icon">⚠</span> {errors.nim}
                    </span>
                  )}
                </div>

                <div className="form-divider">
                  <div className="checkbox-group">
                    <input type="checkbox" id="useOTP" checked={useOTP} onChange={handleOTPToggle} disabled={isBlocked} />
                    <label htmlFor="useOTP">Kirim OTP ke Email Kampus</label>
                  </div>
                </div>

                {useOTP ? (
                  <div className="otp-section">
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={sendOTP}
                        className="btn-send-otp"
                        disabled={loading || !formData.nim || isBlocked}
                      >
                        {loading ? 'Mengirim...' : 'Kirim OTP'}
                      </button>
                    ) : (
                      <>
                        <div className="form-group">
                          <label htmlFor="otp">Kode OTP</label>
                          <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={formData.otp}
                            onChange={handleInputChange}
                            placeholder="Masukkan 6 digit OTP"
                            maxLength={6}
                            className={errors.otp ? 'error' : ''}
                            disabled={isBlocked}
                          />
                          <span className="input-hint">OTP dikirim ke email: {formData.nim}@uniwa.ac.id</span>
                          {errors.otp && (
                            <span className="error-message">
                              <span className="error-icon">⚠</span> {errors.otp}
                            </span>
                          )}
                        </div>
                        {countdown > 0 ? (
                          <p className="resend-timer">Kirim ulang dalam {countdown} detik</p>
                        ) : (
                          <button type="button" onClick={sendOTP} className="btn-resend" disabled={loading || isBlocked}>
                            Kirim Ulang OTP
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="tanggalLahir">Tanggal Lahir</label>
                    <input
                      type="text"
                      id="tanggalLahir"
                      name="tanggalLahir"
                      value={formData.tanggalLahir}
                      onChange={handleInputChange}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      className={errors.tanggalLahir ? 'error' : ''}
                      disabled={isBlocked}
                    />
                    {errors.tanggalLahir && (
                      <span className="error-message">
                        <span className="error-icon">⚠</span> {errors.tanggalLahir}
                      </span>
                    )}
                  </div>
                )}

                <button type="submit" className="btn-submit" disabled={!isFormValid() || loading || isBlocked}>
                  {loading ? '⏳ Memverifikasi...' : 'Masuk Sekarang'}
                </button>
              </form>

              <div className="form-footer">
                <p className="help-text">Tidak bisa masuk?</p>
                <div className="help-links">
                  <a href="#hubungi">Hubungi panitia</a>
                  <span className="separator">•</span>
                  <a href="#panduan">Lihat panduan login</a>
                  <span className="separator">•</span>
                  <a href="/admin/login">Masuk sebagai Admin</a>
                </div>
              </div>

              <div className="privacy-notice">
                <p>
                  🔒 Data Anda digunakan hanya untuk proses verifikasi dan tidak disimpan untuk keperluan lain. Suara Anda
                  tetap terjamin rahasianya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginMahasiswa
