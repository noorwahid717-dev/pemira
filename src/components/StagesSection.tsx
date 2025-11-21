import '../styles/StagesSection.css'

type Step = {
  icon: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: '🔑',
    title: 'Daftar atau Login',
    description: 'Buat akun PEMIRA atau masuk menggunakan akun kampus Anda.',
  },
  {
    icon: '🗺️',
    title: 'Pilih Mode Pemilihan',
    description: 'Anda dapat memilih secara Online atau datang ke TPS (Offline) sesuai kenyamanan.',
  },
  {
    icon: '✅',
    title: 'Pilih Kandidat & Konfirmasi',
    description: 'Baca profil kandidat, pilih calon ketua BEM, lalu konfirmasi pilihan Anda.',
  },
]

const StagesSection = (): JSX.Element => (
  <section className="stages" id="cara-memilih">
    <div className="stages-container">
      <div className="flow-heading">
        <h2 className="section-title">Bagaimana Cara Saya Memilih?</h2>
        <p className="section-subtitle">Ikuti tiga langkah sederhana berikut untuk memberikan suara Anda.</p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.title} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default StagesSection
