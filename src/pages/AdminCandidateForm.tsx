import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import type { CandidateAdmin, CandidateProgramAdmin, CandidateStatus } from '../types/candidateAdmin'
import '../styles/AdminCandidates.css'

const statusLabels: Record<CandidateStatus, string> = {
  active: 'Aktif',
  draft: 'Draft',
  hidden: 'Disembunyikan',
}

const AdminCandidateForm = (): JSX.Element => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getCandidateById, createEmptyCandidate, addCandidate, updateCandidate, isNumberAvailable } = useCandidateAdminStore()

  const editing = Boolean(id)
  const existingCandidate = id ? getCandidateById(id) : undefined

  const [formData, setFormData] = useState<CandidateAdmin>(existingCandidate ?? createEmptyCandidate())
  const [missionDraft, setMissionDraft] = useState('')
  const [newProgram, setNewProgram] = useState<CandidateProgramAdmin>({ id: '', title: '', description: '' })
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (existingCandidate) {
      setFormData(existingCandidate)
    }
  }, [existingCandidate])

  const numberAvailable = useMemo(() => isNumberAvailable(formData.number, editing ? formData.id : undefined), [formData.number, editing, formData.id, isNumberAvailable])

  const updateField = <K extends keyof CandidateAdmin>(field: K, value: CandidateAdmin[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addMission = () => {
    if (!missionDraft.trim()) return
    updateField('missions', [...formData.missions, missionDraft.trim()])
    setMissionDraft('')
  }

  const removeMission = (index: number) => {
    updateField('missions', formData.missions.filter((_, idx) => idx !== index))
  }

  const addProgram = () => {
    if (!newProgram.title.trim()) return
    const payload: CandidateProgramAdmin = {
      id: newProgram.id || `program-${Date.now()}`,
      title: newProgram.title.trim(),
      description: newProgram.description.trim(),
    }
    updateField('programs', [...formData.programs, payload])
    setNewProgram({ id: '', title: '', description: '' })
  }

  const removeProgram = (programId: string) => {
    updateField('programs', formData.programs.filter((program) => program.id !== programId))
  }

  const addMedia = (type: 'photo' | 'video' | 'pdf') => {
    const label = type === 'photo' ? 'Foto Kampanye' : type === 'video' ? 'Video' : 'PDF'
    updateField('media', [...formData.media, { id: `media-${Date.now()}`, type, url: '', label }])
  }

  const updateMedia = (mediaId: string, url: string, label: string) => {
    updateField(
      'media',
      formData.media.map((item) => (item.id === mediaId ? { ...item, url, label } : item)),
    )
  }

  const removeMedia = (mediaId: string) => {
    updateField('media', formData.media.filter((item) => item.id !== mediaId))
  }

  const handleSubmit = (status: CandidateStatus) => {
    if (!formData.name.trim()) {
      setError('Nama kandidat wajib diisi.')
      return
    }
    if (!numberAvailable) {
      setError('Nomor urut sudah digunakan kandidat lain.')
      return
    }
    const payload: CandidateAdmin = { ...formData, status }
    if (editing) {
      updateCandidate(formData.id, payload)
    } else {
      addCandidate(payload)
    }
    navigate('/admin/kandidat')
  }

  const handlePublish = () => {
    if (!window.confirm('Publikasikan kandidat ini?')) return
    handleSubmit('active')
  }

  return (
    <div className="admin-candidates-page">
      <div className="page-header">
        <div>
          <h1>{editing ? `Edit Kandidat – ${formData.name || ''}` : 'Tambah Kandidat Baru'}</h1>
          {editing && <span className={`status-chip ${formData.status}`}>{statusLabels[formData.status]}</span>}
        </div>
        <button className="btn-link" type="button" onClick={() => navigate('/admin/kandidat')}>
          ← Kembali ke daftar
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="candidate-form" onSubmit={(event) => event.preventDefault()}>
        <section>
          <h2>Informasi Umum</h2>
          <div className="form-grid">
            <label>
              Nama Kandidat
              <input type="text" value={formData.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
            <label>
              Nomor Urut
              <input
                type="number"
                value={formData.number}
                onChange={(event) => updateField('number', Number(event.target.value))}
                required
              />
              {!numberAvailable && <small className="error">Nomor urut sudah digunakan.</small>}
            </label>
            <label>
              Fakultas
              <input type="text" value={formData.faculty} onChange={(event) => updateField('faculty', event.target.value)} />
            </label>
            <label>
              Program Studi
              <input type="text" value={formData.programStudi} onChange={(event) => updateField('programStudi', event.target.value)} />
            </label>
            <label>
              Angkatan
              <input type="text" value={formData.angkatan} onChange={(event) => updateField('angkatan', event.target.value)} />
            </label>
            <label>
              Status Kandidat
              <select value={formData.status} onChange={(event) => updateField('status', event.target.value as CandidateStatus)}>
                <option value="draft">Draft</option>
                <option value="active">Aktif</option>
                <option value="hidden">Disembunyikan</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2>Foto & Media Kampanye</h2>
          <div className="form-grid">
            <label>
              Foto Profil URL
              <input type="url" value={formData.photoUrl} onChange={(event) => updateField('photoUrl', event.target.value)} />
            </label>
            <div className="photo-preview">
              {formData.photoUrl ? <img src={formData.photoUrl} alt={formData.name} /> : <span>Preview foto tampil di sini</span>}
            </div>
          </div>
          <div className="media-actions">
            <button type="button" className="btn-outline" onClick={() => addMedia('photo')}>
              + Upload Foto
            </button>
            <button type="button" className="btn-outline" onClick={() => addMedia('video')}>
              + Upload Video
            </button>
            <button type="button" className="btn-outline" onClick={() => addMedia('pdf')}>
              + Upload PDF
            </button>
          </div>
          <div className="media-grid">
            {formData.media.map((media) => (
              <div key={media.id} className="media-item">
                <strong>{media.type.toUpperCase()}</strong>
                <input
                  type="text"
                  placeholder="URL Media"
                  value={media.url}
                  onChange={(event) => updateMedia(media.id, event.target.value, media.label)}
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={media.label}
                  onChange={(event) => updateMedia(media.id, media.url, event.target.value)}
                />
                <button type="button" className="btn-link" onClick={() => removeMedia(media.id)}>
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Visi & Misi</h2>
          <label>
            Judul Visi
            <input type="text" value={formData.visionTitle} onChange={(event) => updateField('visionTitle', event.target.value)} />
          </label>
          <label>
            Deskripsi Visi
            <textarea value={formData.visionDescription} onChange={(event) => updateField('visionDescription', event.target.value)} />
          </label>

          <div className="missions">
            <div className="missions-header">
              <h3>Misi</h3>
              <div>
                <input
                  type="text"
                  placeholder="Tambah poin misi"
                  value={missionDraft}
                  onChange={(event) => setMissionDraft(event.target.value)}
                />
                <button type="button" className="btn-primary" onClick={addMission}>
                  + Tambah Misi
                </button>
              </div>
            </div>
            <ul>
              {formData.missions.map((mission, index) => (
                <li key={`${mission}-${index}`}>
                  <input
                    type="text"
                    value={mission}
                    onChange={(event) => {
                      const next = [...formData.missions]
                      next[index] = event.target.value
                      updateField('missions', next)
                    }}
                  />
                  <button type="button" className="btn-link" onClick={() => removeMission(index)}>
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2>Program Kerja Utama</h2>
          <div className="programs">
            {formData.programs.map((program) => (
              <div key={program.id} className="program-item">
                <label>
                  Judul Program
                  <input
                    type="text"
                    value={program.title}
                    onChange={(event) =>
                      updateField(
                        'programs',
                        formData.programs.map((entry) => (entry.id === program.id ? { ...entry, title: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
                <label>
                  Deskripsi Singkat
                  <textarea
                    value={program.description}
                    onChange={(event) =>
                      updateField(
                        'programs',
                        formData.programs.map((entry) => (entry.id === program.id ? { ...entry, description: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
                <button type="button" className="btn-link" onClick={() => removeProgram(program.id)}>
                  Hapus Program
                </button>
              </div>
            ))}
            <div className="program-item add-program">
              <label>
                Judul Program Baru
                <input
                  type="text"
                  value={newProgram.title}
                  onChange={(event) => setNewProgram((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label>
                Deskripsi Singkat
                <textarea
                  value={newProgram.description}
                  onChange={(event) => setNewProgram((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>
              <button type="button" className="btn-outline" onClick={addProgram}>
                + Tambah Program
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2>Video Kampanye (Opsional)</h2>
          <label>
            Link YouTube
            <input type="url" value={formData.campaignVideo ?? ''} onChange={(event) => updateField('campaignVideo', event.target.value)} />
          </label>
          {formData.campaignVideo && (
            <div className="video-preview">
              <iframe
                src={formData.campaignVideo.replace('watch?v=', 'embed/')}
                title="Preview video"
                loading="lazy"
              />
            </div>
          )}
        </section>

        <div className="form-actions">
          <button className="btn-outline" type="button" onClick={() => navigate('/admin/kandidat')}>
            Batal
          </button>
          <button className="btn-outline" type="button" onClick={() => handleSubmit('draft')}>
            Simpan Draft
          </button>
          <button className="btn-primary" type="button" onClick={handlePublish}>
            {editing ? 'Update & Publikasikan' : 'Publikasikan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminCandidateForm
