import { useEffect, useState, type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import AdminLayout from '../components/admin/AdminLayout'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { fetchAdminCandidateDetail, generateAdminCandidateQrCode } from '../services/adminCandidates'
import { useActiveElection } from '../hooks/useActiveElection'
import type { CandidateAdmin } from '../types/candidateAdmin'
import { usePopup } from '../components/Popup'
import '../styles/AdminCandidates.css'

const splitVision = (value?: string) =>
  (value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const AdminCandidatePreview = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { getCandidateById } = useCandidateAdminStore()
  const { showPopup } = usePopup()
  const candidateFromStore = id ? getCandidateById(id) : undefined
  const [candidateDetail, setCandidateDetail] = useState<CandidateAdmin | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!id || !token) return
    let cancelled = false
    setDetailLoading(true)
    void (async () => {
      try {
        const detail = await fetchAdminCandidateDetail(token, id)
        if (!cancelled) setCandidateDetail(detail)
      } catch (err) {
        console.warn('Failed to load candidate detail for preview', err)
        if (!cancelled) setCandidateDetail(null)
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, token])

  const candidate = candidateDetail ?? candidateFromStore

  if (!candidate) {
    return (
      <AdminLayout title="Pratinjau Kandidat">
        <div className="admin-candidates-page">
          <div className="empty-preview">
            <p>{detailLoading ? 'Memuat detail kandidat...' : 'Kandidat tidak ditemukan.'}</p>
            <button className="btn-primary" type="button" onClick={() => navigate('/admin/kandidat')}>
              Kembali ke daftar
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Pratinjau Kandidat">
      <div className="admin-candidates-page preview-mode">
        <div className="page-header">
          <div>
            <h1>Preview Kandidat – {candidate.name}</h1>
            <p>Lihat tampilan kandidat seperti mahasiswa.</p>
          </div>
          <button className="btn-link" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/edit`)}>
            ← Kembali ke Edit
          </button>
        </div>

        <section className="preview-hero">
          {candidate.photoUrl ? (
            <img src={candidate.photoUrl} alt={candidate.name} className="preview-photo" />
          ) : (
            <div className="preview-photo placeholder">Foto belum diunggah</div>
          )}
          <div>
            <span className="preview-number">No Urut {candidate.number.toString().padStart(2, '0')}</span>
            <h2>{candidate.name}</h2>
            {candidate.tagline && <p className="tagline">{candidate.tagline}</p>}
            <p>
              {candidate.faculty} – {candidate.programStudi}
            </p>
            <p>Angkatan {candidate.angkatan}</p>
            {candidate.shortBio && <p>{candidate.shortBio}</p>}
          </div>
        </section>

        <section className="preview-section">
          <h3>QR Code Voting</h3>
          {(candidate.qrCode?.payload ?? candidate.qrCode?.token) ? (
            <div className="candidate-qr-cell">
              <QRCodeSVG value={candidate.qrCode.payload ?? candidate.qrCode.token} size={180} level="H" />
              {candidate.qrCode.token && <span className="candidate-qr-token">{candidate.qrCode.token}</span>}
              {candidate.qrCode.url && (
                <a href={candidate.qrCode.url} target="_blank" rel="noreferrer">
                  Buka link QR
                </a>
              )}
            </div>
          ) : (
            <div>
              <p className="candidate-qr-empty">QR code belum tersedia untuk kandidat ini.</p>
              {token && activeElectionId ? (
                <button
                  className="btn-outline"
                  type="button"
                  onClick={async () => {
                    const confirmed = await showPopup({
                      title: 'Generate QR Kandidat',
                      message: 'Buat QR code untuk kandidat ini?',
                      type: 'info',
                      confirmText: 'Generate',
                      cancelText: 'Batal',
                    })
                    if (!confirmed || !candidate) return
                    try {
                      const qr = await generateAdminCandidateQrCode(token, activeElectionId, candidate.id)
                      setCandidateDetail((prev) => ({ ...(prev ?? candidate), qrCode: qr }))
                    } catch (err) {
                      console.warn('Failed to generate candidate QR', err)
                      await showPopup({
                        title: 'Gagal Generate QR',
                        message: (err as { message?: string })?.message ?? 'Gagal generate QR kandidat',
                        type: 'error',
                        confirmText: 'Tutup',
                      })
                    }
                  }}
                >
                  Generate QR
                </button>
              ) : null}
            </div>
          )}
        </section>

        <section className="preview-section">
          <h3>Visi</h3>
          {(() => {
            const visionItems = splitVision(candidate.visionDescription)
            if (visionItems.length > 1) {
              return (
                <ul className="vision-list">
                  {visionItems.map((vision, index) => (
                    <li key={`${vision}-${index}`}>{vision}</li>
                  ))}
                </ul>
              )
            }
            return <p className="vision-text">{candidate.visionDescription || candidate.longBio}</p>
          })()}
        </section>

        <section className="preview-section">
          <h3>Misi</h3>
          <ul>
            {candidate.missions.map((mission, index) => (
              <li key={`${mission}-${index}`}>{mission}</li>
            ))}
          </ul>
        </section>

        <section className="preview-section">
          <h3>Program Kerja</h3>
          <div className="program-preview-grid">
            {candidate.programs.map((program) => (
              <article key={program.id}>
                <strong>{program.title}</strong>
                <p>{program.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-section">
          <h3>Media Kampanye</h3>
          <div className="media-preview-grid">
            {candidate.media.map((media) => (
              <div key={media.id} className={`media-preview ${media.type}`}>
                <span>{media.label}</span>
                <a href={media.url} target="_blank" rel="noreferrer">
                  Lihat {media.type.toUpperCase()}
                </a>
              </div>
            ))}
            {candidate.media.length === 0 && <p>Belum ada media kampanye.</p>}
          </div>
        </section>

        {candidate.campaignVideo && (
          <section className="preview-section">
            <h3>Video Kampanye</h3>
            <div className="video-preview">
              <iframe src={candidate.campaignVideo.replace('watch?v=', 'embed/')} title="Video kampanye" loading="lazy" />
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCandidatePreview
