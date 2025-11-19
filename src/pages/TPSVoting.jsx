import { useState, useEffect } from 'react';
import { useNavigate } from '../utils/navigation';
import PageHeader from '../components/shared/PageHeader';
import '../styles/TPSVoting.css';

export default function TPSVoting() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedKandidat, setSelectedKandidat] = useState(null);
  const [checkboxConfirm, setCheckboxConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = sessionStorage.getItem('currentUser') 
    ? JSON.parse(sessionStorage.getItem('currentUser')) 
    : null;

  const qrData = sessionStorage.getItem('scannedQR')
    ? JSON.parse(sessionStorage.getItem('scannedQR'))
    : null;

  const mahasiswaData = {
    nama: currentUser?.nim === '2110510001' ? "Budi Santoso" :
          currentUser?.nim === '2110510002' ? "Siti Nurhaliza" :
          currentUser?.nim === '2110510003' ? "Ahmad Fauzi" :
          currentUser?.nim === '2110510004' ? "Dewi Lestari" :
          "Ahmad Fauzi",
    nim: currentUser?.nim || "2110510023"
  };

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
      angkatan: "2021",
      foto: "3"
    }
  ];

  useEffect(() => {
    if (!currentUser || !qrData) {
      navigate('/voting-tps');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleSelectKandidat = (kandidat) => {
    setSelectedKandidat(kandidat);
  };

  const handleNextToConfirmation = () => {
    if (selectedKandidat) {
      setStep(2);
    }
  };

  const handleBackToSelection = () => {
    setStep(1);
    setCheckboxConfirm(false);
  };

  const handleSubmitVote = async () => {
    if (!checkboxConfirm) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const voteData = {
        kandidatId: selectedKandidat.id,
        kandidatNama: selectedKandidat.nama,
        votedAt: new Date().toISOString(),
        token: generateToken(),
        tpsName: qrData.tpsName,
        mode: 'tps'
      };

      // Update user voting status
      const updatedUser = {
        ...currentUser,
        hasVoted: true,
        votingStatus: 'voted'
      };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      sessionStorage.setItem('voteData', JSON.stringify(voteData));
      
      // Clear QR data
      sessionStorage.removeItem('scannedQR');
      sessionStorage.removeItem('votingMode');

      navigate('/voting-tps/success');
    }, 1500);
  };

  const generateToken = () => {
    const chars = '0123456789abcdef';
    const segments = [4, 4, 4];
    return segments.map(len => 
      Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
  };

  if (!currentUser || !qrData) return null;

  return (
    <div className="tps-voting-page">
      <PageHeader 
        title={`Voting TPS - Step ${step}/2`}
        user={mahasiswaData}
        onLogout={handleLogout}
      />

      <main className="tps-voting-container">
        
        {step === 1 && (
          <div className="voting-step-1">
            <div className="tps-banner">
              <span className="banner-icon">📢</span>
              <div className="banner-content">
                <strong>Voting di lokasi TPS</strong>
                <p>{qrData.tpsName}</p>
              </div>
            </div>

            <div className="voting-header">
              <h2>Pilih Kandidat</h2>
              <p className="step-indicator">Step 1/2</p>
            </div>

            <div className="kandidat-grid">
              {kandidatList.map((kandidat) => (
                <div 
                  key={kandidat.id}
                  className={`kandidat-card-tps ${selectedKandidat?.id === kandidat.id ? 'selected' : ''}`}
                  onClick={() => handleSelectKandidat(kandidat)}
                >
                  <div className="kandidat-foto">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&size=200&background=random`}
                      alt={kandidat.nama}
                    />
                  </div>
                  <div className="kandidat-info">
                    <div className="kandidat-nomor">No. {kandidat.nomorUrut}</div>
                    <h3 className="kandidat-nama">{kandidat.nama}</h3>
                    <p className="kandidat-fakultas">{kandidat.fakultas}</p>
                    <p className="kandidat-prodi">{kandidat.prodi}</p>
                  </div>
                  <div className="kandidat-radio">
                    <input 
                      type="radio"
                      name="kandidat"
                      checked={selectedKandidat?.id === kandidat.id}
                      onChange={() => handleSelectKandidat(kandidat)}
                    />
                    <span className="radio-label">Pilih</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="voting-actions">
              <button 
                className="btn-next"
                onClick={handleNextToConfirmation}
                disabled={!selectedKandidat}
              >
                Lanjut ke Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="voting-step-2">
            <div className="tps-banner">
              <span className="banner-icon">📢</span>
              <div className="banner-content">
                <strong>Voting di lokasi TPS</strong>
                <p>{qrData.tpsName}</p>
              </div>
            </div>

            <div className="voting-header">
              <h2>Konfirmasi Pilihan</h2>
              <p className="step-indicator">Step 2/2</p>
            </div>

            <div className="confirmation-card">
              <h3>Anda memilih:</h3>
              <div className="selected-kandidat">
                <div className="selected-foto">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedKandidat.nama)}&size=150&background=random`}
                    alt={selectedKandidat.nama}
                  />
                </div>
                <div className="selected-info">
                  <div className="selected-nomor">Nomor Urut {selectedKandidat.nomorUrut}</div>
                  <h4 className="selected-nama">{selectedKandidat.nama}</h4>
                  <p className="selected-fakultas">{selectedKandidat.fakultas}</p>
                  <p className="selected-prodi">{selectedKandidat.prodi}</p>
                </div>
              </div>

              <div className="confirmation-checkbox">
                <label className="checkbox-container">
                  <input 
                    type="checkbox"
                    checked={checkboxConfirm}
                    onChange={(e) => setCheckboxConfirm(e.target.checked)}
                  />
                  <span className="checkbox-label">
                    Saya memastikan pilihan sudah benar dan tidak dapat diubah.
                  </span>
                </label>
              </div>

              <div className="confirmation-warning">
                <span className="warning-icon">⚠️</span>
                <p>Pilihan yang telah dikirim tidak dapat diubah atau dibatalkan.</p>
              </div>
            </div>

            <div className="voting-actions">
              <button 
                className="btn-submit"
                onClick={handleSubmitVote}
                disabled={!checkboxConfirm || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Mengirim Suara...
                  </>
                ) : (
                  'Kirim Suara'
                )}
              </button>
              <button 
                className="btn-back"
                onClick={handleBackToSelection}
                disabled={isSubmitting}
              >
                ← Kembali
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
