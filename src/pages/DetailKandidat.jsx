import { useState, useEffect } from 'react';
import PageHeader from '../components/shared/PageHeader';
import '../styles/DetailKandidat.css';

export default function DetailKandidat() {
  const [activeTab, setActiveTab] = useState('visi');
  const [showStickyButton, setShowStickyButton] = useState(false);
  
  // Get kandidat ID from URL (dummy for now)
  const kandidatId = window.location.pathname.split('/').pop();
  
  // Check if user has voted
  const currentUser = sessionStorage.getItem('currentUser') 
    ? JSON.parse(sessionStorage.getItem('currentUser')) 
    : null;
  const hasVoted = currentUser?.hasVoted || false;
  const votingStatus = currentUser?.votingStatus || 'open';

  // Mock kandidat data
  const kandidat = {
    id: 1,
    nomorUrut: 1,
    nama: "Ahmad Fauzi",
    fakultas: "Fakultas Teknik",
    prodi: "Teknik Informatika",
    angkatan: "2021",
    foto: "1",
    tagline: "Mewujudkan kampus yang inklusif dan berdaya untuk semua",
    verified: true,
    visi: "Mewujudkan BEM sebagai organisasi yang inklusif, responsif, dan berdaya guna bagi seluruh mahasiswa dengan mengedepankan transparansi, kolaborasi, dan inovasi dalam setiap program kerja untuk menciptakan lingkungan kampus yang lebih baik.",
    misi: [
      "Menyediakan ruang aspirasi yang responsif dan terbuka bagi seluruh mahasiswa",
      "Mendorong kegiatan ekstrakurikuler yang merata di semua fakultas",
      "Menerapkan transparansi penuh dalam pengelolaan dana kegiatan kemahasiswaan",
      "Membangun kolaborasi aktif lintas fakultas dan organisasi mahasiswa",
      "Mengoptimalkan digitalisasi layanan kemahasiswaan untuk kemudahan akses"
    ],
    programKerja: [
      {
        id: 1,
        title: "Beasiswa Sahabat Kelas",
        description: "Program bantuan finansial untuk mahasiswa berprestasi dengan ekonomi kurang mampu melalui dana sosial BEM."
      },
      {
        id: 2,
        title: "Pusat Aspirasi Online",
        description: "Platform digital 24/7 untuk menampung dan merespon aspirasi mahasiswa secara cepat dan transparan."
      },
      {
        id: 3,
        title: "Kampus Ramah Difabel",
        description: "Advokasi fasilitas kampus yang inklusif dan aksesibilitas penuh bagi mahasiswa berkebutuhan khusus."
      },
      {
        id: 4,
        title: "Bursa Kerja & Magang",
        description: "Menjembatani mahasiswa dengan peluang magang dan pekerjaan dari mitra industri dan alumni."
      }
    ],
    pengalaman: [
      {
        tahun: "2024",
        posisi: "Ketua Himpunan Mahasiswa Teknik Informatika",
        detail: "Memimpin organisasi dengan 200+ anggota aktif"
      },
      {
        tahun: "2023",
        posisi: "Koordinator Kegiatan Sosial Kampus",
        detail: "Mengelola 15+ kegiatan sosial kampus"
      },
      {
        tahun: "2022",
        posisi: "Staf PSDM BEM Fakultas Teknik",
        detail: "Bertanggung jawab pengembangan SDM anggota"
      }
    ],
    kampanye: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      posterUrl: "/poster-kampanye.jpg",
      pdfUrl: "/program-kerja.pdf"
    }
  };

  const mahasiswaData = {
    nama: currentUser?.nim === '2110510001' ? "Budi Santoso" :
          currentUser?.nim === '2110510002' ? "Siti Nurhaliza" :
          currentUser?.nim === '2110510003' ? "Ahmad Fauzi" :
          currentUser?.nim === '2110510004' ? "Dewi Lestari" :
          "Ahmad Fauzi",
    nim: currentUser?.nim || "2110510023"
  };

  // Sticky button on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyButton(true);
      } else {
        setShowStickyButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePilihKandidat = () => {
    if (hasVoted || votingStatus !== 'open') return;
    
    const confirmed = confirm(
      `Anda akan memilih:\n\nNo. ${kandidat.nomorUrut} - ${kandidat.nama}\n\nApakah Anda yakin?`
    );
    
    if (confirmed) {
      // Process voting
      alert('Proses voting akan dilanjutkan ke halaman konfirmasi...');
      // window.location.href = '/voting/konfirmasi';
    }
  };

  const tabs = [
    { id: 'visi', label: 'Visi & Misi' },
    { id: 'program', label: 'Program Kerja' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'kampanye', label: 'Materi Kampanye' }
  ];

  return (
    <div className="detail-kandidat-page">
      <PageHeader 
        title="Daftar Kandidat"
        user={mahasiswaData}
      />

      <main className="detail-main">
        <div className="detail-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <a href="/kandidat" className="breadcrumb-link">
              ◀ Kembali ke Daftar Kandidat
            </a>
          </div>

          {/* Hero Section */}
          <div className="kandidat-hero">
            <div className="hero-left">
              <div className="kandidat-photo-large">
                <div className="photo-placeholder-large">
                  {kandidat.foto}
                </div>
              </div>

              <div className="kandidat-identity">
                <div className="identity-nomor">
                  <span className="nomor-label-small">No. Urut</span>
                  <span className="nomor-value-large">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
                </div>
                <h2 className="identity-nama">{kandidat.nama}</h2>
                <p className="identity-fakultas">{kandidat.fakultas}</p>
                <p className="identity-detail">{kandidat.prodi} • Angkatan {kandidat.angkatan}</p>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-badge">Calon Ketua BEM 2024</div>
              <h1 className="hero-tagline">{kandidat.tagline}</h1>
              
              {votingStatus === 'open' && (
                <button 
                  className={`btn-pilih-kandidat ${hasVoted ? 'disabled' : ''}`}
                  onClick={handlePilihKandidat}
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

          {/* Tab Navigation */}
          <div className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="content-sections">
            {/* Visi & Misi */}
            {activeTab === 'visi' && (
              <div className="content-section">
                <div className="section-block">
                  <h3 className="section-title">Visi</h3>
                  <p className="section-text">{kandidat.visi}</p>
                </div>

                <div className="section-block">
                  <h3 className="section-title">Misi</h3>
                  <ul className="misi-list">
                    {kandidat.misi.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Program Kerja */}
            {activeTab === 'program' && (
              <div className="content-section">
                <h3 className="section-title">Program Kerja Unggulan</h3>
                <div className="program-grid">
                  {kandidat.programKerja.map((program) => (
                    <div key={program.id} className="program-card">
                      <div className="program-number">{String(program.id).padStart(2, '0')}</div>
                      <h4 className="program-title">{program.title}</h4>
                      <p className="program-description">{program.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pengalaman */}
            {activeTab === 'pengalaman' && (
              <div className="content-section">
                <h3 className="section-title">Riwayat Organisasi</h3>
                <div className="timeline">
                  {kandidat.pengalaman.map((exp, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-year">{exp.tahun}</div>
                      <div className="timeline-content">
                        <h4 className="timeline-title">{exp.posisi}</h4>
                        <p className="timeline-detail">{exp.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materi Kampanye */}
            {activeTab === 'kampanye' && (
              <div className="content-section">
                <h3 className="section-title">Materi Kampanye</h3>
                
                <div className="kampanye-block">
                  <h4 className="kampanye-subtitle">Video Kampanye</h4>
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="450"
                      src={kandidat.kampanye.videoUrl}
                      title="Video Kampanye"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                <div className="kampanye-block">
                  <h4 className="kampanye-subtitle">Poster Kampanye</h4>
                  <div className="poster-container">
                    <div className="poster-placeholder">
                      📋 Poster Kampanye
                    </div>
                  </div>
                </div>

                <div className="kampanye-block">
                  <h4 className="kampanye-subtitle">Dokumen Program Kerja</h4>
                  <button className="btn-download">
                    <span className="download-icon">📄</span>
                    <span>Download Program Kerja Lengkap (PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="detail-footer">
            <p className="footer-text">
              ✓ Informasi ini diverifikasi oleh Panitia PEMIRA UNIWA.
            </p>
            <div className="footer-links">
              <a href="#kontak">Kontak Panitia</a>
              <span>•</span>
              <a href="#privasi">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      {showStickyButton && votingStatus === 'open' && (
        <div className="sticky-cta">
          <div className="sticky-cta-content">
            <div className="sticky-info">
              <span className="sticky-nomor">No. {String(kandidat.nomorUrut).padStart(2, '0')}</span>
              <span className="sticky-nama">{kandidat.nama}</span>
            </div>
            <button 
              className={`btn-pilih-sticky ${hasVoted ? 'disabled' : ''}`}
              onClick={handlePilihKandidat}
              disabled={hasVoted}
            >
              {hasVoted ? '✓ Anda Sudah Memilih' : 'Pilih Kandidat Ini'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
