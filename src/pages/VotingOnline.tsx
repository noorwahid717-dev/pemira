import { useState, useEffect, useRef, useMemo } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Link, Navigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { useDashboardPemilih } from '../hooks/useDashboardPemilih'
import { apiRequest } from '../utils/apiClient'
import { useToast } from '../components/Toast'
import { getActiveElectionId } from '../state/activeElection'
import type { Candidate, VotingReceipt } from '../types/voting'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardFooter from '../components/dashboard/DashboardFooter'
import { fetchPublicCandidates } from '../services/publicCandidates'
import '../styles/VotingOnline.css'
import '../styles/DashboardPemilihHiFi.css' // Import Dashboard styles for layout

type VotingStep = 1 | 2 | 3 | 4

const formatToken = (): string => {
  const token = Math.random().toString(36).slice(2, 14)
  return `${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 12)}`
}

const VotingOnline = (): JSX.Element => {
  const { showToast } = useToast()
  const { session, mahasiswa, updateSession } = useVotingSession()
  const dashboardData = useDashboardPemilih(session?.accessToken || null)

  const [step, setStep] = useState<VotingStep>(1)
  const [selectedKandidat, setSelectedKandidat] = useState<Candidate | null>(null)
  const [checkboxConfirm, setCheckboxConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingResult, setVotingResult] = useState<VotingReceipt | null>(null)
  const sigCanvas = useRef<SignatureCanvas>(null)
  const sigContainerRef = useRef<HTMLDivElement>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 500, height: 200 })
  const [isSigning, setIsSigning] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [countdownStr, setCountdownStr] = useState('--:--:--')

  // Dynamically resize canvas to match container for proper touch coordinates
  useEffect(() => {
    const container = sigContainerRef.current
    if (!container) return

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.floor(rect.width)
      const height = Math.min(200, Math.floor(width * 0.4)) // Maintain aspect ratio, max 200px
      setCanvasDimensions({ width, height })
    }

    updateCanvasSize()
    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [step]) // Re-run when step changes to signature step

  // Use Dashboard logic for voter data and stage
  const currentStage = dashboardData.currentStage
  const voterData = useMemo(() => {
    return {
      nama: dashboardData.user?.profile?.name || mahasiswa?.nama || 'Pemilih',
      nim: dashboardData.user?.username || mahasiswa?.nim || '-',
      mode: 'ONLINE' as const, // Voting page assumes ONLINE
      role: dashboardData.user?.role || 'STUDENT'
    }
  }, [dashboardData, mahasiswa])


  // Countdown Timer Logic
  // Countdown Timer Logic
  useEffect(() => {
    // Only run if we have election data
    if (!dashboardData.election?.voting_end_at) return

    const tick = () => {
      const now = new Date().getTime()
      const end = new Date(dashboardData.election!.voting_end_at!).getTime()
      const diff = end - now

      if (diff <= 0) {
        setCountdownStr('00:00:00')
        return
      }

      // Calculate absolute hours (including days) for simplicity in this compact view
      // Or if we want to match typical countdown:
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdownStr(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    tick() // Initial call
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [dashboardData.election])

  // Fetch candidates
  // Fetch candidates
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoadingCandidates(true)
        const data = await fetchPublicCandidates({ token: session?.accessToken })
        setCandidates(data)
      } catch (err) {
        console.error('Failed to load candidates:', err)
        alert('Gagal memuat data kandidat. Silakan refresh halaman.')
      } finally {
        setLoadingCandidates(false)
      }
    }
    loadCandidates()
  }, [session?.accessToken])


  const hasVoted = dashboardData.voterStatus?.has_voted || session?.hasVoted || false
  const canVote = currentStage === 'voting' && !hasVoted

  const handleSelectKandidat = (kandidat: Candidate) => {
    if (selectedKandidat?.id === kandidat.id) {
      setSelectedKandidat(null)
    } else {
      setSelectedKandidat(kandidat)
      setTimeout(() => setStep(2), 300)
    }
  }

  const handleLanjutKonfirmasi = () => {
    if (!selectedKandidat) return
    setStep(2)
    setCheckboxConfirm(false)
  }

  const handleKembali = () => {
    if (step === 2) {
      setStep(1)
      setCheckboxConfirm(false)
    }
  }

  const handleKirimSuara = async () => {
    if (!checkboxConfirm || isSubmitting || !selectedKandidat) return

    setIsSubmitting(true)

    try {
      // Use the election ID from dashboard data if available, otherwise fallback to store
      const electionId = dashboardData.election?.id || getActiveElectionId()

      if (!electionId) {
        throw new Error('Data pemilu tidak ditemukan. Silakan refresh halaman.')
      }

      const payload = {
        election_id: electionId,
        candidate_id: selectedKandidat.id
      }



      await apiRequest('/voting/online/cast', {
        method: 'POST',
        token: session?.accessToken,
        body: payload
      })

      // Update UI state immediately after success
      setStep(3)
    } catch (error: any) {
      console.error("Gagal mengirim suara", error)
      const message = error?.message || 'Gagal mengirim suara. Silakan coba lagi.'

      // Log Debug Info to Console instead of Alert


      // Recover from ALREADY_VOTED error
      if (error?.status === 409 || error?.code === 'ALREADY_VOTED' || message.includes('sudah memberikan suara')) {

        showToast("Suara sudah terekam. Silakan tanda tangan.", 'info')
        setStep(3)
        return
      }

      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSimpanSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      showToast("Mohon tanda tangan terlebih dahulu", 'warning')
      return
    }

    setIsSigning(true)
    const signatureData = sigCanvas.current.getCanvas().toDataURL('image/png')

    try {
      const electionId = dashboardData.election?.id || getActiveElectionId()

      if (!electionId) {
        throw new Error('Data pemilu tidak ditemukan.')
      }

      const payload = {
        election_id: Number(electionId),
        electionId: Number(electionId),
        signature: signatureData,
        digital_signature: signatureData,
        image: signatureData
      }



      await apiRequest('/voting/online/signature', {
        method: 'POST',
        token: session?.accessToken,
        body: payload
      })

      const timestamp = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      setVotingResult({
        timestamp,
        token: formatToken(),
      })

      updateSession({ hasVoted: true, votingStatus: 'voted' })
      showToast("Voting Berhasil! Terima kasih atas partisipasi Anda.", 'success')
      setStep(4)
    } catch (error: any) {
      console.error("Gagal menyimpan tanda tangan", error)
      const message = error?.message || 'Gagal menyimpan tanda tangan. Silakan coba lagi.'

      if (error?.status === 409) {
        showToast("Tanda tangan digital sudah ada.", 'info')
      } else {
        showToast(message, 'error')
      }
    } finally {
      setIsSigning(false)
    }
  }

  const handleClearSignature = () => {
    sigCanvas.current?.clear()
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (dashboardData.loading) {
    return <div className="p-4 text-center">Memuat...</div>
  }

  // If not in voting stage (and not just finished voting), show message
  // Allow step 4 (Result) to be shown even if weird stage glitch happens
  if (currentStage !== 'voting' && step !== 4) {
    return (
      <div className="dashboard-pemilih-page">
        <DashboardHeader voterData={voterData} />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="voting-container">
              <div className="status-block status-info">
                <div className="status-icon">ℹ️</div>
                <div className="status-content">
                  <h2>Voting Belum Dibuka</h2>
                  <p>Sistem mendeteksi saat ini adalah tahap: <strong>{currentStage.toUpperCase()}</strong></p>
                  <Link to="/dashboard">
                    <button className="btn-secondary">Kembali ke Dashboard</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    )
  }

  return (
    <div className="dashboard-pemilih-page">
      <DashboardHeader voterData={voterData} />

      <main className="dashboard-main">
        <div className="dashboard-container">

          <div className="voting-container" style={{ marginTop: 0 }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              🗳 PEMILIHAN ONLINE
            </h2>

            {step === 1 && (
              <div className="voting-status-bar">
                <div className="status-item">
                  <span className="status-label">Status Pemilih:</span>
                  <span className="status-value status-belum">{hasVoted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Waktu Tersisa:</span>
                  {/* Timer */}
                  <span className="status-value status-timer">{countdownStr}</span>
                </div>
              </div>
            )}

            <div className="progress-steps">
              <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Pilih Kandidat</div>
              </div>
              <div className="step-line" />
              <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Konfirmasi</div>
              </div>
              <div className="step-line" />
              <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Tanda Tangan</div>
              </div>
              <div className="step-line" />
              <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Selesai</div>
              </div>
            </div>

            {step === 1 && (
              <div className="voting-step">
                <div className="step-header">
                  <h1 className="step-title">Pilih pasangan calon Anda:</h1>
                </div>

                {loadingCandidates ? (
                  <div className="loading-candidates" style={{ textAlign: 'center', padding: '2rem' }}>
                    Memuat daftar kandiat...
                  </div>
                ) : (
                  <div className="kandidat-voting-grid">
                    {candidates.map((kandidat) => (
                      <div
                        key={kandidat.id}
                        className={`kandidat-voting-card ${selectedKandidat?.id === kandidat.id ? 'selected' : ''
                          }`}
                        onClick={() => handleSelectKandidat(kandidat)}
                      >
                        <div className="kandidat-hero">
                          <div className="kandidat-photo">
                            <img
                              src={kandidat.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&size=300&background=random`}
                              alt={kandidat.nama}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&size=300&background=random`
                              }}
                            />
                          </div>
                          <div className="kandidat-info">
                            <div className="candidate-number">PASLON {kandidat.nomorUrut.toString().padStart(2, '0')}</div>
                            <h3>{kandidat.nama}</h3>
                            <p className="visi-ringkas">Visi & Misi: Membangun kampus yang inklusif dan berprestasi</p>
                          </div>
                        </div>
                        <button
                          className={`btn-select ${selectedKandidat?.id === kandidat.id ? 'selected' : ''}`}
                          type="button"
                        >
                          {selectedKandidat?.id === kandidat.id ? '✓ Dipilih' : 'PILIH'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="voting-actions">
                  <Link to="/dashboard">
                    <button className="btn-secondary">Kembali ke Dashboard</button>
                  </Link>
                </div>
              </div>
            )}

            {step === 2 && selectedKandidat && (
              <div className="voting-step">
                <div className="confirmation-modal">
                  <div className="confirmation-header">
                    <h2>Konfirmasi Pilihan</h2>
                  </div>
                  <div className="confirmation-body">
                    <p className="confirmation-text">
                      Anda memilih <strong>PASLON {selectedKandidat.nomorUrut.toString().padStart(2, '0')}</strong>
                      <br />
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2d3748', display: 'block', margin: '0.5rem 0' }}>
                        {selectedKandidat.nama}
                      </span>
                    </p>

                    <div className="confirmation-checkbox-container" style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                      <input
                        type="checkbox"
                        id="confirm-check"
                        checked={checkboxConfirm}
                        onChange={(e) => setCheckboxConfirm(e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label htmlFor="confirm-check" style={{ cursor: 'pointer' }}>
                        Saya menyatakan pilihan ini benar dan sadar.
                      </label>
                    </div>

                    <p className="confirmation-warning">
                      Setelah mengirim, suara tidak dapat diubah.
                    </p>
                  </div>

                  <div className="confirmation-actions">
                    <button className="btn-secondary" onClick={handleKembali}>
                      BATAL
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleKirimSuara}
                      disabled={isSubmitting || !checkboxConfirm}
                    >
                      {isSubmitting ? 'Mengirim...' : 'LANJUT KE TTD'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="voting-step">
                <div className="confirmation-modal" style={{ maxWidth: '600px' }}>
                  <div className="confirmation-header">
                    <h2>Tanda Tangan Digital</h2>
                  </div>
                  <div className="confirmation-body">
                    <p className="confirmation-text" style={{ marginBottom: '1rem' }}>
                      Silakan tanda tangan di bawah ini untuk memvalidasi suara Anda.
                    </p>

                    <div ref={sigContainerRef} className="signature-canvas-container" style={{ border: '2px dashed #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                          width: canvasDimensions.width,
                          height: canvasDimensions.height,
                          className: 'sigCanvas',
                          style: { width: '100%', height: `${canvasDimensions.height}px`, display: 'block', touchAction: 'none' }
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={handleClearSignature}
                        style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Hapus / Ulangi
                      </button>
                    </div>
                  </div>

                  <div className="confirmation-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSimpanSignature}
                      disabled={isSigning}
                      style={{ width: '100%' }}
                    >
                      {isSigning ? 'Menyimpan...' : 'KIRIM SUARA SAH'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && votingResult && (
              <div className="voting-result">
                <div className="result-card">
                  <div className="result-icon">🎉</div>
                  <h2>Terima Kasih!</h2>
                  <p>Suara Anda telah dicatat dalam sistem PEMIRA UNIWA.</p>
                  <div className="result-info">
                    <div className="info-row">
                      <span className="info-label">Waktu Voting</span>
                      <span className="info-value">{votingResult.timestamp}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Token Bukti</span>
                      <span className="info-value token">{votingResult.token}</span>
                    </div>
                  </div>
                  <Link to="/dashboard">
                    <button className="btn-primary">Kembali ke Dashboard</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}

export default VotingOnline
