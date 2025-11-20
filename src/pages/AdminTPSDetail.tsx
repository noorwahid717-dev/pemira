import { useNavigate, useParams } from 'react-router-dom'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import '../styles/AdminTPS.css'

const AdminTPSDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById } = useTPSAdminStore()
  const tps = id ? getById(id) : undefined

  if (!tps) {
    return (
      <div className="admin-tps-page">
        <div className="empty-state card">
          <p>TPS tidak ditemukan.</p>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/tps')}>
            Kembali ke Manajemen TPS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-tps-page">
      <div className="page-header">
        <div>
          <h1>{tps.nama}</h1>
          <p>
            Kode: {tps.kode} · Status: <span className={`status-chip ${tps.status}`}>{tps.status}</span> · QR: {tps.qrId}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" type="button" onClick={() => navigate(`/admin/tps/${tps.id}/edit`)}>
            Edit TPS
          </button>
          <button className="btn-primary" type="button" onClick={() => (window.location.href = '/tps-panel')}>
            Buka Panel TPS
          </button>
        </div>
      </div>

      <section className="card detail-section">
        <h2>Informasi Utama</h2>
        <ul>
          <li>
            <strong>Lokasi:</strong> {tps.lokasi}
          </li>
          <li>
            <strong>Fakultas / Area:</strong> {tps.fakultasArea}
          </li>
          <li>
            <strong>Tanggal Voting:</strong> {tps.tanggalVoting}
          </li>
          <li>
            <strong>Jam Operasional:</strong> {tps.jamBuka} – {tps.jamTutup}
          </li>
          <li>
            <strong>Perkiraan Kapasitas:</strong> {tps.kapasitas}
          </li>
        </ul>
      </section>

      <section className="card detail-section">
        <h2>Statistik TPS</h2>
        <p>Total suara masuk: {tps.totalSuara.toLocaleString('id-ID')}</p>
        <p>Antrian saat ini: 3 pemilih (simulasi)</p>
      </section>

      <section className="card detail-section">
        <h2>Panitia TPS</h2>
        <ul>
          {tps.panitia.map((panitia) => (
            <li key={panitia.id}>
              {panitia.nama} – {panitia.peran}
            </li>
          ))}
          {tps.panitia.length === 0 && <li>Belum ada panitia ditambahkan.</li>}
        </ul>
      </section>

      <section className="card detail-section">
        <h2>QR TPS</h2>
        <p>ID QR: {tps.qrId}</p>
        <p>Status QR: {tps.qrStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}</p>
        <div className="qr-actions">
          <button className="btn-outline" type="button" onClick={() => alert('Preview QR (simulasi)')}>
            Preview QR
          </button>
          <button className="btn-primary" type="button" onClick={() => alert('Download QR (simulasi)')}>
            Download QR
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminTPSDetail
