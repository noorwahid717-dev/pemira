import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { LucideIcon } from '../components/LucideIcon'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'
import { useToast } from '../components/Toast'
import { upsertVoter, mapFrontendToApiVoterType } from '../services/adminDpt'
import type { ElectionVoterStatus } from '../types/dptAdmin'
import '../styles/AdminDPT.css'

const academicMap: Record<'aktif' | 'cuti' | 'nonaktif', string> = {
  aktif: 'ACTIVE',
  cuti: 'ON_LEAVE',
  nonaktif: 'INACTIVE',
}

const AdminDPTAdd = () => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { showToast } = useToast()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [formData, setFormData] = useState({
    tipe: 'mahasiswa' as 'mahasiswa' | 'dosen' | 'staf',
    nim: '',
    nama: '',
    email: '',
    fakultas: '',
    prodi: '',
    semester: '',
    akademik: 'aktif' as 'aktif' | 'cuti' | 'nonaktif',
    metodeVoting: 'online' as 'online' | 'tps',
    electionVoterStatus: 'PENDING' as ElectionVoterStatus,
  })

  const getIdLabel = (tipe: string) => {
    switch (tipe) {
      case 'mahasiswa': return 'NIM'
      case 'dosen': return 'NIDN'
      case 'staf': return 'NIP'
      default: return 'NIM/NIDN/NIP'
    }
  }

  const getIdPlaceholder = (tipe: string) => {
    switch (tipe) {
      case 'mahasiswa': return 'Contoh: 20211001'
      case 'dosen': return 'Contoh: 0123456789'
      case 'staf': return 'Contoh: 198501012010121001'
      default: return ''
    }
  }

  useEffect(() => {
    // Reset fields that are type-specific to mirror registration flow
    setFormData((prev) => ({
      ...prev,
      nim: '',
      fakultas: '',
      prodi: '',
      semester: prev.tipe === 'mahasiswa' ? prev.semester : '',
      akademik: prev.tipe === 'mahasiswa' ? prev.akademik : 'aktif',
    }))
    setError(undefined)
  }, [formData.tipe])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    setSaving(true)
    setError(undefined)

    try {
      const votingMethod = formData.metodeVoting === 'tps' ? 'TPS' : 'ONLINE'
      const payload: any = {
        voter_type: mapFrontendToApiVoterType(formData.tipe),
        nim: formData.nim.trim(),
        name: formData.nama.trim(),
        email: formData.email.trim() || undefined,
        voting_method: votingMethod,
        status: formData.electionVoterStatus,
      }

      if (formData.tipe === 'mahasiswa') {
        payload.faculty_name = formData.fakultas.trim()
        payload.study_program_name = formData.prodi.trim()
        if (formData.semester) {
          payload.cohort_year = parseInt(formData.semester, 10)
        }
        payload.academic_status = academicMap[formData.akademik]
      } else if (formData.tipe === 'dosen') {
        payload.faculty_name = formData.fakultas.trim()
        payload.study_program_name = formData.prodi.trim()
      } else if (formData.tipe === 'staf') {
        payload.faculty_name = formData.fakultas.trim()
        if (formData.prodi.trim()) {
          payload.study_program_name = formData.prodi.trim()
        }
      }

      await upsertVoter(token, payload, activeElectionId)
      showToast('Pemilih baru berhasil ditambahkan ke DPT', 'success')
      navigate('/admin/dpt', { state: { refresh: true } })
    } catch (err) {
      console.error('Failed to add voter', err)
      setError((err as any)?.message || 'Gagal menambahkan pemilih')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Tambah Pemilih">
      <div className="admin-dpt-page">
        <div className="page-header">
          <div>
            <h1>Tambah Pemilih Baru</h1>
            <p>Formulir administrasi DPT dengan field yang sama seperti halaman registrasi.</p>
          </div>
          <button className="btn-link" type="button" onClick={() => navigate('/admin/dpt')}>
            ← Kembali ke DPT
          </button>
        </div>

        {error && (
          <div className="alert" style={{ backgroundColor: '#fee', border: '1px solid #fcc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <section className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-field">
                <label>Tipe Pemilih *</label>
                <select
                  value={formData.tipe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipe: e.target.value as typeof prev.tipe }))}
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="staf">Staf</option>
                </select>
                <small className="inline-note" style={{ color: '#2d5a2d' }}>
                  <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                  Pilih tipe untuk menyesuaikan field (NIM/NIDN/NIP, fakultas/unit, program/departemen).
                </small>
              </div>

              <div className="form-field">
                <label>{getIdLabel(formData.tipe)} *</label>
                <input
                  type="text"
                  value={formData.nim}
                  placeholder={getIdPlaceholder(formData.tipe)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nim: e.target.value }))}
                  required
                />
                <small className="inline-note">Gunakan identitas yang sama seperti form registrasi.</small>
              </div>

              <div className="form-field">
                <label>Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  required
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@uniwa.ac.id"
                />
              </div>

              <div className="form-field">
                <label>{formData.tipe === 'staf' ? 'Unit Kerja' : 'Fakultas / Unit'} *</label>
                <input
                  type="text"
                  value={formData.fakultas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fakultas: e.target.value }))}
                  required
                  placeholder={formData.tipe === 'staf' ? 'Contoh: Biro Akademik' : 'Contoh: Fakultas Teknik'}
                />
              </div>

              <div className="form-field">
                <label>
                  {formData.tipe === 'mahasiswa' ? 'Program Studi' : formData.tipe === 'dosen' ? 'Departemen/Prodi' : 'Bagian/Unit Detail'}
                  {formData.tipe !== 'staf' && ' *'}
                </label>
                <input
                  type="text"
                  value={formData.prodi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prodi: e.target.value }))}
                  required={formData.tipe !== 'staf'}
                  placeholder={formData.tipe === 'mahasiswa' ? 'Contoh: Informatika' : formData.tipe === 'dosen' ? 'Contoh: Pendidikan Bahasa' : 'Contoh: Layanan Akademik'}
                />
              </div>

              {formData.tipe === 'mahasiswa' && (
                <>
                  <div className="form-field">
                    <label>Semester *</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                      required
                    >
                      <option value="">Pilih semester</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Status Akademik</label>
                    <select
                      value={formData.akademik}
                      onChange={(e) => setFormData((prev) => ({ ...prev, akademik: e.target.value as typeof prev.akademik }))}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="cuti">Cuti</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-field">
                <label>Metode Voting *</label>
                <select
                  value={formData.metodeVoting}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metodeVoting: e.target.value as typeof prev.metodeVoting }))}
                >
                  <option value="online">Online</option>
                  <option value="tps">TPS</option>
                </select>
                <small className="inline-note" style={{ color: '#2d5a2d' }}>
                  <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                  Sama seperti pilihan di registrasi: pilih Online atau TPS.
                </small>
              </div>

              <div className="form-field">
                <label>Status Verifikasi *</label>
                <select
                  value={formData.electionVoterStatus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, electionVoterStatus: e.target.value as ElectionVoterStatus }))}
                >
                  <option value="PENDING">Menunggu Verifikasi</option>
                  <option value="VERIFIED">Terverifikasi</option>
                  <option value="REJECTED">Ditolak</option>
                  <option value="VOTED">Sudah Memilih</option>
                  <option value="BLOCKED">Diblokir</option>
                </select>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Pemilih'}
              </button>
              <button className="btn-outline" type="button" onClick={() => navigate('/admin/dpt')} disabled={saving}>
                Batal
              </button>
            </div>
          </form>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminDPTAdd
