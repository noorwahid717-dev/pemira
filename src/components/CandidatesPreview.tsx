import { useEffect, useState } from 'react'
import { fetchPublicCandidates } from '../services/publicCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import '../styles/CandidatesPreview.css'

const CandidatesPreview = (): JSX.Element => {
  const { session } = useVotingSession()
  const [candidates, setCandidates] = useState<{ id: string; nama: string; nomorUrut: number; foto?: string; fakultas?: string; prodi?: string; angkatan?: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    fetchPublicCandidates({ signal: controller.signal, token: session?.accessToken ?? undefined })
      .then((items) => {
        setCandidates(items)
        setError(null)
      })
      .catch(() => {
        setError('Tidak dapat memuat data kandidat saat ini.')
        setCandidates([])
      })
    return () => controller.abort()
  }, [session?.accessToken])

  return (
    <section className="candidates-preview" id="kandidat">
      <div className="candidates-container">
        <h2 className="section-title">Calon Ketua BEM</h2>
        <p className="section-subtitle">Kenali visi, misi, dan profil setiap kandidat sebelum menentukan pilihan Anda.</p>
        {error && <p className="error-text">{error}</p>}

        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-photo">
                {candidate.foto ? <img src={candidate.foto} alt={candidate.nama} /> : <div className="photo-placeholder">{candidate.nomorUrut}</div>}
              </div>
              <h3 className="candidate-name">{candidate.nama}</h3>
              <div className="candidate-number">No. Urut {candidate.nomorUrut}</div>
              <div className="candidate-info">
                {candidate.fakultas} {candidate.prodi && `– ${candidate.prodi}`} {candidate.angkatan ? `(Angkatan ${candidate.angkatan})` : ''}
              </div>
              <button className="btn-outline btn-small" onClick={() => (window.location.href = `/kandidat/detail/${candidate.id}`)}>
                Lihat Profil
              </button>
            </div>
          ))}
        </div>

        <div className="candidates-footer">
          <a href="/kandidat" className="link-view-all">
            Lihat semua kandidat →
          </a>
        </div>
      </div>
    </section>
  )
}

export default CandidatesPreview
