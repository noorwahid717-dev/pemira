import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDPTAdminStore } from '../hooks/useDPTAdminStore'
import type { AcademicStatus, VoterStatus } from '../types/dptAdmin'
import '../styles/AdminDPT.css'

const statusSuaraLabels: Record<VoterStatus, string> = {
  belum: 'Belum',
  sudah: 'Sudah',
}

const akademikLabels: Record<AcademicStatus, string> = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Nonaktif',
}

const AdminDPTList = (): JSX.Element => {
  const navigate = useNavigate()
  const { voters, filters, setFilters, selected, toggleSelect, selectAll, clearSelection } = useDPTAdminStore()

  const fakultasOptions = useMemo(() => ['all', ...new Set(voters.map((voter) => voter.fakultas))], [voters])
  const angkatanOptions = useMemo(() => ['all', ...new Set(voters.map((voter) => voter.angkatan))], [voters])

  const filteredVoters = useMemo(() => {
    return voters.filter((voter) => {
      const matchesSearch = [voter.nim, voter.nama, voter.prodi].some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
      const matchesFakultas = filters.fakultas === 'all' || voter.fakultas === filters.fakultas
      const matchesAngkatan = filters.angkatan === 'all' || voter.angkatan === filters.angkatan
      const matchesStatus = filters.statusSuara === 'all' || voter.statusSuara === filters.statusSuara
      const matchesAkademik = filters.akademik === 'all' || voter.akademik === filters.akademik
      return matchesSearch && matchesFakultas && matchesAngkatan && matchesStatus && matchesAkademik
    })
  }, [filters, voters])

  const handleSelectAll = () => {
    if (filteredVoters.every((voter) => selected.has(voter.id))) {
      clearSelection()
    } else {
      selectAll(filteredVoters.map((voter) => voter.id))
    }
  }

  return (
    <div className="admin-dpt-page">
      <div className="page-header">
        <div>
          <h1>Daftar Pemilih (DPT)</h1>
          <p>Kelola data pemilih sah PEMIRA UNIWA, termasuk status hak suara.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" type="button" onClick={() => navigate('/admin/dpt/import')}>
            + Import DPT
          </button>
          <button className="btn-primary" type="button" onClick={() => alert('Export data (simulasi)')}>
            Export Data
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Cari NIM / Nama / Email"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <select value={filters.fakultas} onChange={(event) => setFilters((prev) => ({ ...prev, fakultas: event.target.value }))}>
          {fakultasOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'Semua Fakultas' : option}
            </option>
          ))}
        </select>
        <select value={filters.angkatan} onChange={(event) => setFilters((prev) => ({ ...prev, angkatan: event.target.value }))}>
          {angkatanOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'Semua Angkatan' : option}
            </option>
          ))}
        </select>
        <select value={filters.statusSuara} onChange={(event) => setFilters((prev) => ({ ...prev, statusSuara: event.target.value as VoterStatus | 'all' }))}>
          <option value="all">Status Suara: Semua</option>
          <option value="belum">Belum Memilih</option>
          <option value="sudah">Sudah Memilih</option>
        </select>
        <select value={filters.akademik} onChange={(event) => setFilters((prev) => ({ ...prev, akademik: event.target.value as AcademicStatus | 'all' }))}>
          <option value="all">Status Akademik: Semua</option>
          <option value="aktif">Aktif</option>
          <option value="cuti">Cuti</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      <div className="mass-actions">
        <label>
          <input type="checkbox" checked={filteredVoters.every((voter) => selected.has(voter.id)) && filteredVoters.length > 0} onChange={handleSelectAll} />
          Pilih semua di halaman
        </label>
        <select>
          <option>Aksi Massal</option>
          <option>Set Non-Aktif</option>
          <option>Reset Status Suara</option>
          <option>Hapus dari DPT</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th />
              <th>NIM</th>
              <th>Nama</th>
              <th>Fakultas / Prodi</th>
              <th>Angkatan</th>
              <th>Akademik</th>
              <th>Status Suara</th>
              <th>Metode</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredVoters.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-state">
                  Tidak ada data pemilih.
                </td>
              </tr>
            )}
            {filteredVoters.map((voter) => (
              <tr key={voter.id}>
                <td>
                  <input type="checkbox" checked={selected.has(voter.id)} onChange={() => toggleSelect(voter.id)} />
                </td>
                <td>{voter.nim}</td>
                <td>{voter.nama}</td>
                <td>
                  {voter.fakultas} – {voter.prodi}
                </td>
                <td>{voter.angkatan}</td>
                <td>{akademikLabels[voter.akademik]}</td>
                <td>
                  <span className={`status-chip ${voter.statusSuara}`}>{statusSuaraLabels[voter.statusSuara]}</span>
                </td>
                <td>
                  {voter.metodeVoting}
                  {voter.waktuVoting && <small>{new Date(voter.waktuVoting).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>}
                </td>
                <td>
                  <button className="btn-table" type="button" onClick={() => navigate(`/admin/dpt/${voter.id}`)}>
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDPTList
