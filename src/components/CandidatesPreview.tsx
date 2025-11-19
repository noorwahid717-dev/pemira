import { mockCandidates } from '../data/mockCandidates'
import '../styles/CandidatesPreview.css'

const CandidatesPreview = (): JSX.Element => (
  <section className="candidates-preview" id="kandidat">
    <div className="candidates-container">
      <h2 className="section-title">Calon Ketua BEM 2024</h2>

      <div className="candidates-grid">
        {mockCandidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <div className="candidate-photo">
              <div className="photo-placeholder">{candidate.nomorUrut}</div>
            </div>
            <h3 className="candidate-name">{candidate.nama}</h3>
            <div className="candidate-number">No. Urut {candidate.nomorUrut}</div>
            <div className="candidate-info">
              {candidate.fakultas} – {candidate.angkatan}
            </div>
            <button className="btn-outline btn-small">Lihat Profil</button>
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

export default CandidatesPreview
