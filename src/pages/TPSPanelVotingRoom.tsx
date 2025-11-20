import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TPSPanelHeader from '../components/TPSPanelHeader'
import { tpsVotingCandidates } from '../data/tpsPanel'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import '../styles/TPSPanel.css'

const TPSPanelVotingRoom = (): JSX.Element => {
  const navigate = useNavigate()
  const { panelInfo, panitia, queue } = useTPSPanelStore()
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [sessionActive, setSessionActive] = useState(false)

  const selectedEntry = useMemo(() => queue.find((item) => item.id === selectedEntryId), [queue, selectedEntryId])

  const handleStartVoting = () => {
    if (!selectedEntryId) {
      setMessage('Pilih pemilih dari antrean terlebih dahulu.')
      return
    }
    setMessage('Bilik voting siap digunakan. Pandu pemilih saat memilih kandidat.')
    setSessionActive(true)
  }

  const handleSubmitVote = () => {
    if (!sessionActive) {
      setMessage('Mulai voting terlebih dahulu.')
      return
    }
    if (!selectedCandidateId) {
      setMessage('Pilih kandidat sebelum mengirim suara.')
      return
    }
    setMessage(`Suara untuk ${selectedEntry?.nama ?? 'pemilih'} berhasil direkam (simulasi).`)
    setSessionActive(false)
    setSelectedCandidateId(null)
  }

  return (
    <div className="tps-panel-page">
      <div className="panel-shell">
        <TPSPanelHeader panitia={panitia} locationLabel={`${panelInfo.tpsName} (${panelInfo.tpsCode})`} subtitle="Mode Voting TPS" />

        <div className="panel-body">
          <button className="btn-link" type="button" onClick={() => navigate('/tps-panel')}>
            ← Kembali ke Dashboard TPS
          </button>

          <section className="voting-room-card">
            <div>
              <p className="status-label">Ruang Voting TPS</p>
              <h2>Bilik suara digital</h2>
              <p className="status-meta">
                Gunakan mode ini jika mahasiswa melakukan voting di perangkat TPS. Data suara tetap tersimpan di backend.
              </p>
            </div>

            <div className="voting-room-grid">
              <div className="voter-context">
                <strong>Pemilih Terpilih</strong>
                <select value={selectedEntryId} onChange={(event) => setSelectedEntryId(event.target.value)}>
                  <option value="">Pilih pemilih dari antrean</option>
                  {queue.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.nama} · {entry.nim}
                    </option>
                  ))}
                </select>
                {selectedEntry && (
                  <p className="status-meta">
                    Mode: {selectedEntry.mode === 'mobile' ? 'Voting via HP' : 'Voting di TPS'} · Status: {selectedEntry.status}
                  </p>
                )}
                <button className="btn-primary" type="button" onClick={handleStartVoting}>
                  Mulai Voting untuk Mahasiswa
                </button>
              </div>

              <div>
                <strong>Status Ruang Voting</strong>
                <p className="qr-note">{sessionActive ? 'Pemilih siap memilih.' : 'Menunggu instruksi panitia.'}</p>
              </div>
            </div>

            <div>
              <p className="status-label">Pilih Kandidat</p>
              <div className="candidates-grid">
                {tpsVotingCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`candidate-card ${selectedCandidateId === candidate.id ? 'selected' : ''}`}
                  >
                    <p className="status-label">No. {candidate.nomorUrut}</p>
                    <h3>{candidate.nama}</h3>
                    <p className="status-meta">{candidate.deskripsi}</p>
                    <button className="btn-secondary" type="button" onClick={() => setSelectedCandidateId(candidate.id)}>
                      Pilih Kandidat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="voting-actions">
              <button className="btn-primary" type="button" onClick={handleSubmitVote}>
                Kirim Suara
              </button>
              <p className="voting-status">{message || 'Belum ada aktivitas.'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TPSPanelVotingRoom
