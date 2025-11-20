import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TPSPanelHeader from '../components/TPSPanelHeader'
import TPSPanelVerificationPanel from '../components/TPSPanelVerificationPanel'
import { securityChecklist } from '../data/tpsPanel'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import type { TPSQueueEntry } from '../types/tpsPanel'
import '../styles/TPSPanel.css'

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value))

const TPSPanelDashboard = (): JSX.Element => {
  const navigate = useNavigate()
  const {
    panelInfo,
    panitia,
    staticQr,
    queue,
    logs,
    notification,
    panelMode,
    triggerManualRefresh,
    updateQueueStatus,
    dismissNotification,
    setPanelMode,
    setPanelStatus,
  } = useTPSPanelStore()
  const [selectedEntry, setSelectedEntry] = useState<TPSQueueEntry | null>(null)
  const [panelModeView, setPanelModeView] = useState<'approve' | 'reject' | 'detail'>('approve')

  const stats = useMemo(() => {
    const waiting = queue.filter((entry) => entry.status === 'waiting').length
    const verified = queue.filter((entry) => entry.status === 'verified').length
    const rejected = queue.filter((entry) => entry.status === 'rejected' || entry.status === 'cancelled').length
    return { waiting, verified, rejected }
  }, [queue])

  const highlightEntryId = notification?.type === 'queue' ? notification.entryId : undefined

  const openPanel = (entry: TPSQueueEntry, mode: 'approve' | 'reject' | 'detail' = 'approve') => {
    setSelectedEntry(entry)
    setPanelModeView(mode)
  }

  const handleVerify = (entry: TPSQueueEntry) => openPanel(entry, 'approve')
  const handleReject = (entry: TPSQueueEntry) => openPanel(entry, 'reject')
  const handleDetail = (entry: TPSQueueEntry) => openPanel(entry, 'detail')

  const handleCloseTPS = () => {
    if (panelInfo.status !== 'Aktif') return
    if (!window.confirm('Tutup TPS Aula Utama?')) return
    setPanelStatus('Ditutup')
  }

  const hakSuaraLabel = (entry: TPSQueueEntry) => {
    if (entry.hasVoted) return 'Sudah'
    if (entry.status === 'verified') return 'Sedang'
    if (entry.status === 'rejected') return 'Ditolak'
    if (entry.status === 'cancelled') return 'Dibatalkan'
    return 'Belum'
  }

  const queueIndicatorLabel = panelMode === 'mobile' ? 'Model A: Mahasiswa voting via HP' : 'Model B: Voting di perangkat TPS'

  return (
    <div className="tps-panel-page">
      <div className="panel-shell">
        <TPSPanelHeader
          panitia={panitia}
          locationLabel={`${panelInfo.tpsName} (${panelInfo.tpsCode})`}
          subtitle="Dashboard TPS – Monitoring Real-time"
        />

        {notification && (
          <div className={`panel-notification ${notification.type}`}>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            <button className="btn-ghost" onClick={dismissNotification} type="button">
              Tutup
            </button>
          </div>
        )}

        <div className="panel-body">
          <div className="panel-main-grid">
            <div className="info-column">
              <section className="status-card">
                <div className="status-header">
                  <div>
                    <p className="status-label">Status TPS</p>
                    <h2>{panelInfo.tpsName}</h2>
                    <p className="status-meta">
                      {panelInfo.tpsCode} · Status: {panelInfo.status} · Jam Operasional: {panelInfo.jamOperasional}
                    </p>
                  </div>
                  <div className="status-actions">
                    <button className="btn-danger" type="button" disabled={panelInfo.status !== 'Aktif'} onClick={handleCloseTPS}>
                      Tutup TPS
                    </button>
                    <button className="btn-ghost" type="button" onClick={triggerManualRefresh}>
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stats-chip">
                    <span>Pemilih sudah voting di TPS ini</span>
                    <strong>{panelInfo.totalVoters}</strong>
                  </div>
                  <div className="stats-chip">
                    <span>Pemilih sedang diproses</span>
                    <strong>{stats.waiting}</strong>
                  </div>
                  <div className="stats-chip">
                    <span>Sudah diverifikasi</span>
                    <strong>{stats.verified}</strong>
                  </div>
                  <div className="stats-chip">
                    <span>Ditolak / Dibatalkan</span>
                    <strong>{stats.rejected}</strong>
                  </div>
                </div>
              </section>

              <section className="qr-static-card">
                <p className="status-label">Info QR TPS</p>
                <h2>QR TPS – Dicetak &amp; Ditempel</h2>
                <div className="qr-static-info">
                  <div>
                    <span>ID QR</span>
                    <strong>{staticQr.id}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{staticQr.status}</strong>
                  </div>
                </div>
                <p className="status-meta">{staticQr.description}</p>
                <ul className="qr-notes">
                  {staticQr.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <a className="btn-secondary" href={staticQr.fileUrl} download target="_blank" rel="noreferrer">
                  Download QR Lagi
                </a>
              </section>
            </div>

            <section className="queue-section queue-card">
              <div className="queue-header">
                <div>
                  <p className="status-label">Pemilih Baru</p>
                <h2>Menunggu Verifikasi</h2>
                <p className="status-meta">Queue terhubung realtime via WebSocket</p>
              </div>
              <div className="mode-toggle">
                <button
                  type="button"
                  className={panelMode === 'mobile' ? 'active' : ''}
                  onClick={() => setPanelMode('mobile')}
                >
                  Voting di HP Mahasiswa
                </button>
                <button
                  type="button"
                  className={panelMode === 'device' ? 'active' : ''}
                  onClick={() => setPanelMode('device')}
                >
                  Voting di Perangkat TPS
                </button>
              </div>
            </div>

            <div className="queue-indicator">
              <span className="ping-dot" /> {queueIndicatorLabel}
              {panelMode === 'device' && (
                <button className="btn-link" type="button" onClick={() => navigate('/tps-panel/mode-voting')}>
                  Buka Ruang Voting TPS →
                </button>
              )}
            </div>

            <div className="queue-table-wrapper">
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Prodi / Fakultas</th>
                    <th>Hak Suara</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-queue">Belum ada pemilih yang scan QR.</div>
                      </td>
                    </tr>
                  )}
                  {queue.map((entry) => {
                    const isWaiting = entry.status === 'waiting'
                    const hakSuara = hakSuaraLabel(entry)
                    return (
                      <tr
                        key={entry.id}
                        className={`${entry.id === highlightEntryId ? 'highlight' : ''} ${entry.hasVoted ? 'done' : ''}`.trim()}
                      >
                        <td>{formatTime(entry.waktuScan)}</td>
                        <td>{entry.nim}</td>
                        <td>
                          <div className="name-cell">
                            <strong>{entry.nama}</strong>
                            <p>Angkatan {entry.angkatan}</p>
                          </div>
                        </td>
                        <td>
                          <p className="program-label">{entry.prodi}</p>
                          <span className="faculty-label">{entry.fakultas}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${hakSuara.toLowerCase()}`}>{hakSuara}</span>
                        </td>
                        <td>
                          <div className="queue-actions">
                            {isWaiting ? (
                              <>
                                <button className="btn-table primary" type="button" onClick={() => handleVerify(entry)}>
                                  ✓ Verifikasi
                                </button>
                                <button className="btn-table danger" type="button" onClick={() => handleReject(entry)}>
                                  ✕ Tolak
                                </button>
                              </>
                            ) : (
                              <button className="btn-table" type="button" onClick={() => handleDetail(entry)}>
                                Detail
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            </section>
          </div>

          <section className="activity-card log-card">
            <div className="activity-header">
              <div>
                <p className="status-label">Riwayat Singkat TPS</p>
                <h2>Aktivitas Terakhir</h2>
              </div>
              <button className="btn-link" type="button" onClick={() => navigate('/tps-panel/riwayat')}>
                Lihat riwayat lengkap →
              </button>
            </div>
            <ul className="activity-list">
              {logs.map((log) => (
                <li key={log.id}>
                  <span className="activity-time">{formatTime(log.timestamp)}</span>
                  <span>{log.message}</span>
                </li>
              ))}
            </ul>
            <div className="security-card compact">
              <div className="activity-header">
                <p className="status-label">Keamanan Panel</p>
                <h3>Checklist Cepat</h3>
              </div>
              <ul className="security-list">
                {securityChecklist.map((item) => (
                  <li key={item.id}>
                    <span className="check-icon">{item.completed ? '✔' : '○'}</span>
                    <div>
                      <strong>{item.label}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      {selectedEntry && (
        <TPSPanelVerificationPanel
          entry={selectedEntry}
          panelInfo={panelInfo}
          mode={panelModeView}
          onClose={() => setSelectedEntry(null)}
          onApprove={() => {
            updateQueueStatus(selectedEntry.id, 'verified')
            setSelectedEntry(null)
          }}
          onReject={(reason) => {
            updateQueueStatus(selectedEntry.id, 'rejected', { reason })
            setSelectedEntry(null)
          }}
        />
      )}
    </div>
  )
}

export default TPSPanelDashboard
