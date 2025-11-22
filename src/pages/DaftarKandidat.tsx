import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import KandidatCard from '../components/shared/KandidatCard'
import { fetchPublicCandidates } from '../services/publicCandidates'
import type { Candidate } from '../types/voting'
import '../styles/DaftarKandidat.css'

type SortBy = 'nomor_urut' | 'nama'

const fakultasList = [
  'Semua',
  'Fakultas Teknik',
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Hukum',
  'Fakultas Pendidikan',
]

const DaftarKandidat = (): JSX.Element => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFakultas, setFilterFakultas] = useState<string>('Semua')
  const [sortBy, setSortBy] = useState<SortBy>('nomor_urut')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    fetchPublicCandidates({ signal: controller.signal })
      .then((items) => {
        setCandidates(items)
        setError(null)
      })
      .catch((err) => {
        console.error('Gagal memuat kandidat', err)
        setError('Menampilkan data sementara.')
        setCandidates([])
      })
    return () => controller.abort()
  }, [])

  const filteredCandidates = useMemo(() => {
    let filtered: Candidate[] = [...candidates]

    if (searchQuery) {
      const keyword = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (candidate) =>
          candidate.nama.toLowerCase().includes(keyword) ||
          candidate.fakultas.toLowerCase().includes(keyword) ||
          candidate.prodi.toLowerCase().includes(keyword),
      )
    }

    if (filterFakultas !== 'Semua') {
      filtered = filtered.filter((candidate) => candidate.fakultas === filterFakultas)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'nomor_urut') {
        return a.nomorUrut - b.nomorUrut
      }
      return a.nama.localeCompare(b.nama)
    })

    return filtered
  }, [candidates, filterFakultas, searchQuery, sortBy])

  const pemiraStatus = {
    periode: '2024',
    status: 'Kampanye',
    totalKandidat: candidates.length,
  }

  const goToCandidate = (id: number) => {
    navigate(`/kandidat/detail/${id}`)
  }

  return (
    <div className="kandidat-page">
      <Header />

      <main className="kandidat-main">
        <div className="kandidat-container">
          <button className="btn-back" onClick={() => navigate('/')}>
            <span className="back-icon">←</span>
            <span>Kembali ke Beranda</span>
          </button>

          <div className="page-header">
            <div className="page-header-content">
              <h1 className="page-title">Daftar Calon Ketua BEM</h1>
              <div className="page-meta">
                <span className="meta-item">Periode {pemiraStatus.periode}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">
                  Status: <strong>{pemiraStatus.status}</strong>
                </span>
              </div>
            </div>
            <div className="page-header-info">
              <div className="total-kandidat">
                <span className="total-number">{pemiraStatus.totalKandidat}</span>
                <span className="total-label">Kandidat</span>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari kandidat..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filterFakultas}
                onChange={(event) => setFilterFakultas(event.target.value)}
                className="filter-select"
              >
                {fakultasList.map((fakultas) => (
                  <option key={fakultas} value={fakultas}>
                    {fakultas === 'Semua' ? 'Semua Fakultas' : fakultas}
                  </option>
                ))}
              </select>

              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="filter-select">
                <option value="nomor_urut">Urutkan: Nomor Urut</option>
                <option value="nama">Urutkan: Nama A–Z</option>
              </select>
            </div>
          </div>

          {(searchQuery || filterFakultas !== 'Semua') && (
            <div className="results-info">
              {error && <p className="error-text">{error}</p>}
              {filteredCandidates.length > 0 ? <p>Menampilkan {filteredCandidates.length} kandidat</p> : <p>Tidak ada kandidat yang cocok dengan kriteria.</p>}
            </div>
          )}

          {filteredCandidates.length === 0 ? (
            <div className="empty-results">
              <p>Tidak ada kandidat yang ditemukan. Coba ubah filter pencarian.</p>
            </div>
          ) : (
            <div className="kandidat-grid">
              {filteredCandidates.map((candidate, index) => (
                <KandidatCard key={candidate.id} kandidat={candidate} onClick={goToCandidate} animationDelay={index * 0.1} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DaftarKandidat
