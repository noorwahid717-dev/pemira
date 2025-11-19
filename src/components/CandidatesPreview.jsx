import '../styles/CandidatesPreview.css';

export default function CandidatesPreview() {
  const candidates = [
    {
      id: 1,
      name: "Ahmad Fauzi",
      number: 1,
      faculty: "Fakultas Teknik",
      year: "2021"
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      number: 2,
      faculty: "Fakultas Ekonomi",
      year: "2021"
    },
    {
      id: 3,
      name: "Budi Santoso",
      number: 3,
      faculty: "Fakultas Hukum",
      year: "2020"
    }
  ];

  return (
    <section className="candidates-preview" id="kandidat">
      <div className="candidates-container">
        <h2 className="section-title">Calon Ketua BEM 2024</h2>
        
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-photo">
                <div className="photo-placeholder">{candidate.number}</div>
              </div>
              <h3 className="candidate-name">{candidate.name}</h3>
              <div className="candidate-number">No. Urut {candidate.number}</div>
              <div className="candidate-info">
                {candidate.faculty} – {candidate.year}
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
  );
}
