import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import type { TPSScanResult } from '../types/voting'
import '../styles/TPSValidation.css'

type ValidationState = 'validating' | 'valid' | 'error'
type ValidationError = 'already_voted' | 'expired_qr' | 'not_started' | 'closed'

const TPSValidation = (): JSX.Element => {
  const navigate = useNavigate()
  const { session } = useVotingSession()

  const [validationState, setValidationState] = useState<ValidationState>('validating')
  const [errorType, setErrorType] = useState<ValidationError | null>(null)
  const [qrData, setQrData] = useState<TPSScanResult | null>(null)
  const [votingTime, setVotingTime] = useState<string | null>(null)

  useEffect(() => {
    const scannedQR = sessionStorage.getItem('scannedQR')
    if (!scannedQR) {
      navigate('/voting-tps', { replace: true })
      return
    }

    try {
      const qr = JSON.parse(scannedQR) as TPSScanResult
      setQrData(qr)
      setTimeout(() => {
        validateVotingEligibility()
      }, 2000)
    } catch {
      sessionStorage.removeItem('scannedQR')
      navigate('/voting-tps', { replace: true })
    }
  }, [navigate])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const validateVotingEligibility = () => {
    if (session.hasVoted) {
      setValidationState('error')
      setErrorType('already_voted')
      setVotingTime('14 Juni 2024, 10:24 WIB')
      return
    }

    const scenario: ValidationState | ValidationError = 'valid'
    if (scenario === 'valid') {
      setValidationState('valid')
    } else {
      setValidationState('error')
      setErrorType(scenario as ValidationError)
    }
  }

  const handleStartVoting = () => {
    sessionStorage.setItem('votingMode', 'tps')
    navigate('/voting-tps/vote')
  }

  const handleRescan = () => {
    sessionStorage.removeItem('scannedQR')
    navigate('/voting-tps/scanner')
  }

  const handleBackToDashboard = () => {
    sessionStorage.removeItem('scannedQR')
    navigate('/dashboard')
  }

  if (!qrData) {
    return null
  }

  return (
    <div className="validation-page">
      <div className="validation-container">
        {validationState === 'validating' && (
          <div className="validation-card">
            <div className="validation-spinner">
              <div className="spinner" />
            </div>
            <h2>Memverifikasi Hak Suara</h2>
            <p className="validation-text">Sedang memverifikasi hak suara Anda...</p>
            <div className="validation-info">
              <div className="info-row">
                <span className="info-label">TPS:</span>
                <span className="info-value">{qrData.tpsName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Mode:</span>
                <span className="info-value">Offline (TPS)</span>
              </div>
            </div>
          </div>
        )}

        {validationState === 'valid' && (
          <div className="validation-card success">
            <div className="validation-icon success">✔</div>
            <h2>QR Berhasil Dipindai</h2>
            <div className="validation-details">
              <div className="detail-row">
                <span className="detail-label">TPS terdeteksi:</span>
                <span className="detail-value highlight">{qrData.tpsName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mode voting:</span>
                <span className="detail-value">Offline (TPS)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status QR Panitia:</span>
                <span className="detail-value badge-valid">VALID</span>
              </div>
            </div>

            <div className="validation-success-box">
              <div className="success-icon">✔</div>
              <div className="success-content">
                <strong>Hak suara terverifikasi</strong>
                <p>Anda akan diarahkan ke halaman voting.</p>
              </div>
            </div>

            <div className="validation-actions">
              <button className="btn-primary" onClick={handleStartVoting}>
                Mulai Voting Sekarang
              </button>
              <button className="btn-secondary" onClick={handleRescan}>
                Scan Ulang QR
              </button>
            </div>
          </div>
        )}

        {validationState === 'error' && errorType === 'already_voted' && (
          <div className="validation-card error">
            <div className="validation-icon error">❌</div>
            <h2>Anda Sudah Menggunakan Hak Suara</h2>
            <div className="error-details">
              <p className="error-message">Anda tidak dapat memilih lagi.</p>
              <div className="error-info">
                <div className="info-row">
                  <span className="info-label">Waktu voting:</span>
                  <span className="info-value">{votingTime}</span>
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={handleBackToDashboard}>
              Kembali ke Dashboard
            </button>
          </div>
        )}

        {validationState === 'error' && errorType === 'expired_qr' && (
          <div className="validation-card error">
            <div className="validation-icon error">❌</div>
            <h2>QR Tidak Valid</h2>
            <p className="error-message">QR tidak valid atau sudah kedaluwarsa.</p>
            <p className="error-help">Minta panitia menampilkan QR terbaru.</p>
            <button className="btn-primary" onClick={handleRescan}>
              Scan Ulang QR
            </button>
          </div>
        )}

        {validationState === 'error' && errorType === 'not_started' && (
          <div className="validation-card error">
            <div className="validation-icon warning">⏳</div>
            <h2>Voting Belum Dibuka</h2>
            <p className="error-message">Voting belum dibuka saat ini.</p>
            <div className="error-info">
              <div className="info-row">
                <span className="info-label">Voting dimulai:</span>
                <span className="info-value">12 Juni 2024, 00:00 WIB</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleBackToDashboard}>
              Kembali
            </button>
          </div>
        )}

        {validationState === 'error' && errorType === 'closed' && (
          <div className="validation-card error">
            <div className="validation-icon error">🔒</div>
            <h2>Voting Telah Ditutup</h2>
            <p className="error-message">Terima kasih atas partisipasi Anda.</p>
            <button className="btn-primary" onClick={handleBackToDashboard}>
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TPSValidation
