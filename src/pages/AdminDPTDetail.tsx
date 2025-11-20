import { useNavigate, useParams } from 'react-router-dom'
import { useDPTAdminStore } from '../hooks/useDPTAdminStore'
import '../styles/AdminDPT.css'

const AdminDPTDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { voters } = useDPTAdminStore()
  const voter = voters.find((entry) => entry.id === id)

  if (!voter) {
    return (
      <div className="admin-dpt-page">
        <div className="empty-state card">
          <p>Data pemilih tidak ditemukan.</p>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/dpt')}>
            Kembali ke DPT
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dpt-page">
      <div className="page-header">
        <div>
          <h1>Detail Pemilih – {voter.nim}</h1>
          <p>{voter.nama}</p>
        </div>
        <button className="btn-link" type="button" onClick={() => navigate('/admin/dpt')}>
          ← Kembali
        </button>
      </div>

      <section className="card">
        <h2>Data Personal</h2>
        <ul>
          <li>
            <strong>Fakultas / Prodi:</strong> {voter.fakultas} – {voter.prodi}
          </li>
          <li>
            <strong>Angkatan:</strong> {voter.angkatan}
          </li>
          <li>
            <strong>Status Akademik:</strong> {voter.akademik}
          </li>
          <li>
            <strong>Email Kampus:</strong> {voter.nim}@uniwa.ac.id
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Status Hak Suara</h2>
        <p>Status Suara: {voter.statusSuara === 'sudah' ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'}</p>
        <p>Metode: {voter.metodeVoting}</p>
        {voter.waktuVoting && <p>Waktu Voting: {new Date(voter.waktuVoting).toLocaleString('id-ID')}</p>}
        {voter.metodeVoting.startsWith('TPS') && <p>TPS: {voter.metodeVoting}</p>}
        {voter.statusSuara === 'sudah' && <p>Token Hash: x81c-a91b-d33f</p>}
      </section>

      <section className="card warning">
        <h2>Aksi Admin</h2>
        <p>Peringatan: Aksi berikut hanya boleh dilakukan sesuai prosedur KPUM.</p>
        <div className="form-actions">
          <button className="btn-outline" type="button" onClick={() => alert('Reset status suara (simulasi)')}>
            Reset Status Suara
          </button>
          <button className="btn-danger" type="button" onClick={() => alert('Nonaktifkan pemilih (simulasi)')}>
            Nonaktifkan Pemilih
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminDPTDetail
