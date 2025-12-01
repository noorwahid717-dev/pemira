import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'
import { fetchAdminDptVoterById, updateAdminDptVoter, mapFrontendToApiVoterType } from '../services/adminDpt'
import { useToast } from '../components/Toast'
import type { DPTEntry, ElectionVoterStatus } from '../types/dptAdmin'
import { LucideIcon } from '../components/LucideIcon'
import '../styles/AdminDPT.css'

const AdminDPTEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [voter, setVoter] = useState<DPTEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    email: '',
    fakultas: '',
    prodi: '',
    semester: '',
    tipe: 'mahasiswa' as 'mahasiswa' | 'dosen' | 'staf',
    akademik: 'aktif' as 'aktif' | 'cuti' | 'nonaktif',
    metodeVoting: 'online' as 'online' | 'tps',
    electionVoterStatus: 'PENDING' as ElectionVoterStatus,
  })
  const { showToast } = useToast()

  const getIdLabel = (tipe: string) => {
    switch (tipe) {
      case 'mahasiswa': return 'NIM'
      case 'dosen': return 'NIDN'
      case 'staf': return 'NIP'
      default: return 'NIM/NIDN/NIP'
    }
  }

  useEffect(() => {
    if (!token || !id) return
    const loadVoter = async () => {
      try {
        setLoading(true)
        const data = await fetchAdminDptVoterById(token, id, activeElectionId)
        if (data) {
          setVoter(data)
          setFormData({
            nim: data.nim,
            nama: data.nama,
            email: data.email || '',
            fakultas: data.fakultas,
            prodi: data.prodi,
            semester: data.semester || '',
            tipe: (data.tipe as 'mahasiswa' | 'dosen' | 'staf') || 'mahasiswa',
            akademik: data.akademik,
            metodeVoting: (data.metodeVoting as 'online' | 'tps') || 'online',
            electionVoterStatus: data.electionVoterStatus || 'PENDING',
          })
        } else {
          setError('Data pemilih tidak ditemukan')
        }
      } catch (err) {
        console.error('Failed to load voter', err)
        setError((err as any)?.message || 'Gagal memuat data pemilih')
      } finally {
        setLoading(false)
      }
    }
    void loadVoter()
  }, [token, id, activeElectionId])

  const isAfterVote = voter?.statusSuara === 'sudah'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !id) return

    setSaving(true)
    setError(undefined)
    try {
      const updatePayload: any = {
        voter_type: mapFrontendToApiVoterType(formData.tipe),
        voting_method: formData.metodeVoting.toUpperCase(),
        status: formData.electionVoterStatus,
      }

      // Only include biodata fields if voter hasn't voted yet
      if (!isAfterVote) {
        updatePayload.name = formData.nama
        updatePayload.email = formData.email || undefined
        const facultyValue = formData.fakultas
        const programValue = formData.prodi

        // Align with registration form semantics:
        // - mahasiswa: fakultas + program studi + semester (as cohort_year)
        // - dosen: fakultas (unit) + departemen
        // - staf: unit kerja + detail unit
        if (formData.tipe === 'mahasiswa') {
          updatePayload.faculty_name = facultyValue
          updatePayload.study_program_name = programValue
          updatePayload.cohort_year = formData.semester ? parseInt(formData.semester, 10) : undefined
        } else if (formData.tipe === 'dosen') {
          updatePayload.faculty_name = facultyValue
          updatePayload.study_program_name = programValue
        } else if (formData.tipe === 'staf') {
          updatePayload.faculty_name = facultyValue
          if (programValue) {
            updatePayload.study_program_name = programValue
          }
        }
      }

      await updateAdminDptVoter(token, id, updatePayload, activeElectionId)
      showToast('Data pemilih berhasil diperbarui', 'success')
      navigate('/admin/dpt', { state: { refresh: true } })
    } catch (err) {
      console.error('Failed to update voter', err)
      setError((err as any)?.message || 'Gagal memperbarui data pemilih')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Pemilih">
        <div className="admin-dpt-page">
          <p>Memuat data...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!voter) {
    return (
      <AdminLayout title="Edit Pemilih">
        <div className="admin-dpt-page">
          <div className="empty-state card">
            <p>{error || 'Data pemilih tidak ditemukan.'}</p>
            <button className="btn-primary" type="button" onClick={() => navigate('/admin/dpt')}>
              Kembali ke DPT
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Pemilih">
      <div className="admin-dpt-page">
        <div className="page-header">
          <div>
            <h1>Edit Pemilih – {voter.nim}</h1>
            <p>Ubah data pemilih yang sudah terdaftar</p>
            <p className="inline-note">
              Tipe: {formData.tipe === 'dosen' ? 'Dosen' : formData.tipe === 'staf' ? 'Staf' : 'Mahasiswa'}
            </p>
          </div>
          <button className="btn-link" type="button" onClick={() => navigate('/admin/dpt')}>
            ← Kembali
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
                <label>{getIdLabel(formData.tipe)} *</label>
                <input type="text" value={formData.nim} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                <small>{getIdLabel(formData.tipe)} tidak dapat diubah</small>
              </div>

              <div className="form-field">
                <label>Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  required
                  disabled={isAfterVote}
                  style={isAfterVote ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {isAfterVote && <small style={{ color: '#ff6b6b' }}>Tidak dapat diubah setelah voting</small>}
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={isAfterVote}
                  style={isAfterVote ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {isAfterVote && <small style={{ color: '#ff6b6b' }}>Tidak dapat diubah setelah voting</small>}
              </div>

              <div className="form-field">
                <label>{formData.tipe === 'staf' ? 'Unit Kerja' : 'Fakultas'} *</label>
                <input
                  type="text"
                  value={formData.fakultas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fakultas: e.target.value }))}
                  required
                  disabled={isAfterVote}
                  style={isAfterVote ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {isAfterVote && <small style={{ color: '#ff6b6b' }}>Tidak dapat diubah setelah voting</small>}
              </div>

              <div className="form-field">
                <label>
                  {formData.tipe === 'mahasiswa' ? 'Program Studi' : formData.tipe === 'dosen' ? 'Departemen' : 'Bagian/Unit Detail'}
                  {formData.tipe !== 'staf' && ' *'}
                </label>
                <input
                  type="text"
                  value={formData.prodi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prodi: e.target.value }))}
                  required={formData.tipe !== 'staf'}
                  disabled={isAfterVote}
                  style={isAfterVote ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />
                {isAfterVote && <small style={{ color: '#ff6b6b' }}>Tidak dapat diubah setelah voting</small>}
              </div>

              {formData.tipe === 'mahasiswa' && (
                <>
                  <div className="form-field">
                    <label>Semester *</label>
                    <select
                      value={formData.semester || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                      required
                      disabled={isAfterVote}
                      style={isAfterVote ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    >
                      <option value="">Pilih semester</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                    {isAfterVote && <small style={{ color: '#ff6b6b' }}>Tidak dapat diubah setelah voting</small>}
                  </div>

                  <div className="form-field">
                    <label>Status Akademik</label>
                    <select value={formData.akademik} onChange={(e) => setFormData((prev) => ({ ...prev, akademik: e.target.value as typeof formData.akademik }))}>
                      <option value="aktif">Aktif</option>
                      <option value="cuti">Cuti</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-field">
                <label>Tipe Pemilih *</label>
                <select value={formData.tipe} onChange={(e) => setFormData((prev) => ({ ...prev, tipe: e.target.value as typeof formData.tipe }))}>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="staf">Staf</option>
                </select>
                <small className="inline-note" style={{ color: '#2d5a2d' }}>
                  <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                  Bisa diubah bahkan setelah voting untuk koreksi data
                </small>
              </div>

              <div className="form-field">
                <label>Metode Voting *</label>
                <select value={formData.metodeVoting} onChange={(e) => setFormData((prev) => ({ ...prev, metodeVoting: e.target.value as typeof formData.metodeVoting }))}>
                  <option value="online">Online</option>
                  <option value="tps">TPS</option>
                </select>
                <small className="inline-note" style={{ color: '#2d5a2d' }}>
                  <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                  Pilih metode yang sesuai, bisa diubah sebelum voting dimulai
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
                <small className="inline-note" style={{ color: '#2d5a2d' }}>
                  <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                  Ubah status verifikasi pemilih untuk pemilu ini
                </small>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button className="btn-outline" type="button" onClick={() => navigate('/admin/dpt')} disabled={saving}>
                Batal
              </button>
            </div>
          </form>
        </section>

        {voter.statusSuara === 'sudah' && (
          <section className="card warning" style={{ marginTop: '1rem' }}>
            <h3 className="inline-note" style={{ color: '#b91c1c' }}>
              <LucideIcon name="alertCircle" className="inline-icon" size={16} />
              Peringatan
            </h3>
            <p>Pemilih ini sudah melakukan voting. Perubahan data tidak akan mempengaruhi suara yang sudah masuk.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#2d5a2d' }}>
              <span className="inline-note">
                <LucideIcon name="lightbulb" className="inline-icon" size={14} />
                <strong>Tipe pemilih</strong> masih bisa diubah untuk koreksi data yang salah.
              </span>
            </p>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDPTEdit
