import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import type { TPSStatus } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const AdminTPSList = (): JSX.Element => {
  const navigate = useNavigate()
  const { tpsList } = useTPSAdminStore()
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<TPSStatus | 'all'>('all')

  const areaOptions = useMemo(() => ['all', ...new Set(tpsList.map((tps) => tps.fakultasArea))], [tpsList])

  const filteredList = useMemo(() => {
    return tpsList.filter((tps) => {
      const matchesSearch = [tps.nama, tps.kode, tps.lokasi].some((field) => field.toLowerCase().includes(search.toLowerCase()))
      const matchesArea = areaFilter === 'all' || tps.fakultasArea === areaFilter
      const matchesStatus = statusFilter === 'all' || tps.status === statusFilter
      return matchesSearch && matchesArea && matchesStatus
    })
  }, [areaFilter, search, statusFilter, tpsList])

  return (
    <div className="admin-tps-page">
      <div className="page-header">
        <div>
          <h1>Manajemen TPS</h1>
          <p>Kelola seluruh Tempat Pemungutan Suara (TPS) untuk PEMIRA UNIWA.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => navigate('/admin/tps/tambah')}>
          + Tambah TPS
        </button>
      </div>

      <div className="filters">
        <input type="search" placeholder="Cari nama TPS / lokasi / kode" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
          {areaOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'Semua Fakultas / Area' : option}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TPSStatus | 'all')}>
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="closed">Ditutup</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama TPS</th>
              <th>Kode</th>
              <th>Lokasi</th>
              <th>Jam</th>
              <th>Status</th>
              <th>Suara</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  Belum ada TPS yang cocok.
                </td>
              </tr>
            )}
            {filteredList.map((tps) => (
              <tr key={tps.id}>
                <td>
                  <strong>{tps.nama}</strong>
                  <p>{tps.fakultasArea}</p>
                </td>
                <td>{tps.kode}</td>
                <td>{tps.lokasi}</td>
                <td>
                  {tps.jamBuka} – {tps.jamTutup}
                </td>
                <td>
                  <span className={`status-chip ${tps.status}`}>
                    {tps.status === 'active' ? 'Aktif' : tps.status === 'draft' ? 'Draft' : 'Ditutup'}
                  </span>
                </td>
                <td>{tps.totalSuara.toLocaleString('id-ID')}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-table" type="button" onClick={() => navigate(`/admin/tps/${tps.id}`)}>
                      Detail
                    </button>
                    <button className="btn-table" type="button" onClick={() => navigate(`/admin/tps/${tps.id}/edit`)}>
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminTPSList
