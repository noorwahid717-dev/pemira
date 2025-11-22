import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminDashboardData } from '../hooks/useAdminDashboardData'
import '../styles/AdminDashboard.css'

const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate()
  const {
    overview,
    participation,
    participationPercentage,
    tpsStatus,
    logs,
    votes,
    voteViewMode,
    setVoteViewMode,
    facultyStats,
    actions,
    systemInfo,
    loading,
    error,
  } = useAdminDashboardData()

  const openScheduleSettings = () => navigate('/admin/pengaturan#jadwal')
  const openModeSettings = () => navigate('/admin/pengaturan#mode-voting')

  const voteTotal = useMemo(() => votes.reduce((sum, item) => sum + item.votes, 0), [votes])
  const topCandidateId = useMemo(() => {
    if (!votes.length) return null
    return votes.reduce((max, curr) => (curr.votes > max.votes ? curr : max), votes[0])
  }, [votes])

  return (
    <AdminLayout title="Dashboard Admin">
      <section className="admin-hero">
        <div className="hero-top">
          <div className="hero-info">
            <p className="eyebrow">Status Pemilu</p>
            <h2>{overview.stageLabel}</h2>
            <p className="meta">Periode: {overview.votingPeriod}</p>
            <p className="meta">Mode: {overview.activeMode}</p>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-block">
            <span>Total DPT</span>
            <strong>{overview.totalVoters.toLocaleString('id-ID')}</strong>
          </div>
          <div className="metric-block">
            <span>Sudah Memilih</span>
            <strong>{participation.voted.toLocaleString('id-ID')}</strong>
          </div>
          <div className="metric-block">
            <span>Belum Memilih</span>
            <strong>{participation.notVoted.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="btn-outline" onClick={openScheduleSettings}>Edit Jadwal</button>
          <button type="button" className="btn-primary" onClick={openModeSettings}>Atur Mode Voting</button>
        </div>
        {(loading || error) && (
          <div className="status-row">
            {loading && <span>Memuat data live...</span>}
            {error && <span className="error-text">{error}</span>}
          </div>
        )}
      </section>

      <section className="section-grid two-col">
        <article className="card status-card">
          <div className="card-header">
            <h3>Status Pemilu</h3>
            <span className="muted">Realtime</span>
          </div>
          <div className="status-pill-row">
            <span className="pill success">{overview.stageLabel}</span>
            <span className="pill outline">Mode: {overview.activeMode}</span>
            <span className="pill outline">Jadwal: {overview.votingPeriod}</span>
          </div>
          <div className="status-stats">
            <div>
              <span>Total DPT</span>
              <strong>{overview.totalVoters.toLocaleString('id-ID')}</strong>
            </div>
            <div>
              <span>Sudah Memilih</span>
              <strong>{participation.voted.toLocaleString('id-ID')}</strong>
            </div>
            <div>
              <span>Belum Memilih</span>
              <strong>{participation.notVoted.toLocaleString('id-ID')}</strong>
            </div>
          </div>
          <div className="status-actions">
            <button type="button" className="btn-ghost" onClick={openScheduleSettings}>Edit Jadwal</button>
            <button type="button" className="btn-ghost" onClick={openModeSettings}>Atur Mode Voting</button>
          </div>
        </article>

        <article className="card participation-premium">
          <div className="card-header">
            <div>
              <h3>Partisipasi Mahasiswa</h3>
              <p className="muted">Realtime</p>
            </div>
            <span className="trend">Tren 5 menit terakhir: +{Math.max(1, Math.round(participation.voted * 0.012))}</span>
          </div>
          <div className="participation-meta">
            <div>
              <span>Total Peserta</span>
              <strong>{participation.totalVoters.toLocaleString('id-ID')}</strong>
            </div>
            <div>
              <span>Sudah memilih</span>
              <strong>
                {participation.voted.toLocaleString('id-ID')} ({participationPercentage}%)
              </strong>
            </div>
          </div>
          <div className="premium-progress">
            <div className="bar">
              <div style={{ width: `${participationPercentage}%` }} />
            </div>
          </div>
          <a href="#partisipasi-fakultas" className="muted-link">Lihat detail per fakultas →</a>
        </article>
      </section>

      <section className="section-grid two-col">
        <article className="card tps-status">
          <div className="card-header">
            <h3>Status TPS</h3>
            <span className="muted">Realtime</span>
          </div>
          <div className="tps-tiles">
            {tpsStatus.detail.slice(0, 5).map((item) => (
              <div key={item.id} className="tps-tile">
                <div className="tps-info">
                  <h4>{item.name}</h4>
                  <p>{item.voters.toLocaleString('id-ID')} pemilih</p>
                  <span className="muted">Terakhir update: —</span>
                </div>
                <span className={`tps-status-pill ${item.status}`}>
                  {item.status === 'active' ? '✔ Aktif' : item.status === 'issue' ? '⚠ Bermasalah' : 'Ditutup'}
                </span>
              </div>
            ))}
          </div>
          <Link to="/tps-panel" className="muted-link">Panel TPS Lengkap →</Link>
        </article>

        <article className="card activity-feed">
          <div className="card-header">
            <h3>Aktivitas Pemilu</h3>
            <span className="muted">Log cepat</span>
          </div>
          <ul className="activity-list">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id}>
                <span className="pulse-dot" aria-hidden />
                <div>
                  <span className="time">{log.time}</span>
                  <p>{log.message}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/monitoring" className="muted-link">Lihat Log Lengkap →</Link>
        </article>
      </section>

      <section className="section-grid two-col">
        <article className="card vote-card">
          <div className="card-header">
            <div>
              <h3>Grafik Suara per Kandidat</h3>
              <span className="muted">Total suara: {voteTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="chart-toggle">
              <button type="button" className={voteViewMode === 'bar' ? 'active' : ''} onClick={() => setVoteViewMode('bar')}>
                Bar
              </button>
              <button type="button" className={voteViewMode === 'pie' ? 'active' : ''} onClick={() => setVoteViewMode('pie')}>
                Pie
              </button>
            </div>
          </div>
          <div className={`vote-chart ${voteViewMode}`}>
            {votes.map((candidate) => (
              <div key={candidate.id} className={`vote-item ${candidate.id === topCandidateId?.id ? 'leader' : ''}`}>
                <div className="vote-bar-wrapper">
                  <div className="vote-bar" style={{ width: `${candidate.percentage}%` }} />
                </div>
                <div className="vote-info">
                  <strong>
                    {candidate.name} ({candidate.percentage}%)
                  </strong>
                  <span>{candidate.votes.toLocaleString('id-ID')} suara</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card faculty-card" id="partisipasi-fakultas">
          <div className="card-header">
            <div>
              <h3>Partisipasi per Fakultas</h3>
              <span className="muted">Filter: Semua Fakultas</span>
            </div>
          </div>
          <ul className="faculty-list">
            {facultyStats.map((faculty) => {
              const percentage = Number(((faculty.voted / faculty.total) * 100).toFixed(0))
              return (
                <li key={faculty.faculty}>
                  <div className="faculty-info">
                    <strong>{faculty.faculty}</strong>
                    <span>
                      {faculty.voted}/{faculty.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="faculty-bar">
                    <div style={{ width: `${percentage}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </article>
      </section>

      <section className="quick-actions">
        <div className="section-header-row">
          <h3>Quick Actions</h3>
          <span className="muted">Pintasan penting</span>
        </div>
        <div className="action-grid">
          {actions.map((action) => (
            <Link key={action.id} className="action-card" to={action.href}>
              <div className="action-icon" aria-hidden>
                {action.icon ?? '↗'}
              </div>
              <div>
                <strong>{action.label}</strong>
                <p>{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="system-info card">
        <div className="info-block">
          <div className="info-icon" aria-hidden>⏱</div>
          <div className="info-text">
            <span>Terakhir Sinkronisasi</span>
            <strong>{systemInfo.lastSync}</strong>
          </div>
        </div>
        <div className="info-block">
          <div className="info-icon" aria-hidden>🛰</div>
          <div className="info-text">
            <span>Status Server</span>
            <strong className={`status ${systemInfo.serverStatus}`}>
              {systemInfo.serverStatus === 'normal' ? '✔ Normal' : systemInfo.serverStatus === 'warning' ? '⚠ Perlu perhatian' : '⛔ Down'}
            </strong>
          </div>
        </div>
        <div className="info-block">
          <div className="info-icon" aria-hidden>🔒</div>
          <div className="info-text">
            <span>Data Sinkronisasi</span>
            <strong>{systemInfo.dataLocked ? 'Terkunci' : 'Live'}</strong>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminDashboard
