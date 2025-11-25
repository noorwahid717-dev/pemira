import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih } from '../hooks/useDashboardPemilih'
import '../styles/VoterHelp.css'

type StepItem = {
  icon: string
  title: string
  description: string
}

type FAQItem = {
  question: string
  answer: string
}

const onlineSteps: StepItem[] = [
  { icon: '🔐', title: 'Masuk', description: 'Login dengan akun PEMIRA atau akun kampus.' },
  { icon: '👤', title: 'Pilih Kandidat', description: 'Baca profil, lalu pilih kandidat yang Anda dukung.' },
  { icon: '🛡️', title: 'Konfirmasi Suara', description: 'Pastikan pilihan benar, lalu klik "Rekam Suara".' },
  { icon: '✅', title: 'Selesai', description: 'Suara Anda berhasil direkam secara aman.' },
]

const tpsSteps: StepItem[] = [
  { icon: '📲', title: 'Tunjukkan QR', description: 'Panitia memverifikasi identitas Anda dengan QR.' },
  { icon: '🪪', title: 'Scan Check-In', description: 'Petugas mengkonfirmasi kehadiran Anda di TPS.' },
  { icon: '🗳️', title: 'Ambil Surat Suara', description: 'Menuju bilik suara untuk memilih.' },
  { icon: '✏️', title: 'Coblos & Scan', description: 'Pilih kandidat, petugas scan QR di surat suara.' },
  { icon: '📦', title: 'Masukkan Kotak', description: 'Masukkan surat suara ke kotak, selesai.' },
]

const faqItems: FAQItem[] = [
  {
    question: 'Apa syarat untuk memilih?',
    answer: 'Memiliki akun PEMIRA dan terdaftar sebagai mahasiswa aktif, dosen, atau staf UNIWA.',
  },
  {
    question: 'Apa beda voting online & offline?',
    answer: 'Online lewat HP/laptop kapan saja. Offline datang ke TPS di kampus pada jadwal yang ditentukan. Keduanya sah dan aman.',
  },
  {
    question: 'Bagaimana memastikan suara saya rahasia?',
    answer: 'Pilihan Anda dienkripsi dan tidak dibagikan ke siapapun. Hanya hasil total yang diumumkan tanpa identitas pemilih.',
  },
  {
    question: 'Bisakah saya mengubah pilihan setelah memilih?',
    answer: 'Tidak bisa. Suara yang sudah direkam bersifat final untuk menjaga integritas pemilu.',
  },
  {
    question: 'Bagaimana cara mendapatkan QR Code untuk TPS?',
    answer: 'QR Code otomatis tersedia di dashboard Anda setelah login. Anda bisa download atau screenshot untuk dibawa ke TPS.',
  },
  {
    question: 'Siapa yang bisa saya hubungi jika ada masalah?',
    answer: 'Hubungi panitia KPUM melalui kontak resmi di pengumuman kampus atau menu Kontak di dashboard.',
  },
]

const VoterHelp = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa } = useVotingSession()
  const dashboardData = useDashboardPemilih(session?.accessToken || null)
  const [activeTab, setActiveTab] = useState<'online' | 'tps'>('online')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const handleBack = () => {
    navigate('/dashboard')
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const voterName = dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih'

  return (
    <div className="voter-help-page">
      {/* Header */}
      <header className="help-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBack}>
            <span className="back-icon">←</span>
          </button>
          <h1 className="header-title">Bantuan</h1>
          <div className="header-spacer"></div>
        </div>
        
        <div className="header-welcome">
          <p className="welcome-text">Halo, <strong>{voterName}</strong></p>
          <p className="welcome-subtitle">Panduan lengkap cara memilih</p>
        </div>
      </header>

      {/* Content */}
      <main className="help-content">
        {/* Method Selector */}
        <div className="method-selector">
          <h2 className="selector-title">Pilih Metode Voting</h2>
          <div className="method-tabs">
            <button 
              className={`method-tab ${activeTab === 'online' ? 'active' : ''}`}
              onClick={() => setActiveTab('online')}
            >
              <span className="tab-icon">📱</span>
              <span className="tab-text">Voting Online</span>
            </button>
            <button 
              className={`method-tab ${activeTab === 'tps' ? 'active' : ''}`}
              onClick={() => setActiveTab('tps')}
            >
              <span className="tab-icon">📍</span>
              <span className="tab-text">Voting di TPS</span>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="steps-section">
          <div className="steps-header">
            <h3 className="steps-title">
              {activeTab === 'online' ? '📱 Langkah Voting Online' : '📍 Langkah Voting di TPS'}
            </h3>
            <p className="steps-subtitle">
              {activeTab === 'online' 
                ? 'Memilih langsung dari HP atau laptop Anda'
                : 'Datang ke TPS kampus pada jadwal yang ditentukan'}
            </p>
          </div>

          <div className="steps-list">
            {(activeTab === 'online' ? onlineSteps : tpsSteps).map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-content">
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h3 className="faq-title">❓ Pertanyaan Umum (FAQ)</h3>
            <p className="faq-subtitle">Jawaban untuk pertanyaan yang sering diajukan</p>
          </div>

          <div className="faq-list">
            {faqItems.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                <button 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="question-text">{faq.question}</span>
                  <span className="question-icon">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="actions-title">🚀 Aksi Cepat</h3>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => navigate('/dashboard/kandidat')}
            >
              <span className="action-icon">👥</span>
              <span className="action-text">Lihat Kandidat</span>
            </button>
            <button 
              className="action-card"
              onClick={() => navigate('/dashboard/riwayat')}
            >
              <span className="action-icon">📜</span>
              <span className="action-text">Riwayat Saya</span>
            </button>
            <button 
              className="action-card"
              onClick={handleBack}
            >
              <span className="action-icon">🏠</span>
              <span className="action-text">Ke Dashboard</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="help-footer">
        <nav className="footer-nav">
          <button className="nav-item" onClick={handleBack}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Beranda</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/kandidat')}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Kandidat</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/riwayat')}>
            <span className="nav-icon">📜</span>
            <span className="nav-label">Riwayat</span>
          </button>
          <button className="nav-item active">
            <span className="nav-icon">❓</span>
            <span className="nav-label">Bantuan</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard/profil')}>
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profil</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}

export default VoterHelp
