import { useMemo } from 'react'
import { useAdminDashboardData } from '../hooks/useAdminDashboardData'
import '../styles/AdminDashboard.css'

const sidebarMenu = [
  'Dashboard Utama',
  'Manajemen Kandidat',
  'Daftar Pemilih (DPT)',
  'TPS Management',
  'Status Voting & Monitoring',
  'Pengumuman & Konten',
  'Pengaturan Pemilu',
  'Log Aktivitas',
  'Admin & Panitia',
]

const AdminDashboard = (): JSX.Element => {
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
  } = useAdminDashboardData()

  const voteTotal = useMemo(() => votes.reduce((sum, item) => sum + item.votes, 0), [votes])

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">PEMIRA UNIWA</div>
        <nav>
          <ul>
            {sidebarMenu.map((item) => (
              <li key={item}>
                <a href="#" className={item === 'Dashboard Utama' ? 'active' : ''}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="header-label">PEMIRA UNIWA</p>
            <h1>Admin Panel</h1>
          </div>
          <div className="admin-user">
            <button type="button">Admin: Dwi Rahma <span>▼</span></button>
            <div className="user-dropdown">
              <a href="#profil">Profil admin</a>
              <a href="#password">Ganti password</a>
              <button type="button" onClick={() => window.alert('Logout admin...')}>Logout</button>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <section className="hero-card">
            <div>
              <p className="status-label">Status Pemilu</p>
              <h2>{overview.stageLabel}</h2>
              <p className="meta">Periode voting: {overview.votingPeriod}</p>
            </div>
            <div className="hero-stats">
              <div>
                <span>Kandidat</span>
                <strong>{overview.totalCandidates}</strong>
              </div>
              <div>
                <span>Total Pemilih (DPT)</span>
                <strong>{overview.totalVoters.toLocaleString('id-ID')}</strong>
              </div>
              <div>
                <span>Mode Voting Aktif</span>
                <strong>{overview.activeMode}</strong>
              </div>
            </div>
            <div className="hero-actions">
              <button type="button" className="btn-outline">
                Edit Jadwal Pemilu
              </button>
              <button type="button" className="btn-primary">
                Atur Mode Voting
              </button>
            </div>
          </section>

          <section className="grid cards">
            <article className="card participation-card">
              <div className="card-header">
                <h3>Partisipasi Mahasiswa</h3>
                <span>Real-time</span>
              </div>
              <div className="participation-stats">
                <div>
                  <span>Total DPT</span>
                  <strong>{participation.totalVoters.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span>Sudah memilih</span>
                  <strong>{participation.voted.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span>Belum memilih</span>
                  <strong>{participation.notVoted.toLocaleString('id-ID')}</strong>
                </div>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${participationPercentage}%` }} />
              </div>
              <p className="progress-label">{participationPercentage}%</p>
              <a href="#detail" className="link">
                Lihat detail per fakultas →
              </a>
            </article>

            <article className="card tps-card">
              <div className="card-header">
                <h3>Status TPS</h3>
                <span>Real-time</span>
              </div>
              <div className="tps-summary">
                <div>
                  <span>TPS Aktif</span>
                  <strong>
                    {tpsStatus.active}/{tpsStatus.total}
                  </strong>
                </div>
                <div>
                  <span>TPS Bermasalah</span>
                  <strong>{tpsStatus.issue}</strong>
                </div>
                <div>
                  <span>TPS Ditutup</span>
                  <strong>{tpsStatus.closed}</strong>
                </div>
              </div>
              <ul className="tps-list">
                {tpsStatus.detail.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.voters.toLocaleString('id-ID')} pemilih</span>
                    </div>
                    <span className={`status-dot ${item.status}`}>
                      {item.status === 'active' ? '✔ Aktif' : item.status === 'issue' ? '⚠' : 'Tutup'}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="/tps-panel" className="link">
                Lihat Panel TPS Lengkap →
              </a>
            </article>

            <article className="card activity-card">
              <div className="card-header">
                <h3>Aktivitas Pemilu</h3>
                <span>Log cepat</span>
              </div>
              <ul className="activity-list">
                {logs.map((log) => (
                  <li key={log.id}>
                    <span className="time">{log.time}</span>
                    <p>{log.message}</p>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-link">
                Lihat Log Lengkap →
              </button>
            </article>
          </section>

          <section className="grid charts">
            <article className="card vote-card">
              <div className="card-header">
                <div>
                  <h3>Grafik Suara per Kandidat</h3>
                  <span>Total suara: {voteTotal.toLocaleString('id-ID')}</span>
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
                  <div key={candidate.id} className="vote-item">
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

            <article className="card faculty-card">
              <div className="card-header">
                <div>
                  <h3>Partisipasi per Fakultas</h3>
                  <span>Filter: Semua Fakultas</span>
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
            <h3>Quick Actions</h3>
            <div className="action-grid">
              {actions.map((action) => (
                <a key={action.id} className="action-card" href={action.href}>
                  <strong>{action.label}</strong>
                  <p>{action.description}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="system-info card">
            <div>
              <span>Server Status</span>
              <strong className={`status ${systemInfo.serverStatus}`}>{systemInfo.serverStatus === 'normal' ? '✔ Normal' : '⚠ Perlu perhatian'}</strong>
            </div>
            <div>
              <span>Terakhir Sinkronisasi</span>
              <strong>{systemInfo.lastSync}</strong>
            </div>
            <div>
              <span>Data Terkunci</span>
              <strong>{systemInfo.dataLocked ? 'Ya (Voting selesai)' : 'Belum (Voting aktif)'}</strong>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
