import '../../styles/shared/KandidatCard.css';

export default function KandidatCard({ 
  kandidat, 
  onClick,
  variant = 'full'
}) {
  const handleClick = () => {
    if (onClick) onClick(kandidat.id);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleClick();
  };

  if (variant === 'preview') {
    return (
      <div className="kandidat-card-preview">
        <div className="kandidat-avatar">{kandidat.nomorUrut || kandidat.foto}</div>
        <span className="kandidat-name">{kandidat.nama}</span>
      </div>
    );
  }

  return (
    <div 
      className="kandidat-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className="kandidat-photo">
        <div className="photo-placeholder">
          {kandidat.foto || kandidat.nomorUrut}
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

      {kandidat.visi && (
        <div className="kandidat-visi">
          <span className="visi-label">Preview Visi:</span>
          <p className="visi-text">
            {kandidat.visi.length > 100 
              ? kandidat.visi.substring(0, 100) + '...' 
              : kandidat.visi
            }
          </p>
        </div>
      )}

      <button 
        className="btn-view-profile"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Lihat Profil
      </button>
    </div>
  );
}
