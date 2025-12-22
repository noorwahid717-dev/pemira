import { useEffect, useMemo, useState, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import AdminLayout from '../components/admin/AdminLayout'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'
import { usePopup } from '../components/Popup'
import { fetchCandidateQrCodeMap, type CandidateQrCode } from '../services/candidateQr'
import { generateAdminCandidateQrCode } from '../services/adminCandidates'
import type { CandidateStatus } from '../types/candidateAdmin'
import '../styles/AdminCandidates.css'

const statusOptions: { value: CandidateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Menunggu Review' },
  { value: 'PUBLISHED', label: 'Terpublikasi' },
  { value: 'APPROVED', label: 'Terpublikasi (Legacy)' },
  { value: 'HIDDEN', label: 'Disembunyikan' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'WITHDRAWN', label: 'Ditarik' },
  { value: 'ARCHIVED', label: 'Arsip' },
]

const AdminCandidatesList = (): JSX.Element => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { candidates, archiveCandidate, deleteCandidate, refresh, loading, error } = useCandidateAdminStore()
  const { showPopup } = usePopup()
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all')
  const [qrCodes, setQrCodes] = useState<Record<string, CandidateQrCode>>({})
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | undefined>(undefined)
  const [qrGeneratingId, setQrGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeElectionId) return
    const controller = new AbortController()
    setQrLoading(true)
    setQrError(undefined)
    void (async () => {
      try {
        const map = await fetchCandidateQrCodeMap(activeElectionId, { signal: controller.signal })
        setQrCodes(map)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return
        console.warn('Failed to load candidate QR codes', err)
        setQrError((err as { message?: string })?.message ?? 'Gagal memuat QR kandidat')
        setQrCodes({})
      } finally {
        setQrLoading(false)
      }
    })()

    return () => controller.abort()
  }, [activeElectionId])

  const facultyOptions = useMemo(() => {
    const faculties = Array.from(new Set(candidates.map((candidate) => candidate.faculty)))
    return ['all', ...faculties]
  }, [candidates])

  const handleReload = async () => {
    setQrLoading(true)
    setQrError(undefined)
    try {
      if (!activeElectionId) {
        await refresh()
        setQrCodes({})
        return
      }
      const [, map] = await Promise.all([refresh(), fetchCandidateQrCodeMap(activeElectionId)])
      setQrCodes(map)
    } catch (err) {
      console.warn('Failed to refresh candidates or QR codes', err)
      setQrError((err as { message?: string })?.message ?? 'Gagal memuat QR kandidat')
    } finally {
      setQrLoading(false)
    }
  }

  const handleGenerateQr = async (candidateId: string, candidateName: string) => {
    if (!token) {
      setQrError('Token admin diperlukan untuk generate QR.')
      return
    }
    if (!activeElectionId) {
      setQrError('Election ID tidak tersedia.')
      return
    }
    const confirmed = await showPopup({
      title: 'Generate QR Kandidat',
      message: `Buat QR code untuk kandidat "${candidateName}"?`,
      type: 'info',
      confirmText: 'Generate',
      cancelText: 'Batal',
    })
    if (!confirmed) return
    try {
      setQrGeneratingId(candidateId)
      const qr = await generateAdminCandidateQrCode(token, activeElectionId, candidateId)
      setQrCodes((prev) => ({ ...prev, [candidateId]: qr }))
    } catch (err) {
      console.warn('Failed to generate candidate QR', err)
      setQrError((err as { message?: string })?.message ?? 'Gagal generate QR kandidat')
    } finally {
      setQrGeneratingId(null)
    }
  }

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase())
      const matchesFaculty = facultyFilter === 'all' || candidate.faculty === facultyFilter
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      return matchesSearch && matchesFaculty && matchesStatus
    })
  }, [candidates, facultyFilter, search, statusFilter])

  const handleArchive = async (id: string) => {
    const confirmed = await showPopup({
      title: 'Arsipkan Kandidat',
      message: 'Arsipkan kandidat ini?',
      type: 'warning',
      confirmText: 'Arsipkan',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    archiveCandidate(id)
  }

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showPopup({
      title: 'Hapus Kandidat',
      message: `Hapus kandidat "${name}"? (Soft delete)\n\nKandidat tidak akan muncul di daftar publik maupun admin list.`,
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    try {
      await deleteCandidate(id)
    } catch (err) {
      console.error('Failed to delete candidate', err)
      await showPopup({
        title: 'Gagal Menghapus',
        message: (err as { message?: string })?.message ?? 'Gagal menghapus kandidat',
        type: 'error',
        confirmText: 'Tutup',
      })
    }
  }

  return (
    <AdminLayout title="Manajemen Kandidat">
      <div className="admin-candidates-page">
        <div className="page-header">
          <div>
            <h1>Manajemen Kandidat</h1>
            <p>Kelola seluruh calon ketua BEM, termasuk foto, profil, visi-misi, dan program kerja.</p>
          </div>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/kandidat/tambah')}>
            + Tambah Kandidat
          </button>
        </div>

        <div className="filters">
          <div className="status-row">
            {loading && <span>Memuat kandidat...</span>}
            {error && <span className="error-text">{error}</span>}
            {qrLoading && <span>Memuat QR...</span>}
            {qrError && <span className="error-text">{qrError}</span>}
            <button className="btn-outline" type="button" onClick={() => void handleReload()}>
              Muat ulang
            </button>
          </div>
          <input
            type="search"
            placeholder="Cari nama kandidat"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
            {facultyOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Fakultas' : option}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CandidateStatus | 'all')}>
            {statusOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>No</th>
                <th>Nama</th>
                <th>Fakultas</th>
                <th>Status</th>
                <th>QR</th>
                <th>Konten</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Belum ada kandidat yang cocok.
                  </td>
                </tr>
              )}
              {filteredCandidates.map((candidate) => {
                const contentCount = candidate.missions.length + candidate.programs.length + (candidate.visionDescription ? 1 : 0)
                const qr = candidate.qrCode ?? qrCodes[candidate.id] ?? null
                const qrValue = qr?.payload ?? qr?.token ?? ''
                const canGenerateQr =
                  Boolean(token && activeElectionId) &&
                  !qrValue &&
                  (candidate.status === 'PUBLISHED' || candidate.status === 'APPROVED')
                return (
                  <tr key={candidate.id}>
                    <td>
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.name} className="candidate-thumb" />
                      ) : (
                        <div className="candidate-thumb placeholder">?</div>
                      )}
                    </td>
                    <td>{candidate.number.toString().padStart(2, '0')}</td>
                    <td>
                      <div className="candidate-name">
                        <strong>{candidate.name}</strong>
                        <span>{candidate.programStudi}</span>
                      </div>
                    </td>
                    <td>{candidate.faculty}</td>
                    <td>
                      <span className={`status-chip ${candidate.status}`}>
                        {candidate.status === 'DRAFT'
                          ? 'Draft'
                          : candidate.status === 'PENDING'
                            ? 'Menunggu Review'
                          : candidate.status === 'PUBLISHED'
                              ? 'Terpublikasi'
                              : candidate.status === 'APPROVED'
                                ? 'Terpublikasi'
                                : candidate.status === 'HIDDEN'
                                  ? 'Disembunyikan'
                                  : candidate.status === 'REJECTED'
                                    ? 'Ditolak'
                                    : candidate.status === 'WITHDRAWN'
                                      ? 'Ditarik'
                                      : 'Arsip'}
                      </span>
                    </td>
                    <td>
                      {qrValue ? (
                        <div className="candidate-qr-cell">
                          <QRCodeSVG value={qrValue} size={76} level="H" />
                          {qr?.token && <span className="candidate-qr-token">{qr.token}</span>}
                        </div>
                      ) : canGenerateQr ? (
                        <button
                          className="btn-table"
                          type="button"
                          disabled={qrGeneratingId === candidate.id}
                          onClick={() => void handleGenerateQr(candidate.id, candidate.name)}
                        >
                          {qrGeneratingId === candidate.id ? 'Generating…' : 'Generate QR'}
                        </button>
                      ) : (
                        <span className="candidate-qr-empty">—</span>
                      )}
                    </td>
                    <td>{contentCount} item</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/edit`)}>
                          Edit
                        </button>
                        <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/preview`)}>
                          Preview
                        </button>
                        <button className="btn-table danger" type="button" onClick={() => handleArchive(candidate.id)}>
                          Arsipkan
                        </button>
                        <button className="btn-table danger" type="button" onClick={() => void handleDelete(candidate.id, candidate.name)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminCandidatesList
