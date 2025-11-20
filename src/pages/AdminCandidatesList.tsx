import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import type { CandidateStatus } from '../types/candidateAdmin'
import '../styles/AdminCandidates.css'

const statusOptions: { value: CandidateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'draft', label: 'Draft' },
  { value: 'hidden', label: 'Disembunyikan' },
]

const AdminCandidatesList = (): JSX.Element => {
  const navigate = useNavigate()
  const { candidates, archiveCandidate } = useCandidateAdminStore()
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all')

  const facultyOptions = useMemo(() => {
    const faculties = Array.from(new Set(candidates.map((candidate) => candidate.faculty)))
    return ['all', ...faculties]
  }, [candidates])

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase())
      const matchesFaculty = facultyFilter === 'all' || candidate.faculty === facultyFilter
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      return matchesSearch && matchesFaculty && matchesStatus
    })
  }, [candidates, facultyFilter, search, statusFilter])

  const handleArchive = (id: string) => {
    if (!window.confirm('Arsipkan kandidat ini?')) return
    archiveCandidate(id)
  }

  return (
    <div className="admin-candidates-page">
      <div className="page-header">
        <div>
          <h1>Manajemen Kandidat</h1>
          <p>Kelola seluruh calon ketua BEM, termasuk foto, profil, visi-misi, dan program kerja.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => navigate('/admin/kandidat/tambah')}>
          + Tambah Kandidat
        </button>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Cari nama kandidat"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
          {facultyOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'Semua Fakultas' : option}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CandidateStatus | 'all')}>
          {statusOptions.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>No</th>
              <th>Nama</th>
              <th>Fakultas</th>
              <th>Status</th>
              <th>Konten</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  Belum ada kandidat yang cocok.
                </td>
              </tr>
            )}
            {filteredCandidates.map((candidate) => {
              const contentCount = candidate.missions.length + candidate.programs.length + (candidate.visionTitle ? 1 : 0)
              return (
                <tr key={candidate.id}>
                  <td>
                    <img src={candidate.photoUrl} alt={candidate.name} className="candidate-thumb" />
                  </td>
                  <td>{candidate.number.toString().padStart(2, '0')}</td>
                  <td>
                    <div className="candidate-name">
                      <strong>{candidate.name}</strong>
                      <span>{candidate.programStudi}</span>
                    </div>
                  </td>
                  <td>{candidate.faculty}</td>
                  <td>
                    <span className={`status-chip ${candidate.status}`}>
                      {candidate.status === 'active'
                        ? 'Aktif'
                        : candidate.status === 'draft'
                          ? 'Draft'
                          : 'Disembunyikan'}
                    </span>
                  </td>
                  <td>{contentCount} item</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/edit`)}>
                        Edit
                      </button>
                      <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/preview`)}>
                        Preview
                      </button>
                      <button className="btn-table danger" type="button" onClick={() => handleArchive(candidate.id)}>
                        Arsipkan
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCandidatesList
