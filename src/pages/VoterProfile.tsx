import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { getActiveElectionId } from '../state/activeElection'
import {
  fetchCompleteProfile,
  updateProfile,
  changePassword,
  fetchParticipationStats,
  type VoterCompleteProfile,
  type ParticipationStats,
} from '../services/voterProfile'
import {
  fetchFaculties,
  fetchStudyPrograms,
  fetchLecturerUnits,
  fetchLecturerPositions,
  fetchStaffUnits,
  fetchStaffPositions,
  type Faculty,
  type StudyProgram,
} from '../services/meta'
import { LucideIcon } from '../components/LucideIcon'
import '../styles/VoterProfile.css'

const VoterProfile = () => {
  const navigate = useNavigate()
  const { session, clearSession } = useVotingSession()
  
  const [profile, setProfile] = useState<VoterCompleteProfile | null>(null)
  const [stats, setStats] = useState<ParticipationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editFacultyCode, setEditFacultyCode] = useState('')
  const [editProgramCode, setEditProgramCode] = useState('')
  const [editCohortYear, setEditCohortYear] = useState('')
  const [editClassLabel, setEditClassLabel] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Master data for dropdowns
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [programs, setPrograms] = useState<StudyProgram[]>([])
  const [lecturerUnits, setLecturerUnits] = useState<string[]>([])
  const [lecturerPositions, setLecturerPositions] = useState<string[]>([])
  const [staffUnits, setStaffUnits] = useState<string[]>([])
  const [staffPositions, setStaffPositions] = useState<string[]>([])
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Load master data for dropdowns
  useEffect(() => {
    fetchFaculties()
      .then((res) => setFaculties(res.data ?? []))
      .catch(() => setFaculties([]))
    
    fetchStudyPrograms()
      .then((res) => setPrograms(res.data ?? []))
      .catch(() => setPrograms([]))
    
    fetchLecturerUnits()
      .then((res) => setLecturerUnits(res.data.map(u => u.name)))
      .catch(() => setLecturerUnits([]))
    
    fetchLecturerPositions()
      .then((res) => setLecturerPositions(res.data.map(p => p.name)))
      .catch(() => setLecturerPositions([]))
    
    fetchStaffUnits()
      .then((res) => setStaffUnits(res.data.map(u => u.name)))
      .catch(() => setStaffUnits([]))
    
    fetchStaffPositions()
      .then((res) => setStaffPositions(res.data.map(p => p.name)))
      .catch(() => setStaffPositions([]))
  }, [])

  useEffect(() => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const electionId = getActiveElectionId()
    
    Promise.all([
      fetchCompleteProfile(session.accessToken, electionId, { signal: controller.signal }),
      fetchParticipationStats(session.accessToken, electionId, { signal: controller.signal }).catch(() => null)
    ])
      .then(([profileData, statsData]) => {
        console.log('Profile data received:', profileData)
        console.log('Stats data received:', statsData)
        
        // Validate profile data structure
        if (!profileData || !profileData.personal_info) {
          throw new Error('Invalid profile data structure')
        }
        
        const normalizeVoterType = () => {
          const raw = (profileData.personal_info.voter_type || '').toUpperCase()
          const sessionRole = session?.user.role?.toUpperCase?.()
          if (sessionRole === 'LECTURER' || sessionRole === 'STAFF' || sessionRole === 'STUDENT') return sessionRole
          if (raw === 'STUDENT' || raw === 'LECTURER' || raw === 'STAFF') return raw
          if (profileData.personal_info.nidn || profileData.personal_info.department || profileData.personal_info.department_name) return 'LECTURER'
          if (profileData.personal_info.nip || profileData.personal_info.unit || profileData.personal_info.unit_name || profileData.personal_info.position) return 'STAFF'
          if (profileData.personal_info.study_program_name || profileData.personal_info.semester) return 'STUDENT'
          return 'STUDENT'
        }

        profileData.personal_info.voter_type = normalizeVoterType()
        
        setProfile(profileData)
        setStats(statsData)
        setEditEmail(profileData.personal_info?.email || '')
        setEditPhone(profileData.personal_info?.phone || '')
        // Note: API contract doesn't expose codes directly in response, we use names for display
        setEditFacultyCode('')
        setEditProgramCode('')
        setEditCohortYear(profileData.personal_info?.cohort_year ? String(profileData.personal_info.cohort_year) : '')
        setEditClassLabel('')
        setError(null)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch profile:', err)
        console.error('Error details:', err)
        setError(err.message || 'Gagal memuat profil')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [session?.accessToken, session?.user.role])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSaveProfile = async () => {
    if (!session?.accessToken) return
    
    setSaving(true)
    try {
      const payload: any = {
        email: editEmail || undefined,
        phone: editPhone || undefined,
      }

      // Add editable identity fields based on voter type
      if (editFacultyCode) {
        payload.faculty_code = editFacultyCode
      }
      
      if (profile?.personal_info.voter_type === 'STUDENT') {
        if (editProgramCode) {
          payload.study_program_code = editProgramCode
        }
        const parsedCohort = Number.parseInt(editCohortYear, 10)
        if (!Number.isNaN(parsedCohort)) {
          payload.cohort_year = parsedCohort
        }
        if (editClassLabel) {
          payload.class_label = editClassLabel
        }
      } else if (profile?.personal_info.voter_type === 'LECTURER') {
        if (editProgramCode) {
          payload.study_program_code = editProgramCode
        }
        if (editClassLabel) {
          payload.class_label = editClassLabel
        }
      } else if (profile?.personal_info.voter_type === 'STAFF') {
        if (editClassLabel) {
          payload.class_label = editClassLabel
        }
      }

      const result = await updateProfile(session.accessToken, payload)
      
      // Refresh profile
      const electionId = getActiveElectionId()
      const updatedProfile = await fetchCompleteProfile(session.accessToken, electionId)
      setProfile(updatedProfile)
      setIsEditMode(false)
      
      // Show success with updated fields info
      const updatedFields = result.updated_fields?.join(', ') || 'beberapa field'
      showNotification('success', `Profil berhasil diperbarui (${updatedFields})`)
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.accessToken) return
    
    setPasswordError('')
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru tidak cocok')
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password minimal 8 karakter')
      return
    }
    
    setSaving(true)
    try {
      await changePassword(session.accessToken, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      
      showNotification('success', 'Password berhasil diubah!')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      clearSession()
      navigate('/login')
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="voter-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Memuat profil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    // If error contains "token" or "unauthorized", auto logout
    const isTokenError = error && (
      error.toLowerCase().includes('token') || 
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('401')
    )
    
    return (
      <div className="voter-profile-page">
        <div className="profile-error">
          <span className="error-icon">⚠️</span>
          <p>{error || 'Gagal memuat profil'}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-back" onClick={handleBack}>Kembali</button>
            {isTokenError && (
              <button 
                className="btn-logout" 
                onClick={() => {
                  clearSession()
                  navigate('/login', { replace: true })
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout Paksa
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { personal_info, voting_info, participation, account_info } = profile
  const isStudent = personal_info.voter_type === 'STUDENT'
  const isLecturer = personal_info.voter_type === 'LECTURER'
  const isStaff = personal_info.voter_type === 'STAFF'
  const lecturerDepartment = personal_info.department || personal_info.department_name
  const staffUnit = personal_info.unit || personal_info.unit_name || (isStaff ? personal_info.faculty_name : undefined)

  return (
    <div className="voter-profile-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span className="toast-icon">{notification.type === 'success' ? '✓' : '✕'}</span>
          <span className="toast-message">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="profile-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBack}>
            <LucideIcon name="arrowLeft" className="back-icon" size={20} />
          </button>
          <h1 className="header-title">Profil Saya</h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Content */}
      <main className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {personal_info.photo_url ? (
              <img src={personal_info.photo_url} alt={personal_info.name} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <span className="avatar-text">{personal_info.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <h2 className="profile-name">{personal_info.name}</h2>
          <p className="profile-username">@{personal_info.username}</p>
          
          {!isEditMode && (
            <button className="btn-edit-profile" onClick={() => setIsEditMode(true)}>
              <LucideIcon name="pencil" className="btn-icon" size={16} />
              <span className="btn-text">Edit Profil</span>
            </button>
          )}
        </div>

        {/* Personal Info Section */}
        <section className="info-section">
          <h3 className="section-title">
            <LucideIcon name="user" className="section-icon" size={20} />
            Informasi Pribadi
          </h3>
          
          <div className="info-grid">
            {/* ID Field - berbeda per tipe */}
            <div className="info-item">
              <span className="info-label">
                {personal_info.voter_type === 'STUDENT' ? 'NIM' : 
                 personal_info.voter_type === 'LECTURER' ? 'NIDN' : 'NIP'}
              </span>
              <span className="info-value">
                {personal_info.voter_type === 'STUDENT' ? personal_info.username :
                 personal_info.voter_type === 'LECTURER' ? (personal_info.nidn || personal_info.username) :
                 (personal_info.nip || personal_info.username)}
              </span>
            </div>
            
            {/* STUDENT FIELDS */}
            {personal_info.voter_type === 'STUDENT' && (
              <>
                {personal_info.faculty_name && (
                  <div className="info-item">
                    <span className="info-label">Fakultas</span>
                    <span className="info-value">{personal_info.faculty_name}</span>
                  </div>
                )}
                
                {personal_info.study_program_name && (
                  <div className="info-item">
                    <span className="info-label">Program Studi</span>
                    <span className="info-value">{personal_info.study_program_name}</span>
                  </div>
                )}
                
                {personal_info.cohort_year && (
                  <div className="info-item">
                    <span className="info-label">Angkatan</span>
                    <span className="info-value">{personal_info.cohort_year}</span>
                  </div>
                )}
                
                {(personal_info.semester || personal_info.cohort_year) && (
                  <div className="info-item">
                    <span className="info-label">Semester</span>
                    <span className="info-value">
                      {personal_info.semester || 
                       (personal_info.cohort_year 
                         ? `${Math.max(1, (new Date().getFullYear() - personal_info.cohort_year) * 2 + 1)}`
                         : '-'
                       )}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {/* LECTURER FIELDS */}
            {personal_info.voter_type === 'LECTURER' && (
              <>
                {personal_info.title && (
                  <div className="info-item">
                    <span className="info-label">Gelar</span>
                    <span className="info-value">{personal_info.title}</span>
                  </div>
                )}
                
                {lecturerDepartment && (
                  <div className="info-item">
                    <span className="info-label">Unit Kerja</span>
                    <span className="info-value">{lecturerDepartment}</span>
                  </div>
                )}
                
                {personal_info.faculty_name && (
                  <div className="info-item">
                    <span className="info-label">Fakultas</span>
                    <span className="info-value">{personal_info.faculty_name}</span>
                  </div>
                )}
              </>
            )}
            
            {/* STAFF FIELDS */}
            {personal_info.voter_type === 'STAFF' && (
              <>
                {personal_info.position && (
                  <div className="info-item">
                    <span className="info-label">Jabatan</span>
                    <span className="info-value">{personal_info.position}</span>
                  </div>
                )}
                
                {staffUnit && (
                  <div className="info-item">
                    <span className="info-label">Unit Kerja</span>
                    <span className="info-value">{staffUnit}</span>
                  </div>
                )}
              </>
            )}
            
            {/* Tipe Pemilih Badge */}
            <div className="info-item full-width">
              <span className="info-label">Tipe Pemilih</span>
              <span className="info-value voter-type-badge">
                <LucideIcon
                  name={isStudent ? 'graduationCap' : isLecturer ? 'presentation' : 'briefcase'}
                  className="inline-icon"
                  size={18}
                />
                {isStudent ? 'Mahasiswa' : isLecturer ? 'Dosen' : 'Staf Administrasi'}
              </span>
            </div>
          </div>
        </section>

        {/* Contact Info Section - Editable */}
        <section className="info-section">
          <h3 className="section-title">
            <LucideIcon name="mail" className="section-icon" size={20} />
            Kontak
          </h3>
          
          {isEditMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="email@uniwa.ac.id"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="08123456789"
                  pattern="^(08\d{8,11}|\+628\d{8,12})$"
                />
                <span className="form-hint">Format: 08xxx atau +62xxx</span>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{personal_info.email || 'Belum diisi'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">No. Telepon</span>
                <span className="info-value">{personal_info.phone || 'Belum diisi'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Identity Info Section - Editable */}
        {isEditMode && (
          <section className="info-section">
            <h3 className="section-title">
              <LucideIcon name="user" className="section-icon" size={20} />
              Informasi Identitas (Opsional)
            </h3>
            
            <div className="edit-form">
              {isStudent && (
                <>
                  <div className="form-group">
                    <label className="form-label">Fakultas</label>
                    <select
                      className="form-input"
                      value={editFacultyCode}
                      onChange={(e) => {
                        setEditFacultyCode(e.target.value)
                        setEditProgramCode('') // Reset program when faculty changes
                      }}
                    >
                      <option value="">Pilih Fakultas</option>
                      {faculties.map((fac) => (
                        <option key={fac.code} value={fac.code}>
                          {fac.name}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">Fakultas tempat Anda kuliah</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Program Studi</label>
                    <select
                      className="form-input"
                      value={editProgramCode}
                      onChange={(e) => setEditProgramCode(e.target.value)}
                      disabled={!editFacultyCode}
                    >
                      <option value="">Pilih Program Studi</option>
                      {editFacultyCode &&
                        programs
                          .filter((prog) => {
                            const faculty = faculties.find((f) => f.code === editFacultyCode)
                            return faculty && prog.faculty_id === faculty.id
                          })
                          .map((prog) => (
                            <option key={prog.code} value={prog.code}>
                              {prog.name}
                            </option>
                          ))}
                    </select>
                    <span className="form-hint">Program studi Anda</span>
                  </div>
                </>
              )}

              {isLecturer && (
                <>
                  <div className="form-group">
                    <label className="form-label">Unit Kerja</label>
                    <select
                      className="form-input"
                      value={editFacultyCode}
                      onChange={(e) => setEditFacultyCode(e.target.value)}
                    >
                      <option value="">Pilih Unit Kerja</option>
                      {lecturerUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">Unit kerja dosen</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Departemen/Prodi</label>
                    <select
                      className="form-input"
                      value={editProgramCode}
                      onChange={(e) => setEditProgramCode(e.target.value)}
                    >
                      <option value="">Pilih Departemen/Prodi</option>
                      {lecturerPositions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">Departemen atau prodi tempat mengajar</span>
                  </div>
                </>
              )}

              {isStaff && (
                <>
                  <div className="form-group">
                    <label className="form-label">Unit Kerja</label>
                    <select
                      className="form-input"
                      value={editFacultyCode}
                      onChange={(e) => setEditFacultyCode(e.target.value)}
                    >
                      <option value="">Pilih Unit Kerja</option>
                      {staffUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">Unit kerja staf</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Posisi/Jabatan</label>
                    <select
                      className="form-input"
                      value={editProgramCode}
                      onChange={(e) => setEditProgramCode(e.target.value)}
                    >
                      <option value="">Pilih Posisi</option>
                      {staffPositions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">Posisi atau jabatan</span>
                  </div>
                </>
              )}

              {isStudent && (
                <div className="form-group">
                  <label className="form-label">Tahun Angkatan</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editCohortYear}
                    onChange={(e) => setEditCohortYear(e.target.value)}
                    placeholder="2021"
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                  <span className="form-hint">Tahun masuk kuliah</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  {isStudent ? 'Kelas' : isLecturer ? 'Jabatan' : 'Posisi'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editClassLabel}
                  onChange={(e) => setEditClassLabel(e.target.value)}
                  placeholder={
                    isStudent ? 'Contoh: IF-A, SI-B' :
                    isLecturer ? 'Contoh: Lektor, Lektor Kepala' :
                    'Contoh: Koordinator, Staff'
                  }
                />
                <span className="form-hint">
                  {isStudent ? 'Label kelas' : isLecturer ? 'Jabatan akademik' : 'Posisi di unit'}
                </span>
              </div>
              
              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditMode(false)
                    setEditEmail(personal_info.email || '')
                    setEditPhone(personal_info.phone || '')
                    setEditFacultyCode('')
                    setEditProgramCode('')
                    setEditCohortYear(personal_info.cohort_year ? String(personal_info.cohort_year) : '')
                    setEditClassLabel('')
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  className="btn-save"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Voting Info Section */}
        <section className="info-section">
          <h3 className="section-title">
            <LucideIcon name="ballot" className="section-icon" size={20} />
            Informasi Voting
          </h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Metode Preferensi</span>
              <span className="info-value voting-method">
                <LucideIcon
                  name={voting_info.preferred_method === 'ONLINE' ? 'smartphone' : 'mapPin'}
                  className="inline-icon"
                  size={18}
                />
                {voting_info.preferred_method === 'ONLINE' ? 'Online' : 'TPS'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Status Voting</span>
              <span className={`info-value status ${voting_info.has_voted ? 'voted' : 'not-voted'}`}>
                {voting_info.has_voted ? '✓ Sudah Voting' : '○ Belum Voting'}
              </span>
            </div>
            
            {voting_info.tps_name && (
              <div className="info-item full-width">
                <span className="info-label">Lokasi TPS</span>
                <span className="info-value">{voting_info.tps_name}</span>
                {voting_info.tps_location && (
                  <span className="info-sublabel">{voting_info.tps_location}</span>
                )}
              </div>
            )}
            
            {voting_info.voted_at && (
              <div className="info-item full-width">
                <span className="info-label">Waktu Voting</span>
                <span className="info-value">
                  {new Date(voting_info.voted_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} WIB
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Participation Stats */}
        {participation && (
          <section className="info-section stats-section">
            <h3 className="section-title">
              <LucideIcon name="barChart" className="section-icon" size={20} />
              Statistik Partisipasi
            </h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{participation.total_elections}</div>
                <div className="stat-label">Total Pemilu</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{participation.participated_elections}</div>
                <div className="stat-label">Diikuti</div>
              </div>
              
              <div className="stat-card highlight">
                <div className="stat-value">{participation.participation_rate.toFixed(0)}%</div>
                <div className="stat-label">Tingkat Partisipasi</div>
              </div>
            </div>
            
            {stats && stats.elections && stats.elections.length > 0 && (
              <div className="participation-history">
                <h4 className="history-title">Riwayat Partisipasi</h4>
                <div className="history-list">
                  {stats.elections.map((election) => (
                    <div key={election.election_id} className="history-item">
                      <div className="history-icon">
                        {election.voted ? '✓' : '○'}
                      </div>
                      <div className="history-content">
                        <div className="history-name">{election.election_name}</div>
                        <div className="history-meta">
                          {election.year} • {election.voted ? `Voting ${election.method}` : 'Tidak mengikuti'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Account Settings */}
        <section className="info-section">
          <h3 className="section-title">
            <LucideIcon name="settings" className="section-icon" size={20} />
            Pengaturan Akun
          </h3>
          
          <div className="settings-list">
            <button
              className="setting-item"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              <LucideIcon name="lock" className="setting-icon" size={20} />
              <span className="setting-text">Ganti Password</span>
              <LucideIcon name="arrowRight" className="setting-arrow" size={18} />
            </button>
            
            <button className="setting-item" onClick={handleLogout}>
              <LucideIcon name="logOut" className="setting-icon" size={20} />
              <span className="setting-text">Keluar</span>
              <LucideIcon name="arrowRight" className="setting-arrow" size={18} />
            </button>
          </div>
          
          {showPasswordForm && (
            <form className="password-form" onSubmit={handleChangePassword}>
              <h4 className="form-title">Ganti Password</h4>
              
              {passwordError && (
                <div className="form-error">
                  <LucideIcon name="alertCircle" className="error-icon" size={20} />
                  <span>{passwordError}</span>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Password Lama</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <span className="form-hint">Minimal 8 karakter</span>
              </div>
              
              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Ganti Password'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Account Info */}
        <section className="info-section account-meta">
          <div className="meta-item">
            <span className="meta-label">Bergabung sejak</span>
            <span className="meta-value">
              {new Date(account_info.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          
          {account_info.last_login && (
            <div className="meta-item">
              <span className="meta-label">Login terakhir</span>
              <span className="meta-value">
                {new Date(account_info.last_login).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} WIB
              </span>
            </div>
          )}
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="profile-footer">
        <nav className="footer-nav">
          <button className="nav-item" onClick={handleBack}>
            <LucideIcon name="home" className="nav-icon" size={24} />
            <span className="nav-label">Beranda</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/kandidat')}>
            <LucideIcon name="users" className="nav-icon" size={24} />
            <span className="nav-label">Kandidat</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/riwayat')}>
            <LucideIcon name="scroll" className="nav-icon" size={24} />
            <span className="nav-label">Riwayat</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/bantuan')}>
            <LucideIcon name="helpCircle" className="nav-icon" size={24} />
            <span className="nav-label">Bantuan</span>
          </button>
          <button className="nav-item active">
            <LucideIcon name="user" className="nav-icon" size={24} />
            <span className="nav-label">Profil</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}

export default VoterProfile
