import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import { getCandidateById } from '../data/mockCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import type { CandidateDetail } from '../types/voting'
import '../styles/DetailKandidat.css'

type TabId = 'visi' | 'program' | 'pengalaman' | 'kampanye'

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'visi', label: 'Visi & Misi' },
  { id: 'program', label: 'Program Kerja' },
  { id: 'pengalaman', label: 'Pengalaman' },
  { id: 'kampanye', label: 'Materi Kampanye' },
]

const DetailKandidat = (): JSX.Element => {
  const navigate = useNavigate()
  const { id } = useParams()
  const candidateId = Number(id)
  const { session, mahasiswa } = useVotingSession()

  const [activeTab, setActiveTab] = useState<TabId>('visi')
  const [showStickyButton, setShowStickyButton] = useState(false)

  const kandidat: CandidateDetail | null = useMemo(() => {
    if (Number.isNaN(candidateId)) return null
    return getCandidateById(candidateId)
  }, [candidateId])

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const hasVoted = session?.hasVoted ?? false
  const votingStatus = session?.votingStatus ?? 'open'

  const handlePilihKandidat = () => {
    if (hasVoted || votingStatus !== 'open' || !kandidat) return
    const confirmed = window.confirm(`Anda akan memilih:\n\nNo. ${kandidat.nomorUrut} - ${kandidat.nama}\n\nApakah Anda yakin?`)
    if (confirmed) {
      navigate('/voting')
    }
  }

  if (!kandidat) {
    return (
      <div className="detail-kandidat-page">
        <PageHeader title="Daftar Kandidat" user={mahasiswa} />
        <main className="detail-main">
          <div className="detail-container">
            <EmptyState
              title="Kandidat tidak ditemukan"
              description="Kandidat yang Anda cari tidak tersedia atau sudah dihapus."
              action={{ label: 'Kembali ke Daftar Kandidat', onClick: () => navigate('/kandidat') }}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="detail-kandidat-page">
      <PageHeader title="Daftar Kandidat" user={mahasiswa} />

      <main className="detail-main">
        <div className="detail-container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/kandidat')} type="button">
              ◀ Kembali ke Daftar Kandidat
            </button>
          </div>

          <div className="kandidat-hero">
            <div className="hero-left">
              <div className="kandidat-photo-large">
                <div className="photo-placeholder-large">{kandidat.foto}</div>
              </div>

              <div className="kandidat-identity">
                <div className="identity-nomor">
                  <span className="nomor-label-small">No. Urut</span>
                  <span className="nomor-value-large">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
                </div>
                <h2 className="identity-nama">{kandidat.nama}</h2>
                <p className="identity-fakultas">{kandidat.fakultas}</p>
                <p className="identity-detail">
                  {kandidat.prodi} • Angkatan {kandidat.angkatan}
                </p>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-badge">Calon Ketua BEM 2024</div>
              <h1 className="hero-tagline">{kandidat.tagline}</h1>

              {votingStatus === 'open' && (
                <button
                  className={`btn-pilih-kandidat ${hasVoted ? 'disabled' : ''}`}
                  onClick={handlePilihKandidat}
                  type="button"
                  disabled={hasVoted}
                >
                  {hasVoted ? '✓ Anda Sudah Memilih' : 'Pilih Kandidat Ini'}
                </button>
              )}

              {kandidat.verified && (
                <div className="verification-badge">
                  <span className="verify-icon">✓</span>
                  <span>Diverifikasi Panitia</span>
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
            <section className="tab-section">
              <h3>Visi</h3>
              <p className="visi-text">{kandidat.visi}</p>

              <h3>Misi</h3>
              <ul className="misi-list">
                {kandidat.misi.map((misi, index) => (
                  <li key={misi}>
                    <span className="misi-number">{index + 1}</span>
                    <p>{misi}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'program' && (
            <section className="tab-section">
              <h3>Program Kerja Unggulan</h3>
              <div className="program-grid">
                {kandidat.programKerja.map((program) => (
                  <div key={program.id} className="program-card">
                    <div className="program-icon">🎯</div>
                    <h4>{program.title}</h4>
                    <p>{program.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'pengalaman' && (
            <section className="tab-section">
              <h3>Pengalaman Organisasi</h3>
              <div className="experience-timeline">
                {kandidat.pengalaman.map((item) => (
                  <div key={`${item.tahun}-${item.posisi}`} className="experience-item">
                    <div className="experience-year">{item.tahun}</div>
                    <div className="experience-content">
                      <h4>{item.posisi}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'kampanye' && (
            <section className="tab-section">
              <h3>Materi Kampanye</h3>
              <div className="kampanye-media">
                <div className="kampanye-video">
                  <iframe
                    title={`Video ${kandidat.nama}`}
                    src={kandidat.kampanye.videoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="kampanye-files">
                  <a href={kandidat.kampanye.posterUrl} className="kampanye-link">
                    📄 Poster Kampanye
                  </a>
                  <a href={kandidat.kampanye.pdfUrl} className="kampanye-link">
                    📘 Program Kerja Lengkap (PDF)
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>

        {showStickyButton && votingStatus === 'open' && (
          <div className="sticky-cta">
            <button className="btn-primary btn-large" onClick={handlePilihKandidat} type="button" disabled={hasVoted}>
              {hasVoted ? '✓ Anda Sudah Memilih' : 'Pilih Kandidat Ini'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default DetailKandidat
