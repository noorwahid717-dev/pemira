import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { loginUser, registerLecturerOrStaff, registerStudent, type RegisterResponse } from '../services/auth'
import { getVoterQr, rotateVoterQr } from '../services/voterQr'
import { useVotingSession } from '../hooks/useVotingSession'
import { ACTIVE_ELECTION_ID } from '../config/env'
import type { ApiError } from '../utils/apiClient'
import '../styles/LoginMahasiswa.css'

type Role = 'student' | 'lecturer' | 'staff'
type Mode = 'online' | 'tps'
type Step = 'form' | 'success-online' | 'success-tps' | 'duplicate' | 'fallback-tps'

const generateQrDataUri = (value: string): string => {
  const writer = new BrowserQRCodeSvgWriter()
  const svgElement = writer.write(value, 360, 360)
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  return `data:image/svg+xml;base64,${btoa(svgString)}`
}

const Register = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()

  const [step, setStep] = useState<Step>('form')
  const [role, setRole] = useState<Role>('student')
  const [mode, setMode] = useState<Mode>('online')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [studentForm, setStudentForm] = useState({ nim: '', name: '', email: '', password: '', program: '', angkatan: '', faculty: '' })
  const [staffForm, setStaffForm] = useState({ username: '', name: '', email: '', password: '', program: '', angkatan: '', faculty: '' })

  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrDataUri, setQrDataUri] = useState<string | null>(null)
  const [lastIdentity, setLastIdentity] = useState<{ username: string; mode: Mode; voterId?: number | null }>({ username: '', mode: 'online' })

  const heroRef = useRef<HTMLDivElement | null>(null)
  const formCardRef = useRef<HTMLDivElement | null>(null)
  const leftPanelRef = useRef<HTMLDivElement | null>(null)
  const stickyCtaRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef<number>(0)

  useEffect(() => {
    const hero = heroRef.current
    const card = formCardRef.current
    const left = leftPanelRef.current
    const sticky = stickyCtaRef.current

    const reveal = (el: HTMLElement | null, delay = 0) => {
      if (!el) return
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-in')
    }
    reveal(hero, 50)
    reveal(card, 150)
    reveal(left, 100)
    if (sticky) sticky.classList.add('sticky-cta-show')

    const onMouseMove = (event: MouseEvent) => {
      if (!left) return
      const rect = left.getBoundingClientRect()
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 8
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8
      left.style.setProperty('--parallax-x', `${offsetX}px`)
      left.style.setProperty('--parallax-y', `${offsetY}px`)
    }
    window.addEventListener('mousemove', onMouseMove)

    const onScroll = () => {
      const current = window.scrollY
      if (!sticky) return
      const goingDown = current > lastScrollY.current
      if (goingDown) {
        sticky.classList.add('sticky-cta-hide')
        sticky.classList.remove('sticky-cta-show')
      } else {
        sticky.classList.remove('sticky-cta-hide')
        sticky.classList.add('sticky-cta-show')
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!qrToken) return
    try {
      setQrDataUri(generateQrDataUri(qrToken))
    } catch (err) {
      console.warn('Failed to generate QR', err)
      setQrDataUri(null)
    }
  }, [qrToken])

  const canSubmit = agree && !loading

  const handleRegisterSuccess = async (resp: RegisterResponse, username: string, password: string) => {
    setLastIdentity({ username, mode, voterId: resp.user.voter_id ?? undefined })
    // auto login to fetch QR / set session
    try {
      const login = await loginUser(username, password)
      setSession({
        accessToken: login.access_token,
        refreshToken: login.refresh_token,
        user: {
          id: login.user.id,
          username: login.user.username,
          role: login.user.role,
          voterId: login.user.voter_id,
          profile: login.user.profile,
        },
        hasVoted: false,
        votingStatus: 'not_started',
      })

      if (mode === 'tps' && login.user.voter_id) {
        try {
          const qr = await rotateVoterQr(login.access_token, login.user.voter_id)
          setQrToken(qr.qr_token)
          setStep('success-tps')
          return
        } catch (err) {
          console.warn('Failed to generate TPS QR', err)
          setStep('fallback-tps')
          return
        }
      }

      setStep(mode === 'tps' ? 'fallback-tps' : 'success-online')
    } catch (err) {
      console.warn('Login after register failed', err)
      setStep(mode === 'tps' ? 'fallback-tps' : 'success-online')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      if (role === 'student') {
        const res = await registerStudent({
          nim: studentForm.nim.trim(),
          name: studentForm.name.trim(),
          email: studentForm.email.trim(),
          password: studentForm.password,
          faculty_name: studentForm.faculty.trim(),
          study_program_name: studentForm.program.trim(),
          cohort_year: studentForm.angkatan ? Number(studentForm.angkatan) : undefined,
          voting_mode: mode === 'tps' ? 'TPS' : 'ONLINE',
        })
        await handleRegisterSuccess(res, studentForm.nim.trim(), studentForm.password)
      } else {
        const type = role === 'lecturer' ? 'LECTURER' : 'STAFF'
        const res = await registerLecturerOrStaff({
          username: staffForm.username.trim(),
          name: staffForm.name.trim(),
          email: staffForm.email.trim(),
          password: staffForm.password,
          type,
          faculty_name: staffForm.faculty.trim(),
          department_name: role === 'lecturer' ? staffForm.program.trim() : undefined,
          unit_name: role === 'staff' ? staffForm.program.trim() : undefined,
          voting_mode: mode === 'tps' ? 'TPS' : 'ONLINE',
        })
        await handleRegisterSuccess(res, staffForm.username.trim(), staffForm.password)
      }
    } catch (err: any) {
      const apiErr = err as ApiError
      if (apiErr?.status === 409) {
        setStep('duplicate')
        return
      }
      setError(apiErr?.message ?? 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const onlineNote = useMemo(() => (mode === 'online' ? 'Anda hanya dapat memilih secara daring (online).' : 'Anda hanya dapat memilih di TPS sesuai jadwal.'), [mode])

  const renderSuccessOnline = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Pendaftaran Berhasil!</h2>
      <p>Anda terdaftar sebagai PEMILIH ONLINE pada PEMIRA UNIWA.</p>
      <div className="success-box">
        <p>Gunakan akun berikut untuk login pada hari pemilihan:</p>
        <p className="credential">
          Username: <strong>{lastIdentity.username}</strong>
        </p>
        <p className="credential">Password: gunakan yang baru Anda setel.</p>
      </div>
      <button className="btn-primary btn-block" onClick={() => navigate('/login')} type="button">
        Ke Halaman Login
      </button>
    </div>
  )

  const renderSuccessTPS = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Pendaftaran Berhasil!</h2>
      <p>Anda terdaftar sebagai PEMILIH OFFLINE (TPS). Tunjukkan QR berikut kepada panitia.</p>

      <div className="qr-box">
        {qrDataUri ? <img src={qrDataUri} alt="QR TPS" /> : <div className="qr-placeholder">QR tidak tersedia</div>}
        <p className="qr-id">QR-Token: {qrToken}</p>
      </div>

      <p className="small-note">QR berlaku sekali untuk TPS dan tidak dapat digunakan online.</p>

      <div className="actions-row">
        <button className="btn-outline" type="button" onClick={() => window.print()}>
          Cetak QR
        </button>
        <button className="btn-primary" type="button" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )

  const renderFallbackTPS = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="warning-icon">⚠</div>
      <h2>Pendaftaran Berhasil, QR belum tersedia</h2>
      <p>QR TPS belum dapat ditampilkan. Silakan login untuk mengambil QR Anda.</p>
      <button className="btn-primary btn-block" onClick={() => navigate('/login')} type="button">
        Ke Halaman Login
      </button>
    </div>
  )

  const renderDuplicate = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="warning-icon">⚠</div>
      <h2>Pendaftaran Gagal</h2>
      <p>NIM/Username Anda sudah terdaftar sebagai pemilih.</p>
      <p className="small-note">Jika terjadi kesalahan, hubungi panitia PEMIRA.</p>
      <button className="btn-primary btn-block" type="button" onClick={() => setStep('form')}>
        Kembali
      </button>
    </div>
  )

  if (step === 'success-online')
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderSuccessOnline()}
        </div>
      </div>
    )
  if (step === 'success-tps')
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderSuccessTPS()}
        </div>
      </div>
    )
  if (step === 'fallback-tps')
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderFallbackTPS()}
        </div>
      </div>
    )
  if (step === 'duplicate')
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderDuplicate()}
        </div>
      </div>
    )

  const selectedProgramLabel = role === 'student' ? 'Program Studi' : role === 'lecturer' ? 'Departemen' : 'Unit'
  const selectedAngkatanLabel = role === 'student' ? 'Angkatan' : 'Tahun Masuk'

  return (
    <div className="login-page premium-page">
      <header className="login-topbar" ref={heroRef}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <div className="logo-pill">PEMIRA</div>
            <span className="topbar-text">PEMIRA UNIVA 2025</span>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-left premium-left" ref={leftPanelRef}>
            <div className="info-panel">
              <h2>Info Penting</h2>
              <ul>
                <li>Isi data sesuai NIM/akun kampus UNIWA.</li>
                <li>Pilih satu mode pemilihan untuk menghindari kebingungan.</li>
                <li>Password tidak ditampilkan di layar, gunakan yang Anda setel.</li>
              </ul>
              <p className="info-note">
                {onlineNote} (Election ID: {ACTIVE_ELECTION_ID})
              </p>
            </div>
          </div>

          <div className="login-right">
            <div className="login-card premium-card" ref={formCardRef}>
              <div className="tab-row">
                <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
                  Mahasiswa
                </button>
                <button type="button" className={role === 'lecturer' ? 'active' : ''} onClick={() => setRole('lecturer')}>
                  Dosen
                </button>
                <button type="button" className={role === 'staff' ? 'active' : ''} onClick={() => setRole('staff')}>
                  Staf
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {role === 'student' ? (
                  <>
                    <label className="form-field">
                      <span className="field-label">Nama Lengkap</span>
                      <input value={studentForm.name} onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">NIM Mahasiswa</span>
                      <input value={studentForm.nim} onChange={(e) => setStudentForm((prev) => ({ ...prev, nim: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedProgramLabel}</span>
                      <input value={studentForm.program} onChange={(e) => setStudentForm((prev) => ({ ...prev, program: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedAngkatanLabel}</span>
                      <input value={studentForm.angkatan} onChange={(e) => setStudentForm((prev) => ({ ...prev, angkatan: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Fakultas</span>
                      <input value={studentForm.faculty} onChange={(e) => setStudentForm((prev) => ({ ...prev, faculty: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Email UNIWA</span>
                      <input type="email" value={studentForm.email} onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Password</span>
                      <input type="password" value={studentForm.password} onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))} required />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="form-field">
                      <span className="field-label">Nama Lengkap</span>
                      <input value={staffForm.name} onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Username {role === 'lecturer' ? '(NIDN)' : '(NIP)'}</span>
                      <input value={staffForm.username} onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedProgramLabel}</span>
                      <input value={staffForm.program} onChange={(e) => setStaffForm((prev) => ({ ...prev, program: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedAngkatanLabel}</span>
                      <input value={staffForm.angkatan} onChange={(e) => setStaffForm((prev) => ({ ...prev, angkatan: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Fakultas / Unit</span>
                      <input value={staffForm.faculty} onChange={(e) => setStaffForm((prev) => ({ ...prev, faculty: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Email UNIWA</span>
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Password</span>
                      <input type="password" value={staffForm.password} onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))} required />
                    </label>
                  </>
                )}

                <fieldset className="mode-fieldset">
                  <legend>Pilih Mode Pemilihan</legend>
                  <label className="radio-row">
                    <input type="radio" name="mode" value="online" checked={mode === 'online'} onChange={() => setMode('online')} />
                    <div>
                      <div className="radio-title">Pemilihan Online</div>
                      <div className="radio-desc">Akses login ke platform online. Hanya bisa memilih secara daring.</div>
                    </div>
                  </label>
                  <label className="radio-row">
                    <input type="radio" name="mode" value="tps" checked={mode === 'tps'} onChange={() => setMode('tps')} />
                    <div>
                      <div className="radio-title">Pemilihan Offline (TPS)</div>
                      <div className="radio-desc">Dapat QR pendaftaran dan wajib hadir ke TPS.</div>
                    </div>
                  </label>
                </fieldset>

                <label className="checkbox-row">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>Saya menyatakan data yang saya isi benar</span>
                </label>

                {error && <div className="error-box">{error}</div>}

                <button type="submit" className="btn-primary" disabled={!canSubmit}>
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </button>
                <p className="helper">
                  Sudah punya akun? <a href="/login">Masuk</a>
                </p>
              </form>
            </div>
          </div>
        </div>
        <div className="sticky-cta" ref={stickyCtaRef}>
          <button className="btn-primary sticky-cta-btn" disabled={!canSubmit} onClick={handleSubmit}>
            {loading ? 'Memproses...' : 'Daftar & Pilih Mode'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default Register
