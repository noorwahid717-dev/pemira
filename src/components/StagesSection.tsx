import '../styles/StagesSection.css'

type Stage = {
  number: string
  title: string
  description: string
}

const stages: Stage[] = [
  {
    number: '1',
    title: 'Pendaftaran Calon',
    description: 'Calon ketua mendaftar dan diverifikasi',
  },
  {
    number: '2',
    title: 'Masa Kampanye',
    description: 'Profil kandidat dipublikasikan',
  },
  {
    number: '3',
    title: 'Pemungutan Suara',
    description: 'Mahasiswa memilih online atau di TPS',
  },
  {
    number: '4',
    title: 'Pengumuman Hasil',
    description: 'Hasil resmi diumumkan panitia',
  },
]

const StagesSection = (): JSX.Element => (
  <section className="stages">
    <div className="stages-container">
      <h2 className="section-title">Tahapan Pemilihan</h2>

      <div className="stages-grid">
        {stages.map((stage) => (
          <div key={stage.number} className="stage-card">
            <div className="stage-number">{stage.number}</div>
            <h3 className="stage-title">{stage.title}</h3>
            <p className="stage-description">{stage.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default StagesSection
