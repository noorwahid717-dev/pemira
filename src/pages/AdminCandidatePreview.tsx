import { useNavigate, useParams } from 'react-router-dom'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import '../styles/AdminCandidates.css'

const AdminCandidatePreview = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCandidateById } = useCandidateAdminStore()
  const candidate = id ? getCandidateById(id) : undefined

  if (!candidate) {
    return (
      <div className="admin-candidates-page">
        <div className="empty-preview">
          <p>Kandidat tidak ditemukan.</p>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/kandidat')}>
            Kembali ke daftar
          </button>
        </div>
      </div>
    )
  }

  return (
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
        <img src={candidate.photoUrl} alt={candidate.name} className="preview-photo" />
        <div>
          <span className="preview-number">No Urut {candidate.number.toString().padStart(2, '0')}</span>
          <h2>{candidate.name}</h2>
          <p>
            {candidate.faculty} – {candidate.programStudi}
          </p>
          <p>Angkatan {candidate.angkatan}</p>
        </div>
      </section>

      <section className="preview-section">
        <h3>Visi</h3>
        <h4>{candidate.visionTitle}</h4>
        <p>{candidate.visionDescription}</p>
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
  )
}

export default AdminCandidatePreview
