import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih, type PemiraStage } from '../hooks/useDashboardPemilih'
import { LucideIcon, type IconName } from '../components/LucideIcon'
import { QRCodeSVG } from 'qrcode.react'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardFooter from '../components/dashboard/DashboardFooter'
import LoadingScreen from '../components/LoadingScreen'
import '../styles/DashboardPemilihHiFi.css'

type VoterMode = 'ONLINE' | 'OFFLINE'
type VoterStatus = 'NOT_VOTED' | 'VOTED' | 'CHECKED_IN'

interface TimelineStage {
  id: PhaseKey
  label: string
  status: 'completed' | 'active' | 'upcoming'
  icon: IconName
  start?: string | null
  end?: string | null
}

interface VoterData {
  nama: string
  nim: string
  mode: VoterMode
  status: VoterStatus
  qrCode: string
  qrId: string
}

type PhaseKey = 'REGISTRATION' | 'VERIFICATION' | 'CAMPAIGN' | 'QUIET_PERIOD' | 'VOTING' | 'RECAP'

const PHASE_ORDER: PhaseKey[] = ['REGISTRATION', 'VERIFICATION', 'CAMPAIGN', 'QUIET_PERIOD', 'VOTING', 'RECAP']

const PHASE_META: Record<PhaseKey, { label: string; icon: IconName }> = {
  REGISTRATION: { label: 'Pendaftaran', icon: 'fileCheck' },
  VERIFICATION: { label: 'Verifikasi Berkas', icon: 'checkCircle' },
  CAMPAIGN: { label: 'Masa Kampanye', icon: 'megaphone' },
  QUIET_PERIOD: { label: 'Masa Tenang', icon: 'moon' },
  VOTING: { label: 'Voting', icon: 'ballot' },
  RECAP: { label: 'Rekapitulasi', icon: 'barChart' },
}

const normalizePhaseKey = (value?: string | null): PhaseKey | null => {
  if (!value) return null
  const normalized = value.toString().trim().replace(/-/g, '_').toUpperCase()
  if (normalized === 'QUIET') return 'QUIET_PERIOD'
  if (normalized === 'RECAPITULATION') return 'RECAP'
  if ((PHASE_ORDER as string[]).includes(normalized)) return normalized as PhaseKey
  return null
}

const determinePhaseStatus = (start?: string | null, end?: string | null): 'active' | 'upcoming' | 'completed' => {
  const now = Date.now()
  const startMs = start ? new Date(start).getTime() : Number.NaN
  const endMs = end ? new Date(end).getTime() : Number.NaN

  if (!Number.isNaN(startMs) && now < startMs) return 'upcoming'
  if (!Number.isNaN(startMs) && Number.isNaN(endMs) && now >= startMs) return 'active'
  if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && now >= startMs && now <= endMs) return 'active'
  if (!Number.isNaN(endMs) && now > endMs) return 'completed'
  return 'upcoming'
}

const formatStageRange = (start?: string | null, end?: string | null): string | null => {
  const format = (value?: string | null) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    const datePart = parsed.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
    const timePart = parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${datePart}, pukul ${timePart}`
  }
  const startLabel = format(start)
  const endLabel = format(end)
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
  if (startLabel) return startLabel
  if (endLabel) return endLabel
  return null
}

const DashboardPemilihHiFi = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa, clearSession } = useVotingSession()
  const { refresh, ...dashboardData } = useDashboardPemilih(session?.accessToken || null)

  // Force refresh on mount to ensure status is fresh
  useEffect(() => {
    refresh()
  }, [])

  const currentStage = dashboardData.currentStage

  const voterData = useMemo(() => {
    if (!dashboardData) return null
    const status = dashboardData.voterStatus
    const qr = dashboardData.qrData

    const user = dashboardData.user
    const profile = user?.profile

    // Robust role detection similar to VoterProfile.tsx
    const detectRole = () => {
      const rawRole = user?.role?.toUpperCase()
      if (rawRole === 'LECTURER' || rawRole === 'STAFF') return rawRole

      // Fallback checks on profile fields
      if (profile?.department_name || profile?.position?.toLowerCase().includes('dosen')) return 'LECTURER'
      if (profile?.unit_name || profile?.position) return 'STAFF'

      return 'STUDENT'
    }

    const detectedRole = detectRole()

    return {
      nama: dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih',
      nim: dashboardData.user?.username || mahasiswa?.nim || '-',
      mode: (status?.preferred_method === 'TPS' ? 'OFFLINE' : 'ONLINE') as VoterMode,
      status: (status?.has_voted || session?.hasVoted ? 'VOTED' : 'NOT_VOTED') as VoterStatus,
      qrCode: qr?.qr_token || '',
      qrId: qr?.qr_token?.substring(0, 10) || '-',
      role: detectedRole
    }
  }, [dashboardData, mahasiswa, session?.hasVoted])

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
    const lookup = new Map<PhaseKey, { start?: string | null; end?: string | null; label?: string | null }>()
    dashboardData.phases.forEach((phase) => {
      const key = normalizePhaseKey(phase.key ?? phase.phase)
      if (key) {
        lookup.set(key, {
          start: (phase as any)?.start_at ?? (phase as any)?.startAt ?? (phase as any)?.start ?? null,
          end: (phase as any)?.end_at ?? (phase as any)?.endAt ?? (phase as any)?.end ?? null,
          label: phase.label ?? (phase as any)?.name ?? null,
        })
      }
    })

    // If no phases available, fall back to currentStage-based ordering
    if (lookup.size === 0) {
      const stages: PemiraStage[] = ['registration', 'verification', 'campaign', 'silence', 'voting', 'rekapitulasi']
      const currentIndex = stages.indexOf(currentStage)
      return [
        { id: 'REGISTRATION', label: 'Pendaftaran', status: currentIndex > 0 ? 'completed' : currentIndex === 0 ? 'active' : 'upcoming', icon: 'fileCheck' },
        { id: 'VERIFICATION', label: 'Verifikasi Berkas', status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'active' : 'upcoming', icon: 'checkCircle' },
        { id: 'CAMPAIGN', label: 'Masa Kampanye', status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'active' : 'upcoming', icon: 'megaphone' },
        { id: 'QUIET_PERIOD', label: 'Masa Tenang', status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'active' : 'upcoming', icon: 'moon' },
        { id: 'VOTING', label: 'Voting', status: currentIndex > 4 ? 'completed' : currentIndex === 4 ? 'active' : 'upcoming', icon: 'ballot' },
        { id: 'RECAP', label: 'Rekapitulasi', status: currentIndex >= 5 ? 'active' : 'upcoming', icon: 'barChart' },
      ]
    }

    const ordered = PHASE_ORDER.map((key) => {
      const source = lookup.get(key)
      const start = source?.start ?? null
      const end = source?.end ?? null
      return {
        id: key,
        label: source?.label ?? PHASE_META[key].label,
        status: determinePhaseStatus(start, end),
        icon: PHASE_META[key].icon,
        start,
        end,
      }
    })

    // If no active stage detected, sync with backend currentStage to highlight
    const hasActive = ordered.some((item) => item.status === 'active')
    if (!hasActive) {
      const stageToKey: Record<PemiraStage, PhaseKey> = {
        registration: 'REGISTRATION',
        verification: 'VERIFICATION',
        campaign: 'CAMPAIGN',
        silence: 'QUIET_PERIOD',
        voting: 'VOTING',
        rekapitulasi: 'RECAP',
      }
      const activeKey = stageToKey[currentStage]
      const activeIndex = ordered.findIndex((item) => item.id === activeKey)
      if (activeIndex >= 0) {
        ordered.forEach((item, idx) => {
          if (idx < activeIndex) item.status = 'completed'
          else if (idx === activeIndex) item.status = 'active'
          else item.status = 'upcoming'
        })
      }
    }

    return ordered
  }, [currentStage, dashboardData.phases])

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

    // Find the QR code SVG element (check all possible locations)
    const qrElement = document.getElementById('qr-code-voting-panel')
      || document.getElementById('qr-code-mode-panel')
      || document.getElementById('qr-code-registration-panel')

    if (!qrElement) {
      alert('QR Code belum di-render')
      return
    }

    // Create a canvas to convert SVG to image
    const svg = qrElement as unknown as SVGSVGElement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get SVG dimensions
    const bbox = svg.getBBox()
    canvas.width = bbox.width + 40 // Add padding
    canvas.height = bbox.height + 40

    // Create image from SVG
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw QR code
      ctx.drawImage(img, 20, 20)

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `qr-pemilih-${voterData.qrId}.png`
          a.click()
          URL.revokeObjectURL(downloadUrl)
        }
      }, 'image/png')

      URL.revokeObjectURL(url)
    }
    img.src = url
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
            <LucideIcon name="megaphone" className="panel-icon" size={64} />
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
              <LucideIcon name="checkCircle" className="panel-icon success" size={64} />
              <h2>Anda sudah memberikan suara</h2>
              <p>Terima kasih atas partisipasi Anda dalam PEMIRA UNIWA!</p>
            </div>
          )
        }

        if (voterData.mode === 'ONLINE') {
          return (
            <div className="main-panel voting-panel online">
              <LucideIcon name="ballot" className="panel-icon" size={64} />
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
              <LucideIcon name="ballot" className="panel-icon" size={64} />
              <h2>Tahap Voting telah dibuka!</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH OFFLINE (TPS)</strong>.</p>
              <p>Silakan datang ke TPS terdekat sesuai jadwal.</p>

              <div className="qr-display">
                <p className="qr-label">Tunjukkan QR pendaftaran berikut:</p>
                <div className="qr-code-box">
                  <div className="qr-placeholder">
                    {voterData.qrCode ? (
                      <QRCodeSVG
                        value={voterData.qrCode}
                        size={256}
                        level="H"
                        includeMargin={true}
                        id="qr-code-voting-panel"
                      />
                    ) : (
                      <div style={{ padding: '20px', background: '#f0f0f0', color: '#999' }}>
                        [QR CODE TIDAK TERSEDIA]
                      </div>
                    )}
                  </div>
                  <div className="qr-id">ID: {voterData.qrId}</div>
                </div>
              </div>

              <div className="qr-actions">
                <button className="btn-secondary" onClick={handleDownloadQR}>
                  <LucideIcon name="download" className="btn-icon" size={20} /> Unduh QR
                </button>
                <button className="btn-secondary" onClick={handlePrintQR}>
                  <LucideIcon name="printer" className="btn-icon" size={20} /> Cetak QR
                </button>
              </div>
            </div>
          )
        }

      case 'silence':
        return (
          <div className="main-panel silence-panel">
            <LucideIcon name="moon" className="panel-icon" size={64} />
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
        // For registration phase, show QR for TPS voters
        if (currentStage === 'registration' && voterData.mode === 'OFFLINE' && voterData.qrCode) {
          return (
            <div className="main-panel voting-panel offline">
              <LucideIcon name="fileCheck" className="panel-icon" size={64} />
              <h2>Anda Terdaftar sebagai Pemilih TPS</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH OFFLINE (TPS)</strong>.</p>
              <p>QR Code Anda sudah siap! Simpan QR code ini untuk digunakan saat voting nanti.</p>

              <div className="qr-display">
                <p className="qr-label">QR Code Pendaftaran Anda:</p>
                <div className="qr-code-box">
                  <div className="qr-placeholder">
                    <QRCodeSVG
                      value={voterData.qrCode}
                      size={256}
                      level="H"
                      includeMargin={true}
                      id="qr-code-registration-panel"
                    />
                  </div>
                  <div className="qr-id">ID: {voterData.qrId}</div>
                </div>
              </div>

              <div className="qr-actions">
                <button className="btn-secondary" onClick={handleDownloadQR}>
                  <LucideIcon name="download" className="btn-icon" size={20} /> Unduh QR
                </button>
                <button className="btn-secondary" onClick={handlePrintQR}>
                  <LucideIcon name="printer" className="btn-icon" size={20} /> Cetak QR
                </button>
              </div>

              <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                💡 Tip: Simpan atau cetak QR code ini sekarang. Anda akan membutuhkannya saat datang ke TPS untuk voting.
              </p>
            </div>
          )
        }

        return (
          <div className="main-panel default-panel">
            <LucideIcon name="info" className="panel-icon" size={64} />
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
            <LucideIcon name="laptop" className="mode-icon" size={32} />
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
            <LucideIcon name="building" className="mode-icon" size={32} />
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
                  <QRCodeSVG
                    value={voterData.qrCode}
                    size={180}
                    level="H"
                    includeMargin={true}
                    id="qr-code-mode-panel"
                  />
                ) : (
                  <div style={{ padding: '10px', background: '#f0f0f0', color: '#999' }}>
                    [QR CODE TIDAK TERSEDIA]
                  </div>
                )}
              </div>
              <div className="qr-info">
                <span className="qr-id-label">ID:</span>
                <span className="qr-id-value">{voterData.qrId}</span>
              </div>
            </div>

            <div className="qr-action-buttons">
              <button className="btn-qr-action" onClick={handleDownloadQR}>
                <LucideIcon name="download" className="btn-icon" size={20} /> Unduh QR
              </button>
              <button className="btn-qr-action" onClick={handlePrintQR}>
                <LucideIcon name="printer" className="btn-icon" size={20} /> Cetak QR
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="dashboard-pemilih-page">
        <LoadingScreen fullScreen message="Memuat data..." />
      </div>
    )
  }

  if (dashboardData.error) {
    // Check if error is token-related
    const isTokenError = dashboardData.error && (
      dashboardData.error.toLowerCase().includes('token') ||
      dashboardData.error.toLowerCase().includes('unauthorized') ||
      dashboardData.error.toLowerCase().includes('401')
    )

    return (
      <div className="dashboard-pemilih-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ Error: {dashboardData.error}</p>
          {isTokenError && (
            <p style={{ color: '#dc3545', marginBottom: '20px' }}>
              Sesi Anda telah berakhir. Silakan login kembali.
            </p>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {!isTokenError && (
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Muat Ulang
              </button>
            )}
            <button
              onClick={() => {
                clearSession()
                navigate('/login', { replace: true })
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: isTokenError ? '#dc3545' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isTokenError ? 'Login Ulang' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-pemilih-page">
      {/* Header */}
      <DashboardHeader voterData={voterData} />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Main Panel */}
          <section className="panel-section">
            {renderMainPanel()}
          </section>

          {/* Mode Panel */}
          {renderModePanel()}

          {/* Notifications */}
          <section className="notifications-section">
            <h2 className="section-title">
              <LucideIcon name="bell" className="section-icon" size={24} />
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

          {/* Timeline Section */}
          <section className="timeline-section">
            <h2 className="section-title">
              <LucideIcon name="mapPin" className="section-icon" size={24} />
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
                    <LucideIcon name={stage.icon} className="stage-icon" size={28} />
                    <div className="stage-info">
                      <h3 className="stage-label">{stage.label}</h3>
                      <span className="stage-status-text">
                        {stage.status === 'completed' && 'Selesai ✓'}
                        {stage.status === 'active' && 'Sedang berlangsung'}
                        {stage.status === 'upcoming' && 'Belum dibuka'}
                      </span>
                      {formatStageRange(stage.start, stage.end) && (
                        <span className="stage-dates">{formatStageRange(stage.start, stage.end)}</span>
                      )}
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
        </div>
      </main>

      {/* Footer Navigation */}
      <DashboardFooter />
    </div>
  )
}

export default DashboardPemilihHiFi
