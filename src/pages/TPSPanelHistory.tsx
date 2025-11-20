import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TPSPanelHeader from '../components/TPSPanelHeader'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import type { TPSHistoryRecord } from '../types/tpsPanel'
import '../styles/TPSPanel.css'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))

const typeLabels: Record<TPSHistoryRecord['type'], string> = {
  verification: 'Verifikasi',
  rejection: 'Penolakan',
  open: 'Buka TPS',
  close: 'Tutup TPS',
  qr: 'QR',
}

const TPSPanelHistory = (): JSX.Element => {
  const navigate = useNavigate()
  const { panelInfo, panitia, historyRecords } = useTPSPanelStore()
  const [filterType, setFilterType] = useState<'all' | TPSHistoryRecord['type']>('all')
  const [filterDate, setFilterDate] = useState('')

  const filteredRecords = useMemo(() => {
    return historyRecords.filter((record) => {
      if (filterType !== 'all' && record.type !== filterType) {
        return false
      }
      if (filterDate) {
        const recordDate = new Date(record.timestamp).toISOString().slice(0, 10)
        if (recordDate !== filterDate) {
          return false
        }
      }
      return true
    })
  }, [filterDate, filterType, historyRecords])

  return (
    <div className="tps-panel-page">
      <div className="panel-shell">
        <TPSPanelHeader panitia={panitia} locationLabel={`${panelInfo.tpsName} (${panelInfo.tpsCode})`} subtitle="Riwayat Aktivitas TPS" />

        <div className="panel-body">
          <button className="btn-link" type="button" onClick={() => navigate('/tps-panel')}>
            ← Kembali ke Dashboard TPS
          </button>

          <section className="status-card">
            <div className="history-header">
              <div>
                <p className="status-label">Audit TPS</p>
                <h2>Riwayat Aktivitas Lengkap</h2>
              </div>
            </div>

            <div className="history-filters">
              <label>
                Jenis Aktivitas
                <select value={filterType} onChange={(event) => setFilterType(event.target.value as TPSHistoryRecord['type'] | 'all')}>
                  <option value="all">Semua aktivitas</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tanggal
                <input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
              </label>
            </div>

            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-queue">Tidak ada data untuk filter ini.</div>
                      </td>
                    </tr>
                  )}
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.timestamp)}</td>
                      <td>
                        <span className={`history-pill ${record.type}`}>{typeLabels[record.type]}</span>
                      </td>
                      <td>{record.nim ?? '-'}</td>
                      <td>{record.nama ?? '-'}</td>
                      <td>{record.detail ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TPSPanelHistory
