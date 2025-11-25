import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih, type PemiraStage } from '../hooks/useDashboardPemilih'
import '../styles/DashboardPemilihHiFi.css'

type VoterMode = 'ONLINE' | 'OFFLINE'
type VoterStatus = 'NOT_VOTED' | 'VOTED' | 'CHECKED_IN'

interface TimelineStage {
  id: PemiraStage
  label: string
  status: 'completed' | 'active' | 'upcoming'
  icon: string
}

interface VoterData {
  nama: string
  nim: string
  mode: VoterMode
  status: VoterStatus
  qrCode: string
  qrId: string
}

const DashboardPemilihHiFi = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa } = useVotingSession()
  const dashboardData = useDashboardPemilih(session?.accessToken || null)

  const currentStage = dashboardData.currentStage

  const voterData: VoterData = useMemo(() => {
    const status = dashboardData.voterStatus
    const qr = dashboardData.qrData
    
    return {
      nama: dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih',
      nim: dashboardData.user?.username || mahasiswa?.nim || '-',
      mode: status?.preferred_method === 'TPS' ? 'OFFLINE' : 'ONLINE',
      status: status?.has_voted ? 'VOTED' : 'NOT_VOTED',
      qrCode: qr?.qr_token || '',
      qrId: qr?.qr_token?.substring(0, 10) || '-',
    }
  }, [dashboardData, mahasiswa])

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  })

  useEffect(() => {
    if (!dashboardData.election?.voting_start_at) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const votingStart = new Date(dashboardData.election!.voting_start_at!).getTime()
      const distance = votingStart - now

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 })
        return
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [dashboardData.election])

  const timelineStages: TimelineStage[] = useMemo(() => {
    const stages: PemiraStage[] = ['registration', 'verification', 'campaign', 'silence', 'voting', 'rekapitulasi']
    const currentIndex = stages.indexOf(currentStage)
    
    return [
      { id: 'registration', label: 'Pendaftaran', status: currentIndex > 0 ? 'completed' : currentIndex === 0 ? 'active' : 'upcoming', icon: '📝' },
      { id: 'verification', label: 'Verifikasi Berkas', status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'active' : 'upcoming', icon: '✓' },
      { id: 'campaign', label: 'Masa Kampanye', status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'active' : 'upcoming', icon: '📣' },
      { id: 'silence', label: 'Masa Tenang', status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'active' : 'upcoming', icon: '🤫' },
      { id: 'voting', label: 'Voting', status: currentIndex > 4 ? 'completed' : currentIndex === 4 ? 'active' : 'upcoming', icon: '🗳️' },
      { id: 'rekapitulasi', label: 'Rekapitulasi', status: currentIndex >= 5 ? 'active' : 'upcoming', icon: '📊' }
    ]
  }, [currentStage])

  const notifications = useMemo(() => {
    const notifs = []
    
    if (dashboardData.voterStatus?.eligible) {
      notifs.push({ time: 'Hari ini', message: 'Anda terdaftar sebagai pemilih yang sah.' })
    }
    
    if (currentStage === 'campaign') {
      notifs.push({ time: 'Hari ini', message: 'Masa kampanye sedang berlangsung.' })
    }
    
    if (currentStage === 'silence') {
      notifs.push({ time: 'Hari ini', message: 'Masa tenang telah dimulai.' })
    }
    
    if (currentStage === 'voting' && !voterData.status) {
      notifs.push({ time: 'Sekarang', message: 'Voting telah dibuka! Silakan berikan suara Anda.' })
    }
    
    if (voterData.status === 'VOTED') {
      notifs.push({ time: 'Selesai', message: 'Terima kasih telah memberikan suara.' })
    }
    
    return notifs.length > 0 ? notifs : [
      { time: '-', message: 'Tidak ada notifikasi baru.' }
    ]
  }, [dashboardData, currentStage, voterData])

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  const handleStartVoting = () => {
    if (voterData.mode === 'ONLINE') {
      navigate('/voting')
    } else {
      // For offline, just show QR
      alert('Silakan datang ke TPS dan tunjukkan QR code Anda')
    }
  }

  const handleViewCandidates = () => {
    navigate('/dashboard/kandidat')
  }

  const handleDownloadQR = () => {
    if (!voterData.qrCode) {
      alert('QR Code tidak tersedia')
      return
    }
    
    // Create a simple text file with QR token for now
    // In production, you should generate actual QR code image
    const qrText = `PEMIRA UNIWA - QR Code Pemilih\n\nID: ${voterData.qrId}\nToken: ${voterData.qrCode}\n\nTunjukkan kode ini di TPS`
    const blob = new Blob([qrText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-pemilih-${voterData.qrId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintQR = () => {
    if (!voterData.qrCode) {
      alert('QR Code tidak tersedia')
      return
    }
    window.print()
  }

  const renderMainPanel = () => {
    switch (currentStage) {
      case 'campaign':
        return (
          <div className="main-panel campaign-panel">
            <div className="panel-icon">📣</div>
            <h2>Saat ini adalah: MASA KAMPANYE</h2>
            <p>
              Anda dapat melihat profil lengkap seluruh pasangan calon.
              Gunakan waktu ini untuk mempelajari visi, misi, dan program kerja masing-masing paslon.
            </p>
            <button className="btn-primary-large" onClick={handleViewCandidates}>
              Lihat Daftar Paslon
            </button>
          </div>
        )

      case 'voting':
        if (voterData.status === 'VOTED') {
          return (
            <div className="main-panel success-panel">
              <div className="panel-icon success">✓</div>
              <h2>Anda sudah memberikan suara</h2>
              <p>Terima kasih atas partisipasi Anda dalam PEMIRA UNIWA!</p>
            </div>
          )
        }

        if (voterData.mode === 'ONLINE') {
          return (
            <div className="main-panel voting-panel online">
              <div className="panel-icon">🗳️</div>
              <h2>Tahap Voting telah dibuka!</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH ONLINE</strong>.</p>
              <p>Silakan memberikan suara melalui platform ini.</p>
              
              <div className="status-badge not-voted">
                Status: <strong>BELUM MEMILIH</strong>
              </div>

              <button className="btn-voting-start" onClick={handleStartVoting}>
                MULAI MEMILIH
              </button>
            </div>
          )
        } else {
          return (
            <div className="main-panel voting-panel offline">
              <div className="panel-icon">🗳️</div>
              <h2>Tahap Voting telah dibuka!</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH OFFLINE (TPS)</strong>.</p>
              <p>Silakan datang ke TPS terdekat sesuai jadwal.</p>
              
              <div className="qr-display">
                <p className="qr-label">Tunjukkan QR pendaftaran berikut:</p>
                <div className="qr-code-box">
                  <div className="qr-placeholder">
                    {voterData.qrCode ? (
                      <div style={{ padding: '20px', background: 'white', fontSize: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {voterData.qrCode}
                      </div>
                    ) : '[QR CODE]'}
                  </div>
                  <div className="qr-id">ID: {voterData.qrId}</div>
                </div>
              </div>

              <div className="qr-actions">
                <button className="btn-secondary" onClick={handleDownloadQR}>
                  <span className="btn-icon">📥</span> Unduh QR
                </button>
                <button className="btn-secondary" onClick={handlePrintQR}>
                  <span className="btn-icon">🖨️</span> Cetak QR
                </button>
              </div>
            </div>
          )
        }

      case 'silence':
        return (
          <div className="main-panel silence-panel">
            <div className="panel-icon">🤫</div>
            <h2>Masa Tenang</h2>
            <p>Masa tenang sedang berlangsung. Tidak ada kampanye yang diperbolehkan.</p>
            <div className="countdown-box">
              <p>Voting dibuka dalam:</p>
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Hari</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Jam</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Menit</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="main-panel default-panel">
            <div className="panel-icon">ℹ️</div>
            <h2>Dashboard PEMIRA UNIWA</h2>
            <p>Selamat datang di sistem pemilihan raya UNIWA.</p>
          </div>
        )
    }
  }

  const renderModePanel = () => {
    if (currentStage !== 'voting' || voterData.status === 'VOTED') return null

    if (voterData.mode === 'ONLINE') {
      return (
        <div className="mode-panel online-mode">
          <div className="mode-header">
            <span className="mode-icon">💻</span>
            <h3>Alur Pemilihan Online</h3>
          </div>
          
          <ol className="mode-steps">
            <li>Buka halaman kandidat ketika masa voting dibuka.</li>
            <li>Pilih salah satu pasangan calon.</li>
            <li>Konfirmasi pilihan.</li>
            <li>Selesai! Anda tidak dapat mengubah suara setelah submit.</li>
          </ol>

          <div className="mode-status">
            <span className="status-label">Status Anda:</span>
            <span className={`status-value ${voterData.status === 'NOT_VOTED' ? 'not-voted' : 'voted'}`}>
              {voterData.status === 'NOT_VOTED' ? 'BELUM MEMILIH' : 'SUDAH MEMILIH'}
            </span>
          </div>

          <button 
            className="btn-mode-action" 
            onClick={handleViewCandidates}
            disabled={currentStage !== 'voting'}
          >
            LIHAT KANDIDAT
          </button>
        </div>
      )
    } else {
      return (
        <div className="mode-panel offline-mode">
          <div className="mode-header">
            <span className="mode-icon">🏛️</span>
            <h3>Alur Pemilihan Offline (TPS)</h3>
          </div>
          
          <ol className="mode-steps">
            <li>Datang ke TPS sesuai jadwal.</li>
            <li>Tunjukkan QR pendaftaran Anda.</li>
            <li>Ambil surat suara dari panitia.</li>
            <li>Masuk bilik suara dan coblos pilihan Anda.</li>
            <li>Scan QR paslon melalui perangkat Anda sendiri.</li>
            <li>Masukkan surat suara ke kotak.</li>
          </ol>

          <div className="qr-section">
            <p className="qr-section-label">QR Pendaftaran Anda:</p>
            <div className="qr-code-display">
              <div className="qr-placeholder-small">
                {voterData.qrCode ? (
                  <div style={{ padding: '10px', background: 'white', fontSize: '8px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {voterData.qrCode}
                  </div>
                ) : '[QR CODE]'}
              </div>
              <div className="qr-info">
                <span className="qr-id-label">ID:</span>
                <span className="qr-id-value">{voterData.qrId}</span>
              </div>
            </div>
            
            <div className="qr-action-buttons">
              <button className="btn-qr-action" onClick={handleDownloadQR}>
                <span className="btn-icon">📥</span> Unduh QR
              </button>
              <button className="btn-qr-action" onClick={handlePrintQR}>
                <span className="btn-icon">🖨️</span> Cetak QR
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="dashboard-pemilih-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Memuat data...</div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-pemilih-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>
          <p>Error: {dashboardData.error}</p>
          <button onClick={() => window.location.reload()}>Muat Ulang</button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-pemilih-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-pemira">
              <span className="logo-icon">🗳️</span>
              <span className="logo-text">PEMIRA UNIWA</span>
            </div>
          </div>
          
          <div className="header-right">
            <button className="profile-button">
              <span className="profile-icon">👤</span>
            </button>
          </div>
        </div>

        <div className="user-info">
          <h1 className="user-greeting" style={{ color: '#FFFFFF' }}>Halo, {voterData.nama}!</h1>
          <p className="user-details" style={{ color: '#FFFFFF' }}>
            <span className="user-nim" style={{ color: '#FFFFFF' }}>NIM {voterData.nim}</span>
            <span className="user-mode-badge" data-mode={voterData.mode.toLowerCase()} style={{ color: '#FFFFFF' }}>
              Mode: {voterData.mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE (TPS)'}
            </span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Timeline Section */}
          <section className="timeline-section">
            <h2 className="section-title">
              <span className="section-icon">📍</span>
              Status PEMIRA
            </h2>
            
            <div className="timeline-container">
              {timelineStages.map((stage, index) => (
                <div 
                  key={stage.id}
                  className={`timeline-stage ${stage.status}`}
                  style={{ '--stage-index': index } as React.CSSProperties}
                >
                  <div className="stage-indicator">
                    <div className="stage-dot" />
                    {index < timelineStages.length - 1 && (
                      <div className="stage-line" />
                    )}
                  </div>
                  
                  <div className="stage-content">
                    <div className="stage-icon">{stage.icon}</div>
                    <div className="stage-info">
                      <h3 className="stage-label">{stage.label}</h3>
                      <span className="stage-status-text">
                        {stage.status === 'completed' && 'Selesai ✓'}
                        {stage.status === 'active' && 'Sedang berlangsung'}
                        {stage.status === 'upcoming' && 'Belum dibuka'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="current-stage-info">
              <span className="current-stage-label">Tahap saat ini:</span>
              <span className="current-stage-value">
                {timelineStages.find(s => s.status === 'active')?.label.toUpperCase()}
              </span>
            </div>
          </section>

          {/* Main Panel */}
          <section className="panel-section">
            {renderMainPanel()}
          </section>

          {/* Mode Panel */}
          {renderModePanel()}

          {/* Notifications */}
          <section className="notifications-section">
            <h2 className="section-title">
              <span className="section-icon">🔔</span>
              Notifikasi
            </h2>
            
            <div className="notifications-list">
              {notifications.map((notif, index) => (
                <div key={index} className="notification-item" style={{ '--notif-index': index } as React.CSSProperties}>
                  <span className="notification-time">[{notif.time}]</span>
                  <span className="notification-message">{notif.message}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="dashboard-footer">
        <nav className="footer-nav">
          <button className="nav-item active">
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
          <button className="nav-item" onClick={() => navigate('/dashboard/bantuan')}>
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

export default DashboardPemilihHiFi
