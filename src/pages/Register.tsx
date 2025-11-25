import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import PemiraLogos from '../components/shared/PemiraLogos'
import { loginUser, registerLecturerOrStaff, registerStudent, type RegisterResponse } from '../services/auth'
import { rotateVoterQr } from '../services/voterQr'
import { useVotingSession } from '../hooks/useVotingSession'
import { fetchFacultiesPrograms, type FacultyProgram } from '../services/meta'
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

  const [studentForm, setStudentForm] = useState({ nim: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
  const [staffForm, setStaffForm] = useState({ username: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
  const [metaOptions, setMetaOptions] = useState<FacultyProgram[]>([])

  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrDataUri, setQrDataUri] = useState<string | null>(null)
  const [lastIdentity, setLastIdentity] = useState<{ username: string; mode: Mode; voterId?: number | null }>({ username: '', mode: 'online' })
  const [showPassword, setShowPassword] = useState(false)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const formCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    const card = formCardRef.current
    const reveal = (el: HTMLElement | null, delay = 0) => {
      if (!el) return
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-in')
    }
    reveal(hero, 50)
    if (card) {
      card.style.transitionDelay = '150ms'
      card.classList.add('reveal-card')
    }
  }, [])

  useEffect(() => {
    fetchFacultiesPrograms()
      .then((res) => setMetaOptions(res.faculties ?? []))
      .catch(() => setMetaOptions([]))
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

  const canSubmit = agree && !loading && (role === 'student' ? studentForm.password.length >= 6 : staffForm.password.length >= 6)

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
          email: studentForm.email.trim() || undefined,
          password: studentForm.password,
          faculty_name: studentForm.faculty.trim(),
          study_program_name: studentForm.program.trim(),
          semester: studentForm.semester.trim(),
          voting_mode: mode === 'tps' ? 'TPS' : 'ONLINE',
        })
        await handleRegisterSuccess(res, studentForm.nim.trim(), studentForm.password)
      } else {
        const type = role === 'lecturer' ? 'LECTURER' : 'STAFF'
        const res = await registerLecturerOrStaff({
          username: staffForm.username.trim(),
          name: staffForm.name.trim(),
          email: staffForm.email.trim() || undefined,
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
  const selectedSemesterLabel = 'Semester'
  const facultyOptions = metaOptions.map((item) => item.faculty)
  const programOptions =
    role === 'student'
      ? metaOptions.find((item) => item.faculty === studentForm.faculty)?.programs ?? []
      : metaOptions.find((item) => item.faculty === staffForm.faculty)?.programs ?? []

  return (
    <div className="login-page premium-page">
      <header className="login-topbar new-appbar" ref={heroRef}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <PemiraLogos size="lg" title="PEMIRA UNIWA 2025" className="auth-logo-large" />
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="auth-shell fade-in-up">
          <div className="auth-heading">
            <p className="eyebrow">PENDAFTARAN</p>
            <h1>Daftar Pemilih</h1>
            <p className="heading-sub">Isi data sesuai identitas kampus Anda.</p>
          </div>

          <details className="info-accordion">
            <summary>
              <span>ℹ️ Info penting</span>
              <span className="accordion-icon">+</span>
            </summary>
            <div className="accordion-body">
              <ul>
                <li>Isi data sesuai NIM/NIDN/NIP kampus UNIWA.</li>
                <li>Pilih satu mode pemilihan agar tidak bingung.</li>
                <li>Password tidak ditampilkan di layar, simpan di tempat aman.</li>
              </ul>
            </div>
          </details>

          <div className="role-selector">
            <span className="role-label">Daftar sebagai</span>
            <div className="tab-row compact">
              <button 
                type="button" 
                className={role === 'student' ? 'active' : ''} 
                onClick={() => {
                  setRole('student')
                  setStudentForm({ nim: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                  setStaffForm({ username: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                }}
              >
                Mahasiswa
              </button>
              <button 
                type="button" 
                className={role === 'lecturer' ? 'active' : ''} 
                onClick={() => {
                  setRole('lecturer')
                  setStudentForm({ nim: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                  setStaffForm({ username: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                }}
              >
                Dosen
              </button>
              <button 
                type="button" 
                className={role === 'staff' ? 'active' : ''} 
                onClick={() => {
                  setRole('staff')
                  setStudentForm({ nim: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                  setStaffForm({ username: '', name: '', email: '', password: '', program: '', semester: '', faculty: '' })
                }}
              >
                Staf
              </button>
            </div>
          </div>

          <div className="login-card premium-card" ref={formCardRef}>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">1. Data Pribadi</p>
                  <h3>Data Pribadi</h3>
                </div>
                {role === 'student' ? (
                  <>
                    <label className="form-field">
                      <span className="field-label">Nama Lengkap</span>
                      <input value={studentForm.name} onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">NIM (username)</span>
                      <input value={studentForm.nim} onChange={(e) => setStudentForm((prev) => ({ ...prev, nim: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Fakultas</span>
                      <select value={studentForm.faculty} onChange={(e) => setStudentForm((prev) => ({ ...prev, faculty: e.target.value, program: '' }))}>
                        <option value="">Pilih Fakultas</option>
                        {facultyOptions.map((fac) => (
                          <option key={fac} value={fac}>
                            {fac}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedProgramLabel}</span>
                      <select value={studentForm.program} onChange={(e) => setStudentForm((prev) => ({ ...prev, program: e.target.value }))} disabled={!studentForm.faculty}>
                        <option value="">{studentForm.faculty ? 'Pilih Program Studi' : 'Pilih fakultas dahulu'}</option>
                        {programOptions.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedSemesterLabel}</span>
                      <select
                        value={studentForm.semester}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, semester: e.target.value }))}
                        required
                      >
                        <option value="">Pilih semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                        <option value="9">Semester 9+</option>
                      </select>
                    </label>
                    <p className="microcopy">Gunakan data sesuai sistem akademik kampus.</p>
                  </>
                ) : (
                  <>
                    <label className="form-field">
                      <span className="field-label">Nama Lengkap</span>
                      <input value={staffForm.name} onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">{role === 'lecturer' ? 'NIDN (username)' : 'NIP/NIY (username)'}</span>
                      <input value={staffForm.username} onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span className="field-label">Fakultas / Unit</span>
                      <select value={staffForm.faculty} onChange={(e) => setStaffForm((prev) => ({ ...prev, faculty: e.target.value, program: '' }))}>
                        <option value="">Pilih Fakultas/Unit</option>
                        {facultyOptions.map((fac) => (
                          <option key={fac} value={fac}>
                            {fac}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="field-label">{selectedProgramLabel}</span>
                      <select value={staffForm.program} onChange={(e) => setStaffForm((prev) => ({ ...prev, program: e.target.value }))} disabled={!staffForm.faculty}>
                        <option value="">{staffForm.faculty ? 'Pilih Program/Unit' : 'Pilih fakultas dahulu'}</option>
                        {programOptions.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="microcopy">Gunakan data sesuai sistem akademik kampus.</p>
                  </>
                )}
              </div>

              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">2. Akun Login</p>
                  <h3>Akun & Keamanan</h3>
                </div>
                <label className="form-field">
                  <span className="field-label">Email UNIWA (opsional)</span>
                  <input
                    type="email"
                    placeholder="Kosongkan jika ingin otomatis username@pemira.online"
                    value={role === 'student' ? studentForm.email : staffForm.email}
                    onChange={(e) =>
                      role === 'student'
                        ? setStudentForm((prev) => ({ ...prev, email: e.target.value }))
                        : setStaffForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </label>
                <label className="form-field">
                  <span className="field-label">Password (min. 6 karakter)</span>
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={6}
                      value={role === 'student' ? studentForm.password : staffForm.password}
                      onChange={(e) =>
                        role === 'student'
                          ? setStudentForm((prev) => ({ ...prev, password: e.target.value }))
                          : setStaffForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                    />
                    <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
              </div>

              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">3. Pilih Mode Pemilihan</p>
                  <h3>Mode Pemilihan</h3>
                </div>
                <fieldset className="mode-fieldset compact">
                  <legend className="sr-only">Pilih Mode</legend>
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
                <p className="info-note">{onlineNote}</p>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>Saya menyatakan data yang saya isi benar</span>
              </label>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="btn-primary btn-full" disabled={!canSubmit}>
                {loading ? 'Memproses...' : 'Daftar & Simpan Mode'}
              </button>
              <p className="helper">
                Sudah punya akun? <a href="/login">Masuk</a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Register
