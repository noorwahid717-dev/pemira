import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'
import { mockCandidates } from '../data/mockCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import type { Candidate, TPSScanResult, VotingRecord } from '../types/voting'
import '../styles/TPSVoting.css'

type VotingStep = 1 | 2

const generateToken = () => {
  const chars = '0123456789abcdef'
  const segments = [4, 4, 4]
  return segments
    .map((len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    .join('-')
}

const TPSVoting = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa, updateSession, clearSession } = useVotingSession()

  const [step, setStep] = useState<VotingStep>(1)
  const [selectedKandidat, setSelectedKandidat] = useState<Candidate | null>(null)
  const [checkboxConfirm, setCheckboxConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrData, setQrData] = useState<TPSScanResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('scannedQR')
    if (!raw) {
      navigate('/voting-tps', { replace: true })
      return
    }
    try {
      setQrData(JSON.parse(raw) as TPSScanResult)
    } catch {
      sessionStorage.removeItem('scannedQR')
      navigate('/voting-tps', { replace: true })
    }
  }, [navigate])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!qrData) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const handleSelectKandidat = (kandidat: Candidate) => {
    setSelectedKandidat(kandidat)
  }

  const handleSubmitVote = () => {
    if (!checkboxConfirm || !selectedKandidat) return

    setIsSubmitting(true)

    setTimeout(() => {
      const voteData: VotingRecord = {
        kandidatId: selectedKandidat.id,
        kandidatNama: selectedKandidat.nama,
        votedAt: new Date().toISOString(),
        token: generateToken(),
        tpsName: qrData.tpsName,
        mode: 'tps',
      }

      updateSession({ hasVoted: true, votingStatus: 'voted' })
      sessionStorage.setItem('voteData', JSON.stringify(voteData))
      sessionStorage.removeItem('scannedQR')
      sessionStorage.removeItem('votingMode')

      navigate('/voting-tps/success')
    }, 1500)
  }

  return (
    <div className="tps-voting-page">
      <PageHeader title={`Voting TPS - Step ${step}/2`} user={mahasiswa} onLogout={handleLogout} />

      <main className="tps-voting-container">
        {step === 1 && (
          <div className="voting-step-1">
            <div className="tps-banner">
              <span className="banner-icon">📢</span>
              <div className="banner-content">
                <strong>Voting di lokasi TPS</strong>
                <p>{qrData.tpsName}</p>
              </div>
            </div>

            <div className="voting-header">
              <h2>Pilih Kandidat</h2>
              <p className="step-indicator">Step 1/2</p>
            </div>

            <div className="kandidat-grid">
              {mockCandidates.map((kandidat) => (
                <div
                  key={kandidat.id}
                  className={`kandidat-card-tps ${selectedKandidat?.id === kandidat.id ? 'selected' : ''}`}
                  onClick={() => handleSelectKandidat(kandidat)}
                >
                  <div className="kandidat-foto">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&size=200&background=random`}
                      alt={kandidat.nama}
                    />
                  </div>
                  <div className="kandidat-info">
                    <div className="kandidat-nomor">No. {kandidat.nomorUrut}</div>
                    <h3 className="kandidat-nama">{kandidat.nama}</h3>
                    <p className="kandidat-fakultas">{kandidat.fakultas}</p>
                    <p className="kandidat-prodi">{kandidat.prodi}</p>
                  </div>
                  <div className="kandidat-radio">
                    <input
                      type="radio"
                      name="kandidat"
                      checked={selectedKandidat?.id === kandidat.id}
                      onChange={() => handleSelectKandidat(kandidat)}
                    />
                    <span className="radio-label">Pilih</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="voting-actions">
              <button className="btn-next" onClick={() => setStep(2)} disabled={!selectedKandidat}>
                Lanjut ke Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedKandidat && (
          <div className="voting-step-2">
            <div className="tps-banner">
              <span className="banner-icon">📢</span>
              <div className="banner-content">
                <strong>Voting di lokasi TPS</strong>
                <p>{qrData.tpsName}</p>
              </div>
            </div>

            <div className="voting-header">
              <h2>Konfirmasi Pilihan</h2>
              <p className="step-indicator">Step 2/2</p>
            </div>

            <div className="confirmation-card">
              <h3>Anda memilih:</h3>
              <div className="selected-kandidat">
                <div className="selected-foto">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedKandidat.nama)}&size=150&background=random`}
                    alt={selectedKandidat.nama}
                  />
                </div>
                <div className="selected-info">
                  <div className="selected-number">No. {selectedKandidat.nomorUrut}</div>
                  <h3>{selectedKandidat.nama}</h3>
                  <p>{selectedKandidat.fakultas}</p>
                  <p>{selectedKandidat.prodi}</p>
                </div>
              </div>

              <label className="confirmation-checkbox">
                <input
                  type="checkbox"
                  checked={checkboxConfirm}
                  onChange={(event) => setCheckboxConfirm(event.target.checked)}
                />
                <span>Saya yakin dengan pilihan saya dan memahami bahwa keputusan ini final.</span>
              </label>

              <div className="confirmation-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Kembali
                </button>
                <button className="btn-primary" onClick={handleSubmitVote} disabled={!checkboxConfirm || isSubmitting}>
                  {isSubmitting ? 'Mengirim...' : 'Kirim Suara'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TPSVoting
