import { useEffect, useState, type JSX } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import EmptyState from '../components/shared/EmptyState'
import { fetchPublicCandidateDetail, fetchPublicCandidates } from '../services/publicCandidates'
import { fetchCurrentElection } from '../services/publicElection'
import type { CandidateDetail } from '../types/voting'
import '../styles/DetailKandidat.css'

type TabId = 'visi' | 'program' | 'pengalaman' | 'kampanye'

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'visi', label: 'Visi & Misi' },
  { id: 'program', label: 'Program Kerja' },
  { id: 'pengalaman', label: 'Pengalaman' },
  { id: 'kampanye', label: 'Materi Kampanye' },
]

const toEmbedUrl = (raw?: string | null): string => {
  if (!raw) return ''
  const url = raw.trim()
  if (!url) return ''
  if (url.includes('youtube.com/embed/')) return url
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '').trim()
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
  } catch {
    // ignore
  }
  return url.replace('watch?v=', 'embed/')
}

const DetailKandidat = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const candidateId = Number(id)
  const isDashboardContext = location.pathname.startsWith('/dashboard')
  const backPath = isDashboardContext ? '/dashboard/kandidat' : '/kandidat'

  const [activeTab, setActiveTab] = useState<TabId>('visi')
  const [showStickyButton, setShowStickyButton] = useState(false)

  const [kandidat, setKandidat] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailFallbackMessage, setDetailFallbackMessage] = useState<string | null>(null)
  const [electionYear, setElectionYear] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchCurrentElection({ signal: controller.signal })
      .then((election) => setElectionYear(election.year))
      .catch((err) => console.debug('Failed to fetch current election year', err))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (Number.isNaN(candidateId)) {
      setError('ID kandidat tidak valid')
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setDetailFallbackMessage(null)
    fetchPublicCandidateDetail(candidateId, { signal: controller.signal })
      .then((detail) => {
        const mapped: CandidateDetail = {
          id: detail.id,
          nomorUrut: detail.number,
          nama: detail.name,
          fakultas: detail.faculty_name ?? 'Fakultas',
          prodi: detail.study_program_name ?? '',
          angkatan: detail.cohort_year?.toString() ?? '',
          foto: detail.photo_url ?? '',
          tagline: detail.tagline ?? '',
          verified: true,
          visi: detail.vision ?? '',
          misi: detail.missions ?? [],
          programKerja: (detail.main_programs ?? []).map((prog, index) => ({
            id: index + 1,
            title: prog.title,
            description: prog.description,
          })),
          pengalaman: [],
          kampanye: {
            videoUrl: toEmbedUrl(detail.media?.video_url),
            posterUrl: detail.media?.gallery_photos?.[0] ?? '',
            pdfUrl: detail.media?.document_manifesto_url ?? '',
          },
        }
        setKandidat(mapped)
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setDetailFallbackMessage(
          (err as any)?.status === 404
            ? 'Detail kandidat belum tersedia di publik (API mengembalikan 404).'
            : 'Detail kandidat gagal dimuat, menampilkan data dasar.',
        )
        fetchPublicCandidates({ signal: controller.signal })
          .then((list) => {
            const fallback = list.find((item) => item.id === candidateId)
            if (fallback) {
              setKandidat({
                id: fallback.id,
                nomorUrut: fallback.nomorUrut,
                nama: fallback.nama,
                fakultas: fallback.fakultas,
                prodi: fallback.prodi,
                angkatan: fallback.angkatan,
                foto: fallback.foto,
                tagline: '',
                verified: false,
                visi: '',
                misi: [],
                programKerja: [],
                pengalaman: [],
                kampanye: { videoUrl: '', posterUrl: '', pdfUrl: '' },
              })
              setError(null)
            } else {
              setError('Kandidat tidak ditemukan')
              setKandidat(null)
            }
          })
          .catch(() => {
            setError('Kandidat tidak ditemukan')
            setKandidat(null)
          })
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [candidateId])

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="detail-kandidat-page">
        <Header />
        <main className="detail-main">
          <div className="detail-container">
            <p className="loading-text">Memuat kandidat...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!kandidat) {
    return (
      <div className="detail-kandidat-page">
        <Header />
        <main className="detail-main">
          <div className="detail-container">
            <EmptyState
              title="Kandidat tidak ditemukan"
              description={error ?? 'Kandidat yang Anda cari tidak tersedia atau sudah dihapus.'}
              action={{ label: 'Kembali ke Daftar Kandidat', onClick: () => navigate(backPath) }}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="detail-kandidat-page">
      <Header />

      <main className="detail-main">
        <div className="detail-container">
          <button className="btn-back" onClick={() => navigate(backPath)}>
            <span className="back-icon">←</span>
            <span>Kembali ke Daftar Kandidat</span>
          </button>

          <div className="kandidat-hero">
            <div className="hero-left">
              <div className="kandidat-photo-large">
                {kandidat.foto ? (
                  <img src={kandidat.foto} alt={`Foto ${kandidat.nama}`} loading="lazy" />
                ) : (
                  <div className="photo-placeholder-large">{kandidat.nama.charAt(0)}</div>
                )}
              </div>

              <div className="kandidat-identity">
                <div className="identity-nomor">
                  <span className="nomor-label-small">No. Urut</span>
                  <span className="nomor-value-large">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-badge">Calon Ketua BEM {electionYear ?? 2026}</div>
              <h1 className="identity-nama">{kandidat.nama}</h1>
              <p className="identity-fakultas">{kandidat.fakultas}</p>
              <p className="identity-detail">
                {kandidat.prodi} • Angkatan {kandidat.angkatan}
              </p>
              {kandidat.tagline && <p className="hero-tagline">"{kandidat.tagline}"</p>}

              {kandidat.verified && (
                <div className="verification-badge">
                  <span className="verify-icon">✓</span>
                  <span>Diverifikasi Panitia</span>
                </div>
              )}

              {!kandidat.verified && detailFallbackMessage && (
                <div className="verification-badge" style={{ background: '#fef9c3', borderColor: '#fde047', color: '#854d0e' }}>
                  <span>ℹ</span>
                  <span>{detailFallbackMessage}</span>
                </div>
              )}
            </div>
          </div>

          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'visi' && (
            <section className="tab-section" key="visi">
              <h3>Visi</h3>
              <p className="visi-text">{kandidat.visi || 'Visi belum tersedia.'}</p>

              <h3>Misi</h3>
              {kandidat.misi.length > 0 ? (
                <ul className="misi-list">
                  {kandidat.misi.map((misi, index) => (
                    <li key={`${misi}-${index}`}>
                      <span className="misi-number">{index + 1}</span>
                      <p>{misi}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-content">Misi belum tersedia.</p>
              )}
            </section>
          )}

          {activeTab === 'program' && (
            <section className="tab-section" key="program">
              <h3>Program Kerja Unggulan</h3>
              {kandidat.programKerja.length > 0 ? (
                <div className="program-grid">
                  {kandidat.programKerja.map((program, index) => (
                    <div key={program.id} className="program-card" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="program-icon">🎯</div>
                      <h4>{program.title}</h4>
                      <p>{program.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-content">Program kerja belum tersedia.</p>
              )}
            </section>
          )}

          {activeTab === 'pengalaman' && (
            <section className="tab-section" key="pengalaman">
              <h3>Pengalaman Organisasi</h3>
              {kandidat.pengalaman.length > 0 ? (
                <div className="experience-timeline">
                  {kandidat.pengalaman.map((item, index) => (
                    <div key={`${item.tahun}-${item.posisi}`} className="experience-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="experience-year">{item.tahun}</div>
                      <div className="experience-content">
                        <h4>{item.posisi}</h4>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-content">Pengalaman organisasi belum tersedia.</p>
              )}
            </section>
          )}

          {activeTab === 'kampanye' && (
            <section className="tab-section" key="kampanye">
              <h3>Materi Kampanye</h3>
              <div className="kampanye-media">
                {kandidat.kampanye.videoUrl && (
                  <div className="kampanye-video">
                    <iframe
                      title={`Video ${kandidat.nama}`}
                      src={kandidat.kampanye.videoUrl}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="kampanye-files">
                  {kandidat.kampanye.posterUrl && (
                    <a href={kandidat.kampanye.posterUrl} className="kampanye-link" target="_blank" rel="noopener noreferrer">
                      📄 Poster Kampanye
                    </a>
                  )}
                  {kandidat.kampanye.pdfUrl && (
                    <a href={kandidat.kampanye.pdfUrl} className="kampanye-link" target="_blank" rel="noopener noreferrer">
                      📘 Program Kerja Lengkap (PDF)
                    </a>
                  )}
                  {!kandidat.kampanye.videoUrl && !kandidat.kampanye.posterUrl && !kandidat.kampanye.pdfUrl && (
                    <p className="empty-content">Materi kampanye belum tersedia.</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {showStickyButton && (
          <div className="sticky-cta">
            <button className="btn-primary btn-large" onClick={() => navigate('/login')} type="button">
              Login untuk Memilih
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default DetailKandidat
