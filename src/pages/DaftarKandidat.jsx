import { useState, useEffect } from 'react';
import '../styles/DaftarKandidat.css';

export default function DaftarKandidat() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFakultas, setFilterFakultas] = useState('Semua');
  const [sortBy, setSortBy] = useState('nomor_urut');
  
  const allKandidatData = [
    {
      id: 1,
      nomorUrut: 1,
      nama: "Ahmad Fauzi",
      fakultas: "Fakultas Teknik",
      prodi: "Teknik Informatika",
      angkatan: "2021",
      foto: "1",
      visi: "Mewujudkan kampus yang inklusif, kolaboratif, dan berprestasi untuk semua mahasiswa."
    },
    {
      id: 2,
      nomorUrut: 2,
      nama: "Siti Nurhaliza",
      fakultas: "Fakultas Ekonomi dan Bisnis",
      prodi: "Manajemen",
      angkatan: "2021",
      foto: "2",
      visi: "Transparansi dan kolaborasi untuk BEM yang responsif dan inovatif bagi seluruh mahasiswa."
    },
    {
      id: 3,
      nomorUrut: 3,
      nama: "Budi Santoso",
      fakultas: "Fakultas Hukum",
      prodi: "Ilmu Hukum",
      angkatan: "2020",
      foto: "3",
      visi: "Lingkungan belajar yang aman, nyaman, dan mendukung pengembangan potensi mahasiswa."
    }
  ];

  const mahasiswaData = {
    nama: "Ahmad Fauzi",
    nim: "2110510023"
  };

  const pemiraStatus = {
    periode: "2024",
    status: "Kampanye",
    totalKandidat: allKandidatData.length
  };

  const [kandidatList, setKandidatList] = useState(allKandidatData);

  useEffect(() => {
    let filtered = [...allKandidatData];

    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.fakultas.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterFakultas !== 'Semua') {
      filtered = filtered.filter(k => k.fakultas === filterFakultas);
    }

    if (sortBy === 'nomor_urut') {
      filtered.sort((a, b) => a.nomorUrut - b.nomorUrut);
    } else if (sortBy === 'nama') {
      filtered.sort((a, b) => a.nama.localeCompare(b.nama));
    }

    setKandidatList(filtered);
  }, [searchQuery, filterFakultas, sortBy]);

  const fakultasList = [
    'Semua',
    'Fakultas Teknik',
    'Fakultas Ekonomi dan Bisnis',
    'Fakultas Hukum',
    'Fakultas Pendidikan'
  ];

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const handleKandidatClick = (kandidatId) => {
    window.location.href = `/kandidat/detail/${kandidatId}`;
  };

  return (
    <div className="kandidat-page">
      <header className="kandidat-header">
        <div className="kandidat-header-container">
          <div className="header-left">
            <div className="header-logo">
              <div className="logo-circle">P</div>
              <span className="logo-text">PEMIRA UNIWA</span>
            </div>
            <span className="header-divider">|</span>
            <span className="header-title">Daftar Kandidat</span>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="user-avatar">{mahasiswaData.nama.charAt(0)}</span>
                <span className="user-name">{mahasiswaData.nama}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{mahasiswaData.nama}</strong>
                      <span>{mahasiswaData.nim}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/dashboard" className="dropdown-item">Dashboard</a>
                  <a href="#profil" className="dropdown-item">Profil</a>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="kandidat-main">
        <div className="kandidat-container">
          <div className="page-header">
            <div className="page-header-content">
              <h1 className="page-title">Daftar Calon Ketua BEM</h1>
              <div className="page-meta">
                <span className="meta-item">Periode {pemiraStatus.periode}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">Status: <strong>{pemiraStatus.status}</strong></span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select 
                value={filterFakultas}
                onChange={(e) => setFilterFakultas(e.target.value)}
                className="filter-select"
              >
                {fakultasList.map((fakultas) => (
                  <option key={fakultas} value={fakultas}>
                    {fakultas === 'Semua' ? 'Semua Fakultas' : fakultas}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="nomor_urut">Urutkan: Nomor Urut</option>
                <option value="nama">Urutkan: Nama A–Z</option>
              </select>
            </div>
          </div>

          {(searchQuery || filterFakultas !== 'Semua') && (
            <div className="results-info">
              {kandidatList.length > 0 ? (
                <p>Menampilkan {kandidatList.length} kandidat</p>
              ) : (
                <div className="empty-results">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-title">Tidak ada kandidat ditemukan</p>
                  <p className="empty-text">Coba gunakan kata kunci lain atau ubah filter</p>
                </div>
              )}
            </div>
          )}

          {kandidatList.length > 0 && (
            <div className="kandidat-grid">
              {kandidatList.map((kandidat) => (
                <div 
                  key={kandidat.id} 
                  className="kandidat-card"
                  onClick={() => handleKandidatClick(kandidat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleKandidatClick(kandidat.id);
                  }}
                >
                  <div className="kandidat-photo">
                    <div className="photo-placeholder">
                      {kandidat.foto}
                    </div>
                  </div>

                  <div className="kandidat-nomor-urut">
                    <span className="nomor-label">No. Urut</span>
                    <span className="nomor-value">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
                  </div>

                  <div className="kandidat-info">
                    <h3 className="kandidat-nama">{kandidat.nama}</h3>
                    <p className="kandidat-fakultas">{kandidat.fakultas}</p>
                    <p className="kandidat-prodi">{kandidat.prodi} • {kandidat.angkatan}</p>
                  </div>

                  <div className="kandidat-visi">
                    <span className="visi-label">Preview Visi:</span>
                    <p className="visi-text">
                      {kandidat.visi.length > 100 
                        ? kandidat.visi.substring(0, 100) + '...' 
                        : kandidat.visi
                      }
                    </p>
                  </div>

                  <button 
                    className="btn-view-profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKandidatClick(kandidat.id);
                    }}
                  >
                    Lihat Profil
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="page-footer">
            <p className="footer-text">
              ✓ Data kandidat diverifikasi oleh Panitia PEMIRA.
            </p>
            <p className="footer-text">
              Hubungi panitia untuk koreksi informasi kandidat.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
