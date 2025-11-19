import { useState, useEffect } from 'react';
import PageHeader from '../components/shared/PageHeader';
import '../styles/VotingOnline.css';

export default function VotingOnline() {
  const [step, setStep] = useState(1);
  const [selectedKandidat, setSelectedKandidat] = useState(null);
  const [checkboxConfirm, setCheckboxConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingResult, setVotingResult] = useState(null);

  // Get user state
  const currentUser = sessionStorage.getItem('currentUser') 
    ? JSON.parse(sessionStorage.getItem('currentUser')) 
    : null;
  
  const hasVoted = currentUser?.hasVoted || false;
  const votingStatus = currentUser?.votingStatus || 'open';

  const mahasiswaData = {
    nama: currentUser?.nim === '2110510001' ? "Budi Santoso" :
          currentUser?.nim === '2110510002' ? "Siti Nurhaliza" :
          currentUser?.nim === '2110510003' ? "Ahmad Fauzi" :
          currentUser?.nim === '2110510004' ? "Dewi Lestari" :
          "Ahmad Fauzi",
    nim: currentUser?.nim || "2110510023"
  };

  // Mock kandidat data
  const kandidatList = [
    {
      id: 1,
      nomorUrut: 1,
      nama: "Ahmad Fauzi",
      fakultas: "Fakultas Teknik",
      prodi: "Teknik Informatika",
      angkatan: "2021",
      foto: "1"
    },
    {
      id: 2,
      nomorUrut: 2,
      nama: "Siti Nurhaliza",
      fakultas: "Fakultas Ekonomi dan Bisnis",
      prodi: "Manajemen",
      angkatan: "2021",
      foto: "2"
    },
    {
      id: 3,
      nomorUrut: 3,
      nama: "Budi Santoso",
      fakultas: "Fakultas Hukum",
      prodi: "Ilmu Hukum",
      angkatan: "2020",
      foto: "3"
    }
  ];

  // Redirect if already voted
  useEffect(() => {
    if (hasVoted && step !== 3) {
      setStep(3);
      setVotingResult({
        timestamp: "14 Juni 2024 — 10:24 WIB",
        token: "x81c-a91b-d33f"
      });
    }
  }, [hasVoted]);

  const handleSelectKandidat = (kandidat) => {
    setSelectedKandidat(kandidat);
  };

  const handleLanjutKonfirmasi = () => {
    if (!selectedKandidat) return;
    setStep(2);
    setCheckboxConfirm(false);
  };

  const handleKembali = () => {
    if (step === 2) {
      setStep(1);
      setCheckboxConfirm(false);
    }
  };

  const handleKirimSuara = async () => {
    if (!checkboxConfirm || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const token = Math.random().toString(36).substring(2, 15).slice(0, 12);
      const formattedToken = `${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 12)}`;

      setVotingResult({
        timestamp,
        token: formattedToken
      });

      // Update user state
      if (currentUser) {
        currentUser.hasVoted = true;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      setIsSubmitting(false);
      setStep(3);
    }, 2000);
  };

  // Voting status check
  if (votingStatus === 'not_started') {
    return (
      <div className="voting-page">
        <PageHeader title="Pemungutan Suara" user={mahasiswaData} />
        <main className="voting-main">
          <div className="voting-container">
            <div className="status-block status-info">
              <div className="status-icon">ℹ️</div>
              <div className="status-content">
                <h2>Voting Belum Dibuka</h2>
                <p>Silakan kembali pada tanggal 12 Juni 2024 pukul 00:00 WIB</p>
                <a href="/dashboard">
                  <button className="btn-secondary">Kembali ke Dashboard</button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (votingStatus === 'closed') {
    return (
      <div className="voting-page">
        <PageHeader title="Pemungutan Suara" user={mahasiswaData} />
        <main className="voting-main">
          <div className="voting-container">
            <div className="status-block status-closed">
              <div className="status-icon">🔒</div>
              <div className="status-content">
                <h2>Voting Telah Ditutup</h2>
                <p>Terima kasih atas partisipasi Anda dalam PEMIRA UNIWA 2024</p>
                <a href="/dashboard">
                  <button className="btn-secondary">Kembali ke Dashboard</button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="voting-page">
      <PageHeader title="Pemungutan Suara" user={mahasiswaData} />

      <main className="voting-main">
        <div className="voting-container">
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Pilih Kandidat</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Konfirmasi</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Selesai</div>
            </div>
          </div>

          {/* Step 1: Pilih Kandidat */}
          {step === 1 && (
            <div className="voting-step">
              <div className="step-header">
                <h1 className="step-title">Pilih Kandidat Anda</h1>
                <p className="step-subtitle">Step 1/2</p>
              </div>

              {/* Instruksi */}
              <div className="instruction-box">
                <div className="instruction-icon">📢</div>
                <div className="instruction-content">
                  <strong>Instruksi Penting:</strong>
                  <ul>
                    <li>Anda hanya dapat memilih <strong>sekali</strong></li>
                    <li>Pastikan Anda membaca profil kandidat dengan teliti</li>
                    <li>Pilihan <strong>tidak dapat diubah</strong> setelah dikirim</li>
                  </ul>
                </div>
              </div>

              {/* Kandidat Grid */}
              <div className="kandidat-voting-grid">
                {kandidatList.map((kandidat) => (
                  <div
                    key={kandidat.id}
                    className={`kandidat-voting-card ${
                      selectedKandidat?.id === kandidat.id ? 'selected' : ''
                    } ${
                      selectedKandidat && selectedKandidat?.id !== kandidat.id ? 'dimmed' : ''
                    }`}
                    onClick={() => handleSelectKandidat(kandidat)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="voting-card-photo">
                      <div className="voting-photo-placeholder">
                        {kandidat.foto}
                      </div>
                    </div>

                    <div className="voting-card-nomor">
                      <span className="nomor-label-voting">No. Urut</span>
                      <span className="nomor-value-voting">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
                    </div>

                    <div className="voting-card-info">
                      <h3 className="voting-card-nama">{kandidat.nama}</h3>
                      <p className="voting-card-fakultas">{kandidat.fakultas}</p>
                      <p className="voting-card-prodi">{kandidat.prodi} • {kandidat.angkatan}</p>
                    </div>

                    <div className="voting-card-radio">
                      <input
                        type="radio"
                        name="kandidat"
                        checked={selectedKandidat?.id === kandidat.id}
                        onChange={() => handleSelectKandidat(kandidat)}
                        className="radio-input"
                      />
                      <span className="radio-label">
                        {selectedKandidat?.id === kandidat.id ? 'Dipilih' : 'Pilih Kandidat Ini'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Button Lanjut */}
              <div className="voting-actions">
                <button
                  className="btn-primary btn-large btn-full"
                  onClick={handleLanjutKonfirmasi}
                  disabled={!selectedKandidat}
                >
                  Lanjut ke Konfirmasi →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Konfirmasi */}
          {step === 2 && selectedKandidat && (
            <div className="voting-step">
              <div className="step-header">
                <h1 className="step-title">Konfirmasi Pilihan Anda</h1>
                <p className="step-subtitle">Step 2/2</p>
              </div>

              {/* Summary */}
              <div className="confirmation-box">
                <h3 className="confirmation-title">Anda memilih:</h3>
                <div className="confirmation-kandidat">
                  <div className="confirmation-photo">
                    <div className="confirmation-photo-placeholder">
                      {selectedKandidat.foto}
                    </div>
                  </div>
                  <div className="confirmation-info">
                    <div className="confirmation-nomor">
                      No. Urut {String(selectedKandidat.nomorUrut).padStart(2, '0')}
                    </div>
                    <h2 className="confirmation-nama">{selectedKandidat.nama}</h2>
                    <p className="confirmation-fakultas">{selectedKandidat.fakultas}</p>
                    <p className="confirmation-prodi">{selectedKandidat.prodi} • Angkatan {selectedKandidat.angkatan}</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="warning-box">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <strong>Perhatian:</strong>
                  <p>Setelah Anda mengklik "Kirim Suara", pilihan tidak dapat diubah lagi.</p>
                </div>
              </div>

              {/* Checkbox */}
              <div className="checkbox-container">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkboxConfirm}
                    onChange={(e) => setCheckboxConfirm(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    Saya menyatakan bahwa pilihan saya sudah benar dan tidak dapat diubah setelah dikirim.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="voting-actions voting-actions-double">
                <button
                  className="btn-secondary btn-large"
                  onClick={handleKembali}
                  disabled={isSubmitting}
                >
                  ← Kembali
                </button>
                <button
                  className="btn-primary btn-large"
                  onClick={handleKirimSuara}
                  disabled={!checkboxConfirm || isSubmitting}
                >
                  {isSubmitting ? 'Mengirim Suara...' : 'Kirim Suara'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && votingResult && (
            <div className="voting-step">
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h1 className="success-title">Terima Kasih!</h1>
                <p className="success-subtitle">Suara Anda telah tercatat</p>

                <div className="success-info">
                  <div className="info-row">
                    <span className="info-label">Waktu Voting:</span>
                    <span className="info-value">{votingResult.timestamp}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Token Bukti:</span>
                    <span className="info-value token">{votingResult.token}</span>
                  </div>
                </div>

                <div className="success-note">
                  <div className="note-icon">🔒</div>
                  <p>Pilihan Anda tetap rahasia dan tidak akan ditampilkan kepada siapapun.</p>
                </div>

                <div className="success-actions">
                  <a href="/dashboard">
                    <button className="btn-primary btn-large">Kembali ke Dashboard</button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
