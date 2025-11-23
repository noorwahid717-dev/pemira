import '../styles/Guide.css'

type StepItem = {
  icon: string
  title: string
  description: string
}

const summaryOptions = [
  {
    icon: '📱',
    title: 'Voting Online',
    description: 'Memilih langsung dari HP atau laptop Anda.',
    action: 'Lihat langkah online',
    href: '#online',
  },
  {
    icon: '📍',
    title: 'Voting di TPS',
    description: 'Datang ke TPS kampus dan scan QR pendaftaran.',
    action: 'Lihat langkah TPS',
    href: '#tps',
  },
]

const onlineSteps: StepItem[] = [
  { icon: '🔐', title: 'Masuk', description: 'Login dengan akun PEMIRA atau akun kampus.' },
  { icon: '👤', title: 'Pilih Kandidat', description: 'Baca profil, lalu pilih kandidat yang Anda dukung.' },
  { icon: '🛡️', title: 'Konfirmasi Suara', description: 'Pastikan pilihan benar, lalu klik “Rekam Suara”.' },
  { icon: '✅', title: 'Selesai', description: 'Suara Anda berhasil direkam.' },
]

const tpsSteps: StepItem[] = [
  { icon: '📲', title: 'Tunjukkan QR Pendaftaran', description: 'Panitia memverifikasi identitas Anda.' },
  { icon: '🪪', title: 'Scan Check-In', description: 'Petugas mengkonfirmasi kehadiran Anda.' },
  { icon: '🗳️', title: 'Ambil Surat Suara', description: 'Menuju bilik suara untuk memilih.' },
  { icon: '✏️', title: 'Coblos & Scan QR Paslon', description: 'Pilih kandidat, petugas memindai QR di surat suara.' },
  { icon: '📦', title: 'Masukkan ke Kotak Suara', description: 'Masukkan surat suara, selesai.' },
]

const faqItems = [
  {
    question: 'Apa syarat memilih?',
    answer: 'Memiliki akun PEMIRA dan terdaftar sebagai mahasiswa aktif, dosen, atau staf UNIWA.',
  },
  {
    question: 'Apa beda memilih online & offline?',
    answer: 'Online lewat HP/laptop, offline dengan datang ke TPS di kampus. Keduanya sah.',
  },
  {
    question: 'Bagaimana memastikan suara saya rahasia?',
    answer: 'Pilihan Anda tidak dibagikan. Hanya hasil total yang diumumkan.',
  },
  {
    question: 'Siapa yang bisa saya hubungi jika ada masalah?',
    answer: 'Hubungi panitia KPUM melalui kontak resmi di pengumuman kampus.',
  },
]

const StepsSection = ({ id, title, subtitle, steps }: { id: string; title: string; subtitle: string; steps: StepItem[] }) => (
  <section className="guide-section" id={id}>
    <div className="guide-heading">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
    <div className="step-grid">
      {steps.map((step) => (
        <div key={step.title} className="guide-card step-card">
          <div className="step-icon">{step.icon}</div>
          <div className="step-content">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const FlowGuide = (): JSX.Element => (
  <section className="guide-layout">
    <div className="guide-container">
      <div className="guide-section" id="ringkasan">
        <div className="guide-heading">
          <h2>Ringkasan Cara Memilih</h2>
          <p>Pilih cara yang paling nyaman: online dari perangkat Anda atau datang ke TPS kampus.</p>
        </div>
        <div className="summary-grid">
          {summaryOptions.map((option, index) => (
            <div key={option.title} className="guide-card summary-card">
              <div className="summary-icon">{option.icon}</div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <a className="summary-action" href={option.href}>
                {option.action}
              </a>
              {index === 0 && <div className="summary-divider">atau</div>}
            </div>
          ))}
        </div>
      </div>

      <StepsSection id="online" title="Cara Voting Online" subtitle="Hanya empat langkah singkat." steps={onlineSteps} />

      <StepsSection id="tps" title="Cara Voting di TPS" subtitle="Datang ke TPS, ikuti alur singkat ini." steps={tpsSteps} />

      <section className="guide-section" id="rekap">
        <div className="guide-heading">
          <h2>Bagaimana Suara Dihitung?</h2>
          <p>Ringkas, jelas, tanpa detail teknis.</p>
        </div>
        <div className="guide-card recap-card">
          <div className="recap-icon">📊</div>
          <div>
            <h3>Penghitungan Suara</h3>
            <p>Suara online dan TPS digabung, dicek oleh panitia dan saksi, lalu hasil resmi diumumkan.</p>
          </div>
        </div>
      </section>

      <section className="guide-section" id="faq-mini">
        <div className="guide-heading">
          <h2>FAQ Singkat</h2>
          <p>Jawaban cepat untuk pertanyaan yang paling sering muncul.</p>
        </div>
        <div className="faq-mini">
          {faqItems.map((item) => (
            <details key={item.question} className="faq-mini-item">
              <summary>
                <span>{item.question}</span>
                <span className="faq-mini-icon">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  </section>
)

export default FlowGuide
