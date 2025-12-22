import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PemiraLogos from '../components/shared/PemiraLogos'
import {
  registerStudent,
  registerLecturerOrStaffV2,
  loginUser,
  type StudentRegistrationResponse,
  type LecturerRegistrationResponse,
  type StaffRegistrationResponse,
} from '../services/auth'
import { 
  fetchFacultiesPrograms,
  fetchLecturerUnits,
  fetchLecturerPositions,
  fetchStaffUnits,
  fetchStaffPositions,
  type FacultyProgram 
} from '../services/meta'
import { fetchCurrentElection } from '../services/publicElection'
import { useVotingSession } from '../hooks/useVotingSession'
import LoadingScreen from '../components/LoadingScreen'
import type { ApiError } from '../utils/apiClient'
import '../styles/LoginMahasiswa.css'

type VoterType = 'student' | 'lecturer' | 'staff'
type Step = 'form' | 'success'
type VotingMode = 'ONLINE' | 'TPS'

type RegistrationData = 
  | StudentRegistrationResponse 
  | LecturerRegistrationResponse 
  | StaffRegistrationResponse

const RegisterNew = () => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()

  const [step, setStep] = useState<Step>('form')
  const [voterType, setVoterType] = useState<VoterType>('student')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    identifier: '', // nim, nidn, or nip
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    faculty: '',
    program: '',
    semester: '',
    position: '',
  })

  const [votingMode, setVotingMode] = useState<VotingMode>('ONLINE')
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Master data
  const [metaOptions, setMetaOptions] = useState<FacultyProgram[]>([])
  const [lecturerUnits, setLecturerUnits] = useState<string[]>([])
  const [lecturerPositions, setLecturerPositions] = useState<string[]>([])
  const [staffUnits, setStaffUnits] = useState<string[]>([])
  const [staffPositions, setStaffPositions] = useState<string[]>([])
  
  // Election mode availability
  const [onlineEnabled, setOnlineEnabled] = useState(true)
  const [tpsEnabled, setTpsEnabled] = useState(true)
  const [electionStatus, setElectionStatus] = useState<string>('')

  const heroRef = useRef<HTMLDivElement | null>(null)
  const formCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (initialLoading) return
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
  }, [initialLoading])

  // Load master data on mount
  useEffect(() => {
    let cancelled = false

    const loadMeta = async () => {
      setInitialLoading(true)
      const fallbackTimer = window.setTimeout(() => {
        if (!cancelled) setInitialLoading(false)
      }, 5000)

      const tasks = [
        fetchCurrentElection()
          .then((election) => {
            if (cancelled) return
            const onlineAvailable = election.online_enabled
            const tpsAvailable = election.tps_enabled
            setOnlineEnabled(onlineAvailable)
            setTpsEnabled(tpsAvailable)
            const status = election.status || ''
            setElectionStatus(status)

            if (status === 'VOTING_OPEN') {
              setVoterType('lecturer')
            }

            if (!onlineAvailable && tpsAvailable) {
              setVotingMode('TPS')
            } else if (onlineAvailable && !tpsAvailable) {
              setVotingMode('ONLINE')
            }
          })
          .catch(() => {
            if (cancelled) return
            setOnlineEnabled(true)
            setTpsEnabled(true)
            setElectionStatus('')
          }),
        fetchFacultiesPrograms()
          .then((res) => {
            if (cancelled) return
            setMetaOptions(res.faculties ?? [])
          })
          .catch(() => {
            if (cancelled) return
            setMetaOptions([])
          }),
        fetchLecturerUnits()
          .then((res) => {
            if (cancelled) return
            setLecturerUnits(res.data.map((u) => u.name))
          })
          .catch(() => {
            if (cancelled) return
            setLecturerUnits([])
          }),
        fetchLecturerPositions()
          .then((res) => {
            if (cancelled) return
            setLecturerPositions(res.data.map((p) => p.name))
          })
          .catch(() => {
            if (cancelled) return
            setLecturerPositions([])
          }),
        fetchStaffUnits()
          .then((res) => {
            if (cancelled) return
            setStaffUnits(res.data.map((u) => u.name))
          })
          .catch(() => {
            if (cancelled) return
            setStaffUnits([])
          }),
        fetchStaffPositions()
          .then((res) => {
            if (cancelled) return
            setStaffPositions(res.data.map((p) => p.name))
          })
          .catch(() => {
            if (cancelled) return
            setStaffPositions([])
          }),
      ]

      await Promise.allSettled(tasks)
      if (!cancelled) {
        setInitialLoading(false)
      }
      window.clearTimeout(fallbackTimer)
    }

    void loadMeta()

    return () => {
      cancelled = true
    }
  }, [])

  // Reset form when voter type changes
  useEffect(() => {
    setFormData({
      identifier: '',
      name: '',
      password: '',
      confirmPassword: '',
      email: '',
      faculty: '',
      program: '',
      semester: '',
      position: '',
    })
    setError(null)
  }, [voterType])

  const getIdentifierLabel = () => {
    switch (voterType) {
      case 'student': return 'NIM'
      case 'lecturer': return 'NIDN'
      case 'staff': return 'NIP'
    }
  }

  const getIdentifierPlaceholder = () => {
    switch (voterType) {
      case 'student': return 'Contoh: 2021001'
      case 'lecturer': return 'Contoh: 0123456789'
      case 'staff': return 'Contoh: 198501012010121001'
    }
  }

  const canSubmit = 
    agree && 
    !loading && 
    formData.identifier.trim() !== '' &&
    formData.name.trim() !== '' &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    (voterType === 'student' ? 
      (formData.faculty && formData.program && formData.semester) : 
      (formData.position)
    )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      let result: RegistrationData

      if (voterType === 'student') {
        result = await registerStudent({
          nim: formData.identifier.trim(),
          name: formData.name.trim(),
          email: formData.email.trim() || '',
          faculty_name: formData.faculty.trim(),
          study_program_name: formData.program.trim(),
          semester: formData.semester.trim(),
          password: formData.password,
          voting_mode: votingMode,
        })
      } else {
        result = await registerLecturerOrStaffV2({
          type: voterType === 'lecturer' ? 'LECTURER' : 'STAFF',
          nidn: voterType === 'lecturer' ? formData.identifier.trim() : undefined,
          nip: voterType === 'staff' ? formData.identifier.trim() : undefined,
          name: formData.name.trim(),
          email: formData.email.trim() || '',
          faculty_name: voterType === 'lecturer' ? formData.faculty.trim() : undefined,
          department_name: voterType === 'lecturer' ? formData.program.trim() : undefined,
          unit_name: voterType === 'staff' ? formData.program.trim() : undefined,
          position: formData.position.trim(),
          password: formData.password,
          voting_mode: votingMode,
        })
      }

      setRegistrationData(result)
      
      // Auto login after successful registration
      try {
        const loginResult = await loginUser(formData.identifier.trim(), formData.password)
        setSession({
          accessToken: loginResult.access_token,
          refreshToken: loginResult.refresh_token,
          user: {
            id: loginResult.user.id,
            username: loginResult.user.username,
            role: loginResult.user.role,
            voterId: loginResult.user.voter_id,
            profile: loginResult.user.profile,
          },
          hasVoted: false,
          votingStatus: 'not_started',
        })
      } catch (loginErr) {
        console.warn('Auto-login failed after registration:', loginErr)
      }

      setStep('success')
    } catch (err: any) {
      const apiErr = err as ApiError
      
      if (apiErr?.status === 409) {
        setError(`${getIdentifierLabel()} sudah terdaftar sebagai voter.`)
      } else {
        setError(apiErr?.message || 'Registrasi gagal. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderSuccess = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Registrasi Berhasil!</h2>
      
      {registrationData && (
        <div className="success-box">
          <p className="credential"><strong>Nama:</strong> {registrationData.user.profile.name}</p>
          <p className="credential">
            <strong>{getIdentifierLabel()}:</strong> {registrationData.user.username}
          </p>
          <p className="credential">
            <strong>Mode Pemilihan:</strong> {registrationData.voting_mode === 'ONLINE' ? 'Online' : 'TPS (Offline)'}
          </p>
        </div>
      )}

      <p style={{ marginTop: '20px' }}>{registrationData?.message}</p>

      <button 
        className="btn-primary btn-block" 
        onClick={() => navigate('/login')} 
        type="button"
        style={{ marginTop: '20px' }}
      >
        Ke Halaman Login
      </button>
    </div>
  )

  if (initialLoading) {
    return (
      <div className="login-page premium-page">
        <LoadingScreen fullScreen message="Memuat data registrasi..." />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderSuccess()}
        </div>
      </div>
    )
  }

  // Check if student registration should be blocked
  const isVotingDay = electionStatus === 'VOTING_OPEN'
  const isStudentRegistrationBlocked = isVotingDay && voterType === 'student'

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
            <p className="eyebrow">REGISTRASI</p>
            <h1>Daftar Pemilih</h1>
            <p className="heading-sub">
              Gunakan {getIdentifierLabel()} Anda yang sudah terdaftar di sistem kampus.
            </p>
          </div>

          <details className="info-accordion">
            <summary>
              <span>ℹ️ Informasi Penting</span>
              <span className="accordion-icon">+</span>
            </summary>
            <div className="accordion-body">
              <ul>
                <li>Isi data sesuai dengan identitas kampus Anda</li>
                <li>Pastikan {getIdentifierLabel()} yang dimasukkan benar</li>
                <li>Email bersifat opsional, akan dibuat otomatis jika kosong</li>
                <li>Password minimal 6 karakter</li>
                <li>Pilih mode pemilihan: Online atau TPS (Offline)</li>
                <li>Simpan password Anda dengan aman</li>
              </ul>
            </div>
          </details>

          <div className="role-selector">
            <span className="role-label">Daftar sebagai</span>
            <div className="tab-row compact">
              <button
                type="button"
                className={voterType === 'student' ? 'active' : ''}
                onClick={() => setVoterType('student')}
              >
                Mahasiswa
              </button>
              <button
                type="button"
                className={voterType === 'lecturer' ? 'active' : ''}
                onClick={() => setVoterType('lecturer')}
              >
                Dosen
              </button>
              <button
                type="button"
                className={voterType === 'staff' ? 'active' : ''}
                onClick={() => setVoterType('staff')}
              >
                Staf
              </button>
            </div>
          </div>

          <div className="login-card premium-card" ref={formCardRef}>
            {isStudentRegistrationBlocked ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="warning-icon" style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ marginBottom: '16px' }}>Pendaftaran Mahasiswa Ditutup</h2>
                <p style={{ marginBottom: '24px', color: '#666' }}>
                  Pendaftaran untuk mahasiswa sudah ditutup karena hari ini adalah hari voting. 
                  Silakan hubungi panitia jika ada masalah.
                </p>
                <button 
                  className="btn-primary btn-block" 
                  onClick={() => navigate('/login')} 
                  type="button"
                >
                  Ke Halaman Login
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {/* Step 1: Data Pribadi */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">1. Data Pribadi</p>
                  <h3>Informasi Identitas</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">{getIdentifierLabel()}</span>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder={getIdentifierPlaceholder()}
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="field-label">Nama Lengkap</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </label>
              </div>

              {/* Step 2: Password */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">2. Buat Password</p>
                  <h3>Atur Password Login</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">Password</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimal 6 karakter"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </label>

                <label className="form-field">
                  <span className="field-label">Konfirmasi Password</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Ketik ulang password"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <span className="field-hint" style={{ color: '#ef4444' }}>
                      Password tidak cocok
                    </span>
                  )}
                </label>
              </div>

              {/* Step 3: Academic/Work Info */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">3. {voterType === 'student' ? 'Data Akademik' : 'Data Pekerjaan'}</p>
                  <h3>{voterType === 'student' ? 'Informasi Akademik' : 'Informasi Pekerjaan'}</h3>
                </div>

                {voterType === 'student' ? (
                  <>
                    <label className="form-field">
                      <span className="field-label">Fakultas</span>
                      <select
                        value={formData.faculty}
                        onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value, program: '' }))}
                        required
                      >
                        <option value="">Pilih Fakultas</option>
                        {metaOptions.map((item) => (
                          <option key={item.faculty} value={item.faculty}>
                            {item.faculty}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="field-label">Program Studi</span>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                        disabled={!formData.faculty}
                        required
                      >
                        <option value="">{formData.faculty ? 'Pilih Program Studi' : 'Pilih fakultas dahulu'}</option>
                        {formData.faculty && metaOptions
                          .find(item => item.faculty === formData.faculty)
                          ?.programs.map((prog) => (
                            <option key={prog} value={prog}>
                              {prog}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="field-label">Semester</span>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(sem => (
                          <option key={sem} value={sem.toString()}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : voterType === 'lecturer' ? (
                  <>
                    <label className="form-field">
                      <span className="field-label">Fakultas</span>
                      <select
                        value={formData.faculty}
                        onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Fakultas</option>
                        {lecturerUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="field-label">Departemen</span>
                      <input
                        type="text"
                        value={formData.program}
                        onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                        placeholder="Contoh: Teknik Informatika"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span className="field-label">Jabatan</span>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Jabatan</option>
                        {lecturerPositions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="form-field">
                      <span className="field-label">Unit</span>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Unit</option>
                        {staffUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="field-label">Jabatan</span>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Jabatan</option>
                        {staffPositions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              </div>

              {/* Step 4: Email (Optional) and Voting Mode */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">4. Mode Pemilihan & Kontak</p>
                  <h3>Pilihan Lainnya</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">Email (opsional)</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Kosongkan jika ingin auto-generate"
                  />
                  <span className="field-hint">Akan dibuat otomatis jika kosong: {formData.identifier}@pemira.online</span>
                </label>

                <fieldset className="mode-fieldset compact" style={{ marginTop: '16px' }}>
                  <legend className="field-label">Mode Pemilihan</legend>
                  {onlineEnabled && (
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="ONLINE" 
                        checked={votingMode === 'ONLINE'} 
                        onChange={() => setVotingMode('ONLINE')} 
                      />
                      <div>
                        <div className="radio-title">Pemilihan Online</div>
                        <div className="radio-desc">Akses login ke platform online. Hanya bisa memilih secara daring.</div>
                      </div>
                    </label>
                  )}
                  {tpsEnabled && (
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="TPS" 
                        checked={votingMode === 'TPS'} 
                        onChange={() => setVotingMode('TPS')} 
                      />
                      <div>
                        <div className="radio-title">Pemilihan Offline (TPS)</div>
                        <div className="radio-desc">Dapat QR pendaftaran dan wajib hadir ke TPS.</div>
                      </div>
                    </label>
                  )}
                  {!onlineEnabled && !tpsEnabled && (
                    <div className="alert-error" style={{ marginTop: '8px' }}>
                      Mode pemilihan belum tersedia. Hubungi admin.
                    </div>
                  )}
                </fieldset>
              </div>

              <div className="section-block">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    Saya setuju bahwa data yang saya berikan adalah benar dan saya bertanggung jawab penuh.
                  </span>
                </label>
              </div>

              {error && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-block"
                disabled={!canSubmit}
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>
            )}

            {!isStudentRegistrationBlocked && (
            <div className="login-footer">
              <p>
                Sudah punya akun?{' '}
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
                  Login di sini
                </a>
              </p>
            </div>
            )}
          </div>
        </div>
      </main>

      {loading && (
        <div className="app-loading-overlay">
          <LoadingScreen message="Memproses pendaftaran..." inline />
        </div>
      )}
    </div>
  )
}

export default RegisterNew
