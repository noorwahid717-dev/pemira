import { useEffect, useMemo, useState } from 'react'
import { rejectionReasons } from '../data/tpsPanel'
import type { TPSPanelInfo, TPSQueueEntry } from '../types/tpsPanel'
import '../styles/TPSPanel.css'

type TPSPanelVerificationPanelProps = {
  entry: TPSQueueEntry
  panelInfo: TPSPanelInfo
  mode?: 'approve' | 'reject' | 'detail'
  onClose: () => void
  onApprove: () => void
  onReject: (reason: string) => void
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value))

const TPSPanelVerificationPanel = ({
  entry,
  panelInfo,
  mode = 'approve',
  onClose,
  onApprove,
  onReject,
}: TPSPanelVerificationPanelProps): JSX.Element => {
  const [selectedReason, setSelectedReason] = useState(entry.rejectionReason ?? '')
  const [error, setError] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(mode === 'reject')

  const isReadOnly = entry.status !== 'waiting'

  const statusHakSuara = useMemo(() => {
    if (entry.hasVoted) return 'SUDAH MEMILIH'
    if (entry.status === 'waiting') return 'BELUM PERNAH MEMILIH'
    if (entry.status === 'rejected') return 'DITOLAK'
    return 'SEDANG DIPROSES'
  }, [entry])

  useEffect(() => {
    setSelectedReason(entry.rejectionReason ?? '')
  }, [entry])

  const handleReject = () => {
    if (!selectedReason) {
      setError('Pilih alasan penolakan terlebih dahulu.')
      return
    }
    onReject(selectedReason)
    setSelectedReason('')
    setError('')
  }

  const statusClass = statusHakSuara.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="verification-overlay">
      <div className="verification-panel">
        <div className="verification-header">
          <div>
            <p className="status-label">Verifikasi Pemilih</p>
            <h2>TPS {panelInfo.tpsName}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Tutup panel">
            ×
          </button>
        </div>

        <div className="verification-content">
          <section>
            <p className="section-title">Data Pemilih</p>
            <div className="detail-grid">
              <div>
                <span>NIM</span>
                <strong>{entry.nim}</strong>
              </div>
              <div>
                <span>Nama</span>
                <strong>{entry.nama}</strong>
              </div>
              <div>
                <span>Program Studi</span>
                <strong>{entry.prodi}</strong>
              </div>
              <div>
                <span>Fakultas</span>
                <strong>{entry.fakultas}</strong>
              </div>
              <div>
                <span>Angkatan</span>
                <strong>{entry.angkatan}</strong>
              </div>
              <div>
                <span>Status Akademik</span>
                <strong>{entry.statusMahasiswa}</strong>
              </div>
              <div>
                <span>TPS Scan</span>
                <strong>
                  {panelInfo.tpsCode} – {panelInfo.tpsName}
                </strong>
              </div>
              <div>
                <span>Waktu Scan</span>
                <strong>{formatTime(entry.waktuScan)}</strong>
              </div>
            </div>
          </section>

          <section>
            <p className="section-title">Status Hak Suara</p>
            <div className={`hak-suara-banner ${statusClass}`}>{statusHakSuara}</div>
            <ul className="instruction-list">
              <li>Cocokkan nama &amp; NIM dengan kartu identitas mahasiswa (KTM atau lainnya).</li>
              <li>Pastikan mahasiswa benar-benar hadir di TPS Aula Utama.</li>
              <li>Konfirmasi ulang pilihan TPS jika mahasiswa membawa surat pindah TPS.</li>
            </ul>
            {!isReadOnly && (
              <div className="verification-actions">
                <button className="btn-primary" type="button" onClick={onApprove}>
                  ✓ Setujui – Izinkan Voting
                </button>
                <button className="btn-ghost" type="button" onClick={() => setShowRejectForm(true)}>
                  ✕ Tolak Akses Voting
                </button>
              </div>
            )}
            {isReadOnly && <p className="status-meta">Pemilih sudah diproses. Gunakan tombol Detail untuk audit saja.</p>}
          </section>

          {showRejectForm && !isReadOnly && (
            <section>
              <p className="section-title">Alasan Penolakan</p>
              <label htmlFor="rejection-reason">Pilih alasan</label>
              <select
                id="rejection-reason"
                value={selectedReason}
                onChange={(event) => {
                  setSelectedReason(event.target.value)
                  setError('')
                }}
              >
                <option value="">Pilih alasan</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {error && <p className="error-text">{error}</p>}
              <button className="btn-secondary" type="button" onClick={handleReject}>
                Kirim Penolakan
              </button>
            </section>
          )}

          {isReadOnly && entry.rejectionReason && (
            <section>
              <p className="section-title">Alasan Penolakan</p>
              <p className="status-meta">{entry.rejectionReason}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default TPSPanelVerificationPanel
