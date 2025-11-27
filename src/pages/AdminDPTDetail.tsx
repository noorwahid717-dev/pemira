import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useDPTAdminStore } from '../hooks/useDPTAdminStore'
import { useToast } from '../components/Toast'
import '../styles/AdminDPT.css'

const AdminDPTDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { voters } = useDPTAdminStore()
  const voter = voters.find((entry) => entry.id === id)
  const { showToast } = useToast()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetStatus = () => {
    // Simulate status reset
    showToast.success('Status suara berhasil direset.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNonaktifkanPemilih = () => {
    // Simulate voter deactivation
    showToast.success('Pemilih berhasil dinonaktifkan.')
  }

  if (!voter) {
    return (
      <AdminLayout title="Detail DPT">
        <div className="admin-dpt-page">
          <div className="empty-state card">
            <p>Data pemilih tidak ditemukan.</p>
            <button className="btn-primary" type="button" onClick={() => navigate('/admin/dpt')}>
              Kembali ke DPT
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Detail DPT">
      <div className="admin-dpt-page">
        <div className="page-header">
          <div>
            <h1>Detail Pemilih – {voter.nim}</h1>
            <p>{voter.nama}</p>
            <p className="inline-note">
              Tipe: {voter.tipe === 'dosen' ? 'Dosen' : voter.tipe === 'staf' ? 'Staf' : 'Mahasiswa'}
            </p>
          </div>
          <button className="btn-link" type="button" onClick={() => navigate('/admin/dpt')}>
            ← Kembali
          </button>
        </div>

        {(() => {
          const isMahasiswa = voter.tipe === 'mahasiswa'
          const isDosen = voter.tipe === 'dosen'
          const isStaf = voter.tipe === 'staf'
          const identifierLabel = isMahasiswa ? 'NIM' : isDosen ? 'NIDN' : isStaf ? 'NIP/NIY' : 'Identitas'
          const emailDisplay = voter.email || `${voter.nim}@uniwa.ac.id`
          const facultyLabel = isStaf ? 'Unit Kerja' : 'Fakultas'
          const programLabel = isMahasiswa ? 'Program Studi' : isDosen ? 'Departemen' : 'Bagian/Unit Detail'
          const facultyValue = isStaf ? (voter.fakultas || voter.prodi || '-') : voter.fakultas
          const programValue = isStaf ? (voter.prodi || voter.fakultas || '-') : voter.prodi
          
          return (
            <section className="card">
              <h2>Data Personal</h2>
              <ul>
                <li>
                  <strong>{identifierLabel}:</strong> {voter.nim}
                </li>
                <li>
                  <strong>Nama Lengkap:</strong> {voter.nama}
                </li>
                <li>
                  <strong>{facultyLabel}:</strong> {facultyValue || '-'}
                </li>
                {programValue && programValue !== '-' && (
                  <li>
                    <strong>{programLabel}:</strong> {programValue}
                  </li>
                )}
                {isMahasiswa && (
                  <>
                    {voter.angkatan && voter.angkatan !== '-' && (
                      <li>
                        <strong>Angkatan:</strong> {voter.angkatan}
                      </li>
                    )}
                    {voter.semester && (
                      <li>
                        <strong>Semester:</strong> {voter.semester}
                      </li>
                    )}
                    <li>
                      <strong>Status Akademik:</strong> {voter.akademik}
                    </li>
                  </>
                )}
                <li>
                  <strong>Email Kampus:</strong> {emailDisplay}
                </li>
              </ul>
            </section>
          )
        })()}

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
            <button className="btn-outline" type="button" onClick={() => showToast('Reset status suara (simulasi)', 'info')}>
              Reset Status Suara
            </button>
            <button className="btn-danger" type="button" onClick={() => showToast('Nonaktifkan pemilih (simulasi)', 'warning')}>
              Nonaktifkan Pemilih
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminDPTDetail
