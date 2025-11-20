import { useMonitoringLive } from '../hooks/useMonitoringLive'
import '../styles/AdminMonitoring.css'

const AdminMonitoringLiveCount = (): JSX.Element => {
  const {
    summary,
    candidates,
    faculty,
    tps,
    logs,
    chartMode,
    setChartMode,
    filters,
    setFilters,
    participationPercent,
    publicLiveEnabled,
    setPublicLiveEnabled,
    refreshNow,
    exportSnapshot,
  } = useMonitoringLive()

  return (
    <div className="monitoring-page">
      <header className="monitoring-header">
        <div>
          <p className="label">PEMIRA UNIWA</p>
          <h1>Monitoring Voting & Live Count</h1>
          <div className={`status-pill ${summary.statusType}`}>{summary.statusLabel}</div>
          <p>Periode 12–15 Juni 202X · Update terakhir {summary.lastUpdated}</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" type="button" onClick={refreshNow}>
            Refresh Sekarang
          </button>
          <button className="btn-primary" type="button" onClick={exportSnapshot}>
            Export Data
          </button>
        </div>
      </header>

      <section className="summary-grid">
        <article>
          <h3>Total Suara Masuk</h3>
          <p>
            {summary.votesIn.toLocaleString('id-ID')} / {summary.totalVoters.toLocaleString('id-ID')} pemilih
          </p>
          <div className="progress">
            <div style={{ width: `${participationPercent}%` }} />
          </div>
          <span>{participationPercent}%</span>
        </article>
        <article>
          <h3>Online vs TPS</h3>
          <p>
            Online: <strong>{summary.onlineVotes.toLocaleString('id-ID')}</strong>
          </p>
          <p>
            TPS: <strong>{summary.tpsVotes.toLocaleString('id-ID')}</strong>
          </p>
        </article>
        <article>
          <h3>TPS Aktif</h3>
          <p>
            {summary.tpsActive}/{summary.tpsTotal}
          </p>
          <small>TPS bermasalah: {summary.tpsTotal - summary.tpsActive}</small>
        </article>
      </section>

      <section className="main-grid">
        <article className="card chart-card">
          <div className="chart-header">
            <div>
              <h2>Perolehan Suara per Kandidat</h2>
              <p>Real-Time</p>
            </div>
            <div className="chart-filters">
              <select value={filters.faculty} onChange={(event) => setFilters((prev) => ({ ...prev, faculty: event.target.value }))}>
                <option value="all">Semua Fakultas</option>
                <option value="teknik">Teknik</option>
                <option value="ekonomi">Ekonomi</option>
              </select>
              <select value={filters.tps} onChange={(event) => setFilters((prev) => ({ ...prev, tps: event.target.value }))}>
                <option value="all">Semua TPS</option>
                <option value="tps-1">TPS 1</option>
                <option value="tps-2">TPS 2</option>
              </select>
              <div className="chart-toggle">
                <button className={chartMode === 'bar' ? 'active' : ''} onClick={() => setChartMode('bar')} type="button">
                  Bar
                </button>
                <button className={chartMode === 'pie' ? 'active' : ''} onClick={() => setChartMode('pie')} type="button">
                  Pie
                </button>
              </div>
            </div>
          </div>

          <div className={`candidate-chart ${chartMode}`}>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-row">
                <div className="candidate-info">
                  <span className="badge" style={{ background: candidate.color }} />
                  <strong>{candidate.name}</strong>
                </div>
                <div className="candidate-bar">
                  <div style={{ width: `${candidate.percentage}%`, background: candidate.color }} />
                </div>
                <div className="candidate-votes">
                  {candidate.votes.toLocaleString('id-ID')} ({candidate.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card participation-card">
          <div className="card-header">
            <h2>Partisipasi per Fakultas</h2>
            <button className="btn-link" type="button">
              Detail Fakultas →
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fakultas</th>
                <th>Sudah</th>
                <th>DPT</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((row) => {
                const percent = Math.round((row.voted / row.total) * 100)
                return (
                  <tr key={row.faculty}>
                    <td>{row.faculty}</td>
                    <td>{row.voted.toLocaleString('id-ID')}</td>
                    <td>{row.total.toLocaleString('id-ID')}</td>
                    <td>{percent}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </article>
      </section>

      <section className="card tps-card">
        <div className="card-header">
          <h2>Status TPS</h2>
          <button className="btn-link" type="button" onClick={() => (window.location.href = '/tps-panel')}>
            Buka Panel TPS →
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>TPS</th>
              <th>Lokasi</th>
              <th>Suara Masuk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tps.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.location}</td>
                <td>{row.votes.toLocaleString('id-ID')}</td>
                <td>
                  <span className={`status-pill ${row.status}`}>{row.status === 'active' ? '✔ Aktif' : row.status === 'issue' ? '⚠ Lambat' : 'Tutup'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card info-grid">
        <div>
          <h3>Tahap Saat Ini</h3>
          <p>Voting Berlangsung</p>
          <p>Live Count Publik: {publicLiveEnabled ? 'Aktif (Sementara)' : 'Dimatikan'}</p>
          <button className="btn-outline" type="button" onClick={() => setPublicLiveEnabled((prev) => !prev)}>
            {publicLiveEnabled ? 'Matikan Live Count Publik' : 'Aktifkan Live Count Publik'}
          </button>
        </div>
        <div>
          <h3>Log Aktivitas Terbaru</h3>
          <ul>
            {logs.slice(0, 3).map((log) => (
              <li key={log.id}>
                <strong>{log.timestamp}</strong> – {log.message}
              </li>
            ))}
          </ul>
          <button className="btn-link" type="button">
            Lihat Log Lengkap
          </button>
        </div>
        <div>
          <h3>Kontrol Hasil Final</h3>
          <p>Voting Ditutup: {summary.statusType === 'running' ? 'Belum' : 'Sudah'}</p>
          <p>Suara Terkunci: {publicLiveEnabled ? 'Belum' : 'Sudah'}</p>
          <button className="btn-danger" type="button" disabled={summary.statusType === 'running'}>
            Kunci Hasil Akhir
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminMonitoringLiveCount
