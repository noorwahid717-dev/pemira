import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import { useActiveElection } from '../hooks/useActiveElection'
import { usePopup } from '../components/Popup'
import { fetchAdminCandidateDetail, publishAdminCandidate } from '../services/adminCandidates'
import {
  deleteCandidateMedia,
  deleteCandidateProfileMedia,
  fetchCandidateMediaFile,
  uploadCandidateMedia,
  uploadCandidateProfileMedia,
} from '../services/adminCandidateMedia'
import type { CandidateAdmin, CandidateMediaSlot, CandidateProgramAdmin, CandidateStatus } from '../types/candidateAdmin'
import '../styles/AdminCandidates.css'

const isNumericId = (value?: string | number) => {
  if (value === null || value === undefined) return false
  const str = String(value)
  return /^\d+$/.test(str)
}

const statusLabels: Record<CandidateStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Menunggu Review',
  PUBLISHED: 'Terpublikasi',
  APPROVED: 'Terpublikasi (Legacy)',
  HIDDEN: 'Disembunyikan',
  REJECTED: 'Ditolak',
  WITHDRAWN: 'Ditarik',
  ARCHIVED: 'Arsip',
}

type StepId = 'data' | 'profile' | 'vision' | 'program' | 'review'

const steps: { id: StepId; label: string; helper: string }[] = [
  { id: 'data', label: 'Data Utama', helper: 'Nama, nomor urut, fakultas' },
  { id: 'profile', label: 'Profil & Media', helper: 'Bio dan foto' },
  { id: 'vision', label: 'Visi & Misi', helper: 'Visi besar dan misi' },
  { id: 'program', label: 'Program Kerja', helper: 'Program prioritas' },
  { id: 'review', label: 'Video & Review', helper: 'Upload PDF, cek ulang' },
]

const emptyProgram: CandidateProgramAdmin = { id: '', title: '', description: '', category: '' }

const parseVisionItems = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const CandidatePreviewMini = ({ data }: { data: CandidateAdmin }) => {
  const visionItems = parseVisionItems(data.visionDescription || '')
  return (
    <div className="mini-preview">
      <div className="mini-preview-hero">
        {data.photoUrl ? <img src={data.photoUrl} alt={data.name} /> : <div className="mini-photo-placeholder">Foto kandidat</div>}
        <div>
          <span className="mini-number">No. {data.number ? data.number.toString().padStart(2, '0') : '--'}</span>
          <h3>{data.name || 'Nama Kandidat'}</h3>
          {data.tagline && <p className="mini-tagline">{data.tagline}</p>}
          <p className="mini-meta">
            {data.faculty || 'Fakultas'} · {data.programStudi || 'Program Studi'} · Angkatan {data.angkatan || '—'}
          </p>
        </div>
      </div>
      {data.shortBio && <p className="mini-bio">{data.shortBio}</p>}
      <div className="mini-section">
        <h4>Visi</h4>
        <p className="mini-muted">{visionItems[0] || data.longBio || 'Deskripsi visi muncul di sini.'}</p>
      </div>
      <div className="mini-section">
        <h4>Misi</h4>
        <ul>
          {(data.missions.length ? data.missions : ['Masukkan misi kandidat']).slice(0, 4).map((mission, idx) => (
            <li key={`${mission}-${idx}`}>{mission}</li>
          ))}
        </ul>
      </div>
      {data.programs.length > 0 && (
        <div className="mini-section">
          <h4>Program Utama</h4>
          <div className="mini-programs">
            {data.programs.slice(0, 3).map((program) => (
              <article key={program.id}>
                <strong>{program.title || 'Program'}</strong>
                <p className="mini-muted">{program.description || 'Deskripsi singkat program.'}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const AdminCandidateForm = (): JSX.Element => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { getCandidateById, createEmptyCandidate, addCandidate, updateCandidate, isNumberAvailable, refresh } = useCandidateAdminStore()
  const { showPopup } = usePopup()

  const editing = Boolean(id)
  const existingCandidate = id ? getCandidateById(id) : undefined

  const [formData, setFormData] = useState<CandidateAdmin>(existingCandidate ?? createEmptyCandidate())
  const [visionDraft, setVisionDraft] = useState('')
  const [visionItems, setVisionItems] = useState<string[]>([])
  const [missionDraft, setMissionDraft] = useState('')
  const [programDraft, setProgramDraft] = useState<CandidateProgramAdmin>(emptyProgram)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string>('')
  const [autosaveStatus, setAutosaveStatus] = useState<string>('Draf belum disimpan')
  const [reviewChecked, setReviewChecked] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [pendingProfile, setPendingProfile] = useState<{ file: File; preview: string } | null>(null)
  const [pendingMedia, setPendingMedia] = useState<
    { id: string; slot: CandidateMediaSlot; file: File; preview: string; type: 'photo' | 'pdf'; label: string }[]
  >([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const firstRender = useRef(true)
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    if (existingCandidate) {
      setFormData(existingCandidate)
    }
  }, [existingCandidate])

  useEffect(() => {
    setVisionItems(parseVisionItems(formData.visionDescription ?? ''))
  }, [formData.visionDescription])

  useEffect(() => {
    if (!editing || !id || !token) return
    let cancelled = false
    const loadDetail = async () => {
      try {
        const detail = await fetchAdminCandidateDetail(token, id)
        if (!cancelled) {
          setFormData(detail)
        }
      } catch (err) {
        console.error('Failed to load candidate detail', err)
      }
    }
    void loadDetail()
    return () => {
      cancelled = true
    }
  }, [editing, id, token])

  const numberAvailable = useMemo(
    () => isNumberAvailable(formData.number, editing ? formData.id : undefined),
    [formData.number, editing, formData.id, isNumberAvailable],
  )
  const missingMediaIds = useMemo(() => formData.media.filter((m) => !m.url).map((m) => m.id).join(','), [formData.media])
  const pageTitle = editing ? 'Edit Kandidat' : 'Tambah Kandidat'

  const updateField = <K extends keyof CandidateAdmin>(field: K, value: CandidateAdmin[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateVisionItems = (next: string[]) => {
    setVisionItems(next)
    updateField('visionDescription', next.join('\n'))
  }

  const registerObjectUrl = (url: string) => {
    objectUrlsRef.current.push(url)
    return url
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setAutosaveStatus('Menyimpan draf...')
    const timer = window.setTimeout(() => setAutosaveStatus('✔ Draft tersimpan (lokal)'), 800)
    return () => window.clearTimeout(timer)
  }, [formData])

  useEffect(() => {
    if (!token || !formData.id) return
    const mediaToFetch = formData.media.filter((item) => !item.url && item.id)
    if (mediaToFetch.length === 0) return
    let cancelled = false
    const loadMedia = async () => {
      setMediaLoading(true)
      try {
        if (mediaToFetch.length) {
          for (const media of mediaToFetch) {
            const url = await fetchCandidateMediaFile(token, formData.id, media.id)
            if (!cancelled && url) {
              setFormData((prev) => ({
                ...prev,
                media: prev.media.map((entry) => (entry.id === media.id ? { ...entry, url: registerObjectUrl(url) } : entry)),
              }))
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Gagal memuat media kandidat. Coba refresh.')
        }
        console.error('Failed to fetch candidate media', err)
      } finally {
        if (!cancelled) setMediaLoading(false)
      }
    }
    void loadMedia()
    return () => {
      cancelled = true
    }
  }, [formData.id, formData.media, missingMediaIds, token])

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    },
    [],
  )

  const addMission = () => {
    if (!missionDraft.trim()) return
    updateField('missions', [...formData.missions, missionDraft.trim()])
    setMissionDraft('')
  }

  const addVision = () => {
    if (!visionDraft.trim()) return
    updateVisionItems([...visionItems, visionDraft.trim()])
    setVisionDraft('')
  }

  const removeVision = async (index: number) => {
    const confirmed = await showPopup({
      title: 'Hapus Visi',
      message: 'Hapus poin visi ini?',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    })
    if (!confirmed) return
    updateVisionItems(visionItems.filter((_, idx) => idx !== index))
  }

  const moveVision = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= visionItems.length) return
    const next = [...visionItems]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateVisionItems(next)
  }

  const removeMission = async (index: number) => {
    const confirmed = await showPopup({
      title: 'Hapus Misi',
      message: 'Hapus misi ini?',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    updateField('missions', formData.missions.filter((_, idx) => idx !== index))
  }

  const moveMission = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= formData.missions.length) return
    const next = [...formData.missions]
      ;[next[index], next[target]] = [next[target], next[index]]
    updateField('missions', next)
  }

  const addProgram = () => {
    if (!programDraft.title.trim()) return
    const payload: CandidateProgramAdmin = {
      id: programDraft.id || `program-${Date.now()}`,
      title: programDraft.title.trim(),
      description: programDraft.description.trim(),
      category: programDraft.category?.trim(),
    }
    updateField('programs', [...formData.programs, payload])
    setProgramDraft(emptyProgram)
  }

  const updateProgram = (programId: string, patch: Partial<CandidateProgramAdmin>) => {
    updateField(
      'programs',
      formData.programs.map((entry) => (entry.id === programId ? { ...entry, ...patch } : entry)),
    )
  }

  const removeProgram = async (programId: string) => {
    const confirmed = await showPopup({
      title: 'Hapus Program',
      message: 'Hapus program ini?',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    updateField('programs', formData.programs.filter((program) => program.id !== programId))
  }

  const moveProgram = (programId: string, direction: 'up' | 'down') => {
    const idx = formData.programs.findIndex((p) => p.id === programId)
    if (idx === -1) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= formData.programs.length) return
    const next = [...formData.programs]
      ;[next[idx], next[target]] = [next[target], next[idx]]
    updateField('programs', next)
  }

  const handleMediaUpload = async (slot: 'photo' | 'poster' | 'pdf', file?: File) => {
    if (!file) return
    const isPdf = slot === 'pdf'
    if (isPdf && file.type !== 'application/pdf') {
      setError('Unggah dokumen PDF.')
      return
    }
    if (!isPdf && !file.type.startsWith('image/')) {
      setError('File harus berupa gambar.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran file maksimal 3MB.')
      return
    }

    const preview = registerObjectUrl(URL.createObjectURL(file))
    setError('')

    if (slot === 'photo') {
      setPendingProfile({ file, preview })
      setFormData((prev) => ({ ...prev, photoUrl: preview }))
      if (token && isNumericId(formData.id)) {
        try {
          setMediaLoading(true)
          const uploaded = await uploadCandidateProfileMedia(token, formData.id, file)
          let remotePhotoUrl: string | undefined
          try {
            const updatedDetail = await fetchAdminCandidateDetail(token, String(formData.id))
            remotePhotoUrl = updatedDetail.photoUrl || undefined
          } catch {
            remotePhotoUrl = undefined
          }
          setFormData((prev) => ({
            ...prev,
            photoUrl: remotePhotoUrl || prev.photoUrl,
            photoMediaId: uploaded.id ?? prev.photoMediaId,
          }))
          setPendingProfile(null)
        } catch (err) {
          console.error('Failed to upload profile photo', err)
          setError('Gagal mengunggah foto profil.')
        } finally {
          setMediaLoading(false)
        }
      }
      return
    }

    const candidateSlot: CandidateMediaSlot = isPdf ? 'pdf_visimisi' : 'poster'
    const tempId = `media-${Date.now()}`
    const type = isPdf ? 'pdf' : 'photo'
    const label = isPdf ? 'Dokumen Visi & Misi' : 'Foto Kampanye'
    const mediaEntry = { id: tempId, slot: candidateSlot, type, url: preview, label }
    setFormData((prev) => ({ ...prev, media: [...prev.media, mediaEntry] }))

    if (token && isNumericId(formData.id)) {
      try {
        setMediaLoading(true)
        const uploaded = await uploadCandidateMedia(token, formData.id, candidateSlot, file)
        const mediaUrl = await fetchCandidateMediaFile(token, formData.id, uploaded.id)
        setFormData((prev) => ({
          ...prev,
          media: prev.media.map((item) =>
            item.id === tempId ? { ...item, id: uploaded.id, url: mediaUrl ? registerObjectUrl(mediaUrl) : item.url } : item,
          ),
        }))
      } catch (err) {
        console.error('Failed to upload media', err)
        setError('Gagal mengunggah media.')
        setFormData((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== tempId) }))
      } finally {
        setMediaLoading(false)
      }
    } else {
      setPendingMedia((prev) => [...prev, { id: tempId, slot: candidateSlot, file, preview, type, label }])
    }
  }

  const clearPhoto = async () => {
    if (pendingProfile) {
      setPendingProfile(null)
    }
    if (formData.photoUrl) {
      setFormData((prev) => ({ ...prev, photoUrl: '', photoMediaId: null }))
    }
    if (token && isNumericId(formData.id) && formData.photoMediaId) {
      try {
        await deleteCandidateProfileMedia(token, formData.id)
      } catch (err) {
        console.error('Failed to delete profile photo', err)
        setError('Gagal menghapus foto profil.')
      }
    }
  }

  const removeMediaItem = async (mediaId: string) => {
    const pending = pendingMedia.find((item) => item.id === mediaId)
    if (pending) {
      setPendingMedia((prev) => prev.filter((item) => item.id !== mediaId))
    }
    setFormData((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== mediaId) }))
    if (!pending && token && formData.id) {
      try {
        await deleteCandidateMedia(token, formData.id, mediaId)
      } catch (err) {
        console.error('Failed to delete media', err)
        setError('Gagal menghapus media.')
      }
    }
  }

  const validateStep = (step: StepId) => {
    if (step === 'data') {
      if (!formData.name.trim()) {
        setError('Nama kandidat wajib diisi.')
        return false
      }
      if (!formData.number) {
        setError('Nomor urut wajib diisi.')
        return false
      }
      if (!numberAvailable) {
        setError('Nomor urut sudah digunakan kandidat lain.')
        return false
      }
      if (!formData.faculty.trim() || !formData.programStudi.trim()) {
        setError('Fakultas dan prodi wajib diisi.')
        return false
      }
    }
    if (step === 'vision') {
      if (visionItems.length === 0) {
        setError('Visi wajib diisi.')
        return false
      }
    }
    if (step === 'program') {
      if (!formData.programs.length) {
        setError('Minimal satu program kerja.')
        return false
      }
    }
    if (step === 'review' && !reviewChecked) {
      setError('Centang persetujuan sebelum publish.')
      return false
    }
    setError('')
    return true
  }

  const goNext = () => {
    const current = steps[stepIndex]
    if (!validateStep(current.id)) return
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const goPrev = () => setStepIndex((prev) => Math.max(prev - 1, 0))

  const handleSubmit = async (status: CandidateStatus) => {
    const payload: CandidateAdmin = { ...formData, status }
    try {
      let savedCandidate: CandidateAdmin
      if (editing) {
        savedCandidate = await updateCandidate(formData.id, payload)
      } else {
        savedCandidate = await addCandidate(payload)
      }

      if (token) {
        if (pendingProfile?.file) {
          try {
            const uploaded = await uploadCandidateProfileMedia(token, savedCandidate.id, pendingProfile.file)
            let remotePhotoUrl = savedCandidate.photoUrl
            try {
              const updatedDetail = await fetchAdminCandidateDetail(token, String(savedCandidate.id))
              remotePhotoUrl = updatedDetail.photoUrl || remotePhotoUrl
            } catch {
              // keep local preview
            }
            savedCandidate = {
              ...savedCandidate,
              photoMediaId: uploaded.id ?? savedCandidate.photoMediaId,
              photoUrl: remotePhotoUrl,
            }
          } catch (err) {
            console.error('Failed to upload pending profile', err)
            setError('Foto profil belum berhasil diunggah.')
          }
        }

        if (pendingMedia.length) {
          for (const pendingItem of pendingMedia) {
            try {
              const uploaded = await uploadCandidateMedia(token, savedCandidate.id, pendingItem.slot, pendingItem.file)
              const mediaUrl = await fetchCandidateMediaFile(token, savedCandidate.id, uploaded.id)
              const newEntry = {
                id: uploaded.id,
                slot: uploaded.slot,
                type: pendingItem.type,
                url: mediaUrl ? registerObjectUrl(mediaUrl) : pendingItem.preview,
                label: pendingItem.label,
              }
              savedCandidate = {
                ...savedCandidate,
                media: [...savedCandidate.media.filter((m) => m.id !== pendingItem.id), newEntry],
              }
            } catch (err) {
              console.error('Failed to upload pending media', err)
              setError('Sebagian media gagal diunggah.')
            }
          }
        }
      }

      setPendingProfile(null)
      setPendingMedia([])
      setFormData(savedCandidate)
      void refresh()
      navigate('/admin/kandidat')
    } catch (err) {
      console.error('Failed to save candidate', err)
      setError((err as { message?: string })?.message ?? 'Gagal menyimpan kandidat')
    }
  }

  const saveCandidateOnly = async (status: CandidateStatus): Promise<CandidateAdmin> => {
    const payload: CandidateAdmin = { ...formData, status }
    let savedCandidate: CandidateAdmin
    if (editing) {
      savedCandidate = await updateCandidate(formData.id, payload)
    } else {
      savedCandidate = await addCandidate(payload)
    }

    if (token) {
      if (pendingProfile?.file) {
        try {
          const uploaded = await uploadCandidateProfileMedia(token, savedCandidate.id, pendingProfile.file)
          let remotePhotoUrl = savedCandidate.photoUrl
          try {
            const updatedDetail = await fetchAdminCandidateDetail(token, String(savedCandidate.id))
            remotePhotoUrl = updatedDetail.photoUrl || remotePhotoUrl
          } catch {
            // keep local preview
          }
          savedCandidate = {
            ...savedCandidate,
            photoMediaId: uploaded.id ?? savedCandidate.photoMediaId,
            photoUrl: remotePhotoUrl,
          }
        } catch (err) {
          console.error('Failed to upload pending profile', err)
          setError('Foto profil belum berhasil diunggah.')
        }
      }

      if (pendingMedia.length) {
        for (const pendingItem of pendingMedia) {
          try {
            const uploaded = await uploadCandidateMedia(token, savedCandidate.id, pendingItem.slot, pendingItem.file)
            const mediaUrl = await fetchCandidateMediaFile(token, savedCandidate.id, uploaded.id)
            const newEntry = {
              id: uploaded.id,
              slot: uploaded.slot,
              type: pendingItem.type,
              url: mediaUrl ? registerObjectUrl(mediaUrl) : pendingItem.preview,
              label: pendingItem.label,
            }
            savedCandidate = {
              ...savedCandidate,
              media: [...savedCandidate.media.filter((m) => m.id !== pendingItem.id), newEntry],
            }
          } catch (err) {
            console.error('Failed to upload pending media', err)
            setError('Sebagian media gagal diunggah.')
          }
        }
      }
    }

    setPendingProfile(null)
    setPendingMedia([])
    setFormData(savedCandidate)
    void refresh()
    return savedCandidate
  }

  const handlePublish = async () => {
    if (!validateStep('review')) return
    const confirmed = await showPopup({
      title: 'Publikasikan Kandidat',
      message: 'Pastikan nama, nomor urut, dan fakultas sudah benar. Kandidat akan muncul di halaman publik.',
      type: 'info',
      confirmText: 'Publikasikan',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    if (!token) {
      setError('Token admin diperlukan untuk publish.')
      return
    }
    try {
      const savedCandidate = await saveCandidateOnly('PENDING')
      const published = await publishAdminCandidate(token, activeElectionId, savedCandidate.id)
      setFormData(published)
      void refresh()
      navigate('/admin/kandidat')
    } catch (err) {
      console.error('Failed to publish candidate', err)
      setError((err as { message?: string })?.message ?? 'Gagal publish kandidat')
    }
  }

  const helperText = (text: string, required?: boolean) => (
    <span className="field-hint">
      {text}
      {required && <strong> *</strong>}
    </span>
  )

  const currentStepId = steps[stepIndex].id

  return (
    <AdminLayout title={pageTitle}>
      <div className="admin-candidates-page candidate-wizard">
        <div className="wizard-sticky">
          <div className="wizard-top">
            <button className="btn-link" type="button" onClick={() => navigate('/admin/kandidat')}>
              ◀ Kembali ke daftar kandidat
            </button>
            <div className="wizard-status">
              <span className="status-chip">{statusLabels[formData.status]}</span>
              <span className="autosave">{autosaveStatus}</span>
              {mediaLoading && <span className="autosave">Memproses media...</span>}
            </div>
          </div>
          <div className="wizard-title-row">
            <div>
              <p className="sub-label">Status Voting: Aktif · Mode: Online + TPS</p>
              <h1>{editing ? `Edit Kandidat – ${formData.name || 'Belum diisi'}` : 'Tambah Kandidat Baru'}</h1>
            </div>
            <div className="wizard-actions">
              <button className="btn-outline" type="button" onClick={() => setShowPreviewModal(true)}>
                Lihat Preview Penuh
              </button>
              {editing && (
                <Link to={`/admin/kandidat/${formData.id}/preview`} className="btn-outline">
                  Buka Halaman Preview
                </Link>
              )}
            </div>
          </div>
          <div className="wizard-steps">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`wizard-step ${index === stepIndex ? 'active' : ''} ${index < stepIndex ? 'done' : ''}`}
                onClick={() => setStepIndex(index)}
              >
                <span className="step-number">{index + 1}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.helper}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="wizard-body">
          <div className="wizard-main">
            {currentStepId === 'data' && (
              <section className="wizard-card">
                <header>
                  <div>
                    <p className="pill">Step 1 · Data Utama</p>
                    <h2>Identitas Kandidat</h2>
                    <p className="muted">Isi data dasar terlebih dahulu.</p>
                  </div>
                  <span className="step-indicator">{stepIndex + 1} / {steps.length}</span>
                </header>
                <div className="form-grid">
                  <label>
                    Nama Kandidat *
                    <input type="text" value={formData.name} onChange={(event) => updateField('name', event.target.value)} required />
                    {helperText('Gunakan format lengkap.', true)}
                  </label>
                  <label>
                    Nomor Urut *
                    <input type="number" value={formData.number || ''} onChange={(event) => updateField('number', Number(event.target.value))} required />
                    {!numberAvailable && <small className="error-text">Nomor urut sudah digunakan.</small>}
                  </label>
                  <label>
                    Fakultas *
                    <input type="text" value={formData.faculty} onChange={(event) => updateField('faculty', event.target.value)} />
                  </label>
                  <label>
                    Program Studi *
                    <input type="text" value={formData.programStudi} onChange={(event) => updateField('programStudi', event.target.value)} />
                  </label>
                  <label>
                    Angkatan
                    <input type="text" value={formData.angkatan} onChange={(event) => updateField('angkatan', event.target.value)} />
                  </label>
                  <label>
                    Status Kandidat
                    <select value={formData.status} onChange={(event) => updateField('status', event.target.value as CandidateStatus)}>
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING">Menunggu Review</option>
                      <option value="PUBLISHED">Terpublikasi</option>
                      <option value="APPROVED">Disetujui (Legacy)</option>
                      <option value="HIDDEN">Disembunyikan</option>
                      <option value="REJECTED">Ditolak</option>
                      <option value="WITHDRAWN">Ditarik</option>
                      <option value="ARCHIVED">Arsip</option>
                    </select>
                    {helperText('Atur ke Draft sampai siap dipublish.')}
                  </label>
                  <label>
                    Tagline (opsional)
                    <input type="text" value={formData.tagline ?? ''} onChange={(event) => updateField('tagline', event.target.value)} />
                    {helperText('Kalimat singkat yang catchy.')}
                  </label>
                </div>
              </section>
            )}

            {currentStepId === 'profile' && (
              <section className="wizard-card">
                <header>
                  <p className="pill">Step 2 · Profil & Media</p>
                  <h2>Profil dan Foto</h2>
                  <p className="muted">Tambahkan bio singkat dan foto kampanye.</p>
                </header>
                <div className="form-grid two-column">
                  <label>
                    Short Bio (maks 500 karakter)
                    <textarea
                      maxLength={500}
                      value={formData.shortBio ?? ''}
                      onChange={(event) => updateField('shortBio', event.target.value)}
                    />
                  </label>
                  <label>
                    Long Bio / Deskripsi Lengkap
                    <textarea
                      rows={6}
                      value={formData.longBio ?? ''}
                      onChange={(event) => updateField('longBio', event.target.value)}
                    />
                  </label>
                </div>
                <div className="media-upload">
                  <div className="upload-box">
                    <div className="upload-head">
                      <div>
                        <p className="label">Foto Profil</p>
                        <p className="muted">Upload foto utama (maks 3MB).</p>
                      </div>
                      <label className="upload-control">
                        <input type="file" accept="image/*" onChange={(event) => handleMediaUpload('photo', event.target.files?.[0])} />
                        Unggah Foto
                      </label>
                      {formData.photoUrl && (
                        <button type="button" className="btn-link danger" onClick={clearPhoto}>
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <div className="photo-preview">
                      {formData.photoUrl ? <img src={formData.photoUrl} alt={formData.name} /> : <span>Preview foto akan tampil di sini.</span>}
                    </div>
                  </div>
                  <div className="upload-box">
                    <div className="upload-head">
                      <div>
                        <p className="label">Foto Tambahan (opsional)</p>
                        <p className="muted">Poster atau dokumentasi lain.</p>
                      </div>
                      <label className="upload-control">
                        <input type="file" accept="image/*" onChange={(event) => handleMediaUpload('poster', event.target.files?.[0])} />
                        Tambah Foto
                      </label>
                    </div>
                    <div className="media-grid">
                      {formData.media.filter((m) => m.type === 'photo').length === 0 && <p className="muted">Belum ada foto tambahan.</p>}
                      {formData.media
                        .filter((m) => m.type === 'photo')
                        .map((media) => (
                          <div key={media.id} className="media-item">
                            <strong>{media.label}</strong>
                            {media.url ? (
                              <img src={media.url} alt={media.label} className="media-thumb" />
                            ) : (
                              <span className="muted">Preview belum tersedia</span>
                            )}
                            <button type="button" className="btn-link" onClick={() => removeMediaItem(media.id)}>
                              Hapus
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {currentStepId === 'vision' && (
              <section className="wizard-card">
                <header>
                  <p className="pill">Step 3 · Visi & Misi</p>
                  <h2>Visi besar dan misi</h2>
                  <p className="muted">Visi dan misi bisa terdiri dari beberapa poin.</p>
                </header>
                <div className="missions">
                  <div className="missions-header">
                    <div>
                      <h3>Visi Kandidat</h3>
                      <p className="muted">Tambahkan poin visi yang ingin disampaikan kandidat.</p>
                    </div>
                    <div className="missions-actions">
                      <input
                        type="text"
                        placeholder="Contoh: Kampus inklusif dan berdaya"
                        value={visionDraft}
                        onChange={(event) => setVisionDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            addVision()
                          }
                        }}
                      />
                      <button type="button" className="btn-primary" onClick={addVision}>
                        + Tambah Visi
                      </button>
                    </div>
                  </div>
                  <div className="missions-list">
                    {visionItems.length === 0 && <p className="muted">Belum ada visi. Tambahkan minimal 1.</p>}
                    {visionItems.map((vision, index) => (
                      <div key={`${vision}-${index}`} className="mission-card">
                        <div className="drag-handle" aria-hidden>↕</div>
                        <input
                          type="text"
                          value={vision}
                          onChange={(event) => {
                            const next = [...visionItems]
                            next[index] = event.target.value
                            updateVisionItems(next)
                          }}
                        />
                        <div className="mission-actions">
                          <button type="button" className="btn-link" onClick={() => moveVision(index, 'up')}>
                            ↑
                          </button>
                          <button type="button" className="btn-link" onClick={() => moveVision(index, 'down')}>
                            ↓
                          </button>
                          <button type="button" className="btn-link danger" onClick={() => removeVision(index)}>
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="missions">
                  <div className="missions-header">
                    <div>
                      <h3>Misi Kandidat</h3>
                      <p className="muted">Tambahkan poin misi yang singkat dan jelas.</p>
                    </div>
                    <div className="missions-actions">
                      <input
                        type="text"
                        placeholder="Contoh: Meningkatkan fasilitas kampus"
                        value={missionDraft}
                        onChange={(event) => setMissionDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            addMission()
                          }
                        }}
                      />
                      <button type="button" className="btn-primary" onClick={addMission}>
                        + Tambah Misi
                      </button>
                    </div>
                  </div>
                  <div className="missions-list">
                    {formData.missions.length === 0 && <p className="muted">Belum ada misi. Tambahkan minimal 1.</p>}
                    {formData.missions.map((mission, index) => (
                      <div key={`${mission}-${index}`} className="mission-card">
                        <div className="drag-handle" aria-hidden>↕</div>
                        <input
                          type="text"
                          value={mission}
                          onChange={(event) => {
                            const next = [...formData.missions]
                            next[index] = event.target.value
                            updateField('missions', next)
                          }}
                        />
                        <div className="mission-actions">
                          <button type="button" className="btn-link" onClick={() => moveMission(index, 'up')}>
                            ↑
                          </button>
                          <button type="button" className="btn-link" onClick={() => moveMission(index, 'down')}>
                            ↓
                          </button>
                          <button type="button" className="btn-link danger" onClick={() => removeMission(index)}>
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {currentStepId === 'program' && (
              <section className="wizard-card">
                <header>
                  <p className="pill">Step 4 · Program Kerja</p>
                  <h2>Program kerja utama</h2>
                  <p className="muted">Pilih 3–6 program paling mudah dipahami pemilih.</p>
                </header>
                <div className="programs">
                  {formData.programs.map((program, idx) => (
                    <div key={program.id} className="program-item">
                      <div className="program-head">
                        <strong>Program {idx + 1}</strong>
                        <div className="program-actions">
                          <button type="button" className="btn-link" onClick={() => moveProgram(program.id, 'up')}>↑</button>
                          <button type="button" className="btn-link" onClick={() => moveProgram(program.id, 'down')}>↓</button>
                          <button type="button" className="btn-link danger" onClick={() => removeProgram(program.id)}>
                            Hapus
                          </button>
                        </div>
                      </div>
                      <label>
                        Judul Program *
                        <input
                          type="text"
                          value={program.title}
                          onChange={(event) => updateProgram(program.id, { title: event.target.value })}
                        />
                      </label>
                      <label>
                        Kategori (opsional)
                        <input
                          type="text"
                          value={program.category ?? ''}
                          onChange={(event) => updateProgram(program.id, { category: event.target.value })}
                        />
                      </label>
                      <label>
                        Deskripsi Singkat
                        <textarea
                          value={program.description}
                          onChange={(event) => updateProgram(program.id, { description: event.target.value })}
                        />
                      </label>
                    </div>
                  ))}

                  <div className="program-item add-program">
                    <strong>Tambah Program</strong>
                    <label>
                      Judul Program Baru
                      <input
                        type="text"
                        value={programDraft.title}
                        onChange={(event) => setProgramDraft((prev) => ({ ...prev, title: event.target.value }))}
                      />
                    </label>
                    <label>
                      Kategori (opsional)
                      <input
                        type="text"
                        value={programDraft.category ?? ''}
                        onChange={(event) => setProgramDraft((prev) => ({ ...prev, category: event.target.value }))}
                      />
                    </label>
                    <label>
                      Deskripsi Singkat
                      <textarea
                        value={programDraft.description}
                        onChange={(event) => setProgramDraft((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </label>
                    <button type="button" className="btn-outline" onClick={addProgram}>
                      + Tambah Program
                    </button>
                  </div>
                </div>
              </section>
            )}

            {currentStepId === 'review' && (
              <section className="wizard-card">
                <header>
                  <p className="pill">Step 5 · Video & Dokumen</p>
                  <h2>Video, dokumen, dan review akhir</h2>
                  <p className="muted">Lengkapi link video, upload PDF, lalu cek ulang.</p>
                </header>
                <div className="form-grid">
                  <label>
                    Link YouTube Kampanye (opsional)
                    <input
                      type="url"
                      value={formData.campaignVideo ?? ''}
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={(event) => updateField('campaignVideo', event.target.value)}
                    />
                    {helperText('Gunakan link watch, akan otomatis jadi embed.')}
                  </label>
                  <div className="upload-box">
                    <div className="upload-head">
                      <div>
                        <p className="label">Upload PDF Visi & Misi</p>
                        <p className="muted">Opsional tapi disarankan.</p>
                      </div>
                      <label className="upload-control">
                        <input type="file" accept="application/pdf" onChange={(event) => handleMediaUpload('pdf', event.target.files?.[0])} />
                        Unggah PDF
                      </label>
                    </div>
                    <div className="media-grid">
                      {formData.media.filter((m) => m.type === 'pdf').length === 0 && <p className="muted">Belum ada dokumen.</p>}
                      {formData.media
                        .filter((m) => m.type === 'pdf')
                        .map((media) => (
                          <div key={media.id} className="media-item">
                            <strong>{media.label}</strong>
                            {media.url ? (
                              <a href={media.url} target="_blank" rel="noreferrer">
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className="muted">Preview belum tersedia</span>
                            )}
                            <button type="button" className="btn-link" onClick={() => removeMediaItem(media.id)}>
                              Hapus
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {formData.campaignVideo && (
                  <div className="video-preview">
                    <iframe src={formData.campaignVideo.replace('watch?v=', 'embed/')} title="Preview video" loading="lazy" />
                  </div>
                )}

                <div className="review-box">
                  <h3>Checklist sebelum publish</h3>
                  <ul>
                    <li>Nama, nomor urut, dan fakultas sudah benar.</li>
                    <li>Foto profil jelas.</li>
                    <li>Visi dan minimal satu misi terisi.</li>
                    <li>Program kerja utama sudah diprioritaskan.</li>
                  </ul>
                  <label className="check-row">
                    <input type="checkbox" checked={reviewChecked} onChange={(event) => setReviewChecked(event.target.checked)} />
                    Data sudah dicek dan disetujui panitia.
                  </label>
                </div>
              </section>
            )}

            <div className="wizard-nav">
              <div className="left">
                <button className="btn-outline" type="button" onClick={goPrev} disabled={stepIndex === 0}>
                  ◀ Kembali
                </button>
              </div>
              <div className="right">
                <button className="btn-outline" type="button" onClick={() => void handleSubmit('DRAFT')}>
                  Simpan Draft
                </button>
                {stepIndex < steps.length - 1 ? (
                  <button className="btn-primary" type="button" onClick={goNext}>
                    Simpan & Lanjut
                  </button>
                ) : (
                  <button className="btn-primary" type="button" onClick={handlePublish}>
                    Publish Kandidat
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="wizard-aside">
            <div className="wizard-card sticky-preview">
              <div className="aside-head">
                <h3>Ringkasan Kandidat</h3>
                <p className="muted">Preview seperti pemilih lihat.</p>
              </div>
              <CandidatePreviewMini data={formData} />
            </div>
          </aside>
        </div>

        {showPreviewModal && (
          <div className="preview-modal">
            <div className="preview-backdrop" role="button" aria-label="Tutup preview" onClick={() => setShowPreviewModal(false)} />
            <div className="preview-dialog" role="dialog" aria-modal="true">
              <header className="preview-dialog-head">
                <div>
                  <p className="pill">Preview Publik</p>
                  <h2>{formData.name || 'Nama Kandidat'}</h2>
                  <p className="muted">Tampilan seperti dilihat pemilih.</p>
                </div>
                <button className="btn-outline" type="button" onClick={() => setShowPreviewModal(false)}>
                  Tutup
                </button>
              </header>
              <div className="preview-dialog-body">
                <section className="preview-hero">
                  {formData.photoUrl ? <img src={formData.photoUrl} alt={formData.name} className="preview-photo" /> : <div className="mini-photo-placeholder">Foto kandidat</div>}
                  <div>
                    <span className="preview-number">No Urut {formData.number ? formData.number.toString().padStart(2, '0') : '--'}</span>
                    <h2>{formData.name || 'Nama Kandidat'}</h2>
                    {formData.tagline && <p className="tagline">{formData.tagline}</p>}
                    <p>
                      {formData.faculty || 'Fakultas'} – {formData.programStudi || 'Program Studi'}
                    </p>
                    <p>Angkatan {formData.angkatan || '—'}</p>
                    {formData.shortBio && <p>{formData.shortBio}</p>}
                  </div>
                </section>

                <section className="preview-section">
                  <h3>Visi</h3>
                  {visionItems.length > 1 ? (
                    <ul className="vision-list">
                      {visionItems.map((vision, index) => (
                        <li key={`${vision}-${index}`}>{vision}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vision-text">{formData.visionDescription || formData.longBio || 'Deskripsi visi akan muncul di sini.'}</p>
                  )}
                </section>

                <section className="preview-section">
                  <h3>Misi</h3>
                  <ul>
                    {(formData.missions.length ? formData.missions : ['Masukkan misi kandidat']).map((mission, index) => (
                      <li key={`${mission}-${index}`}>{mission}</li>
                    ))}
                  </ul>
                </section>

                <section className="preview-section">
                  <h3>Program Kerja</h3>
                  <div className="program-preview-grid">
                    {(formData.programs.length ? formData.programs : [{ id: 'demo', title: 'Program Utama', description: 'Deskripsi singkat program.' }]).map((program) => (
                      <article key={program.id}>
                        <strong>{program.title}</strong>
                        <p>{program.description || 'Deskripsi program akan tampil di sini.'}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="preview-section">
                  <h3>Media Kampanye</h3>
                  <div className="media-preview-grid">
                    {formData.media.length === 0 && <p>Belum ada media kampanye.</p>}
                    {formData.media.map((media) => (
                      <div key={media.id} className="media-preview">
                        <span>{media.label || media.type.toUpperCase()}</span>
                        {media.url ? (
                          <a href={media.url} target="_blank" rel="noreferrer">
                            Lihat {media.type.toUpperCase()}
                          </a>
                        ) : (
                          <span className="muted">Preview belum tersedia</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {formData.campaignVideo && (
                  <section className="preview-section">
                    <h3>Video Kampanye</h3>
                    <div className="video-preview">
                      <iframe src={formData.campaignVideo.replace('watch?v=', 'embed/')} title="Video kampanye" loading="lazy" />
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCandidateForm
