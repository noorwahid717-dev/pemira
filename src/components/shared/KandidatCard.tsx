import type { KeyboardEvent } from 'react'
import type { Candidate } from '../../types/voting'
import '../../styles/shared/KandidatCard.css'

type KandidatCardProps = {
  kandidat: Candidate & { visi?: string }
  onClick?: (id: number) => void
  variant?: 'full' | 'preview'
}

const KandidatCard = ({ kandidat, onClick, variant = 'full' }: KandidatCardProps): JSX.Element => {
  const handleClick = () => {
    onClick?.(kandidat.id)
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleClick()
    }
  }

  if (variant === 'preview') {
    return (
      <div className="kandidat-card-preview">
        <div className="kandidat-avatar">{kandidat.nomorUrut || kandidat.foto}</div>
        <span className="kandidat-name">{kandidat.nama}</span>
      </div>
    )
  }

  return (
    <div className="kandidat-card" onClick={handleClick} role="button" tabIndex={0} onKeyPress={handleKeyPress}>
      <div className="kandidat-photo">
        <div className="photo-placeholder">{kandidat.foto || kandidat.nomorUrut}</div>
      </div>

      <div className="kandidat-nomor-urut">
        <span className="nomor-label">No. Urut</span>
        <span className="nomor-value">{String(kandidat.nomorUrut).padStart(2, '0')}</span>
      </div>

      <div className="kandidat-info">
        <h3 className="kandidat-nama">{kandidat.nama}</h3>
        <p className="kandidat-fakultas">{kandidat.fakultas}</p>
        <p className="kandidat-prodi">
          {kandidat.prodi} • {kandidat.angkatan}
        </p>
      </div>

      {kandidat.visi && (
        <div className="kandidat-visi">
          <span className="visi-label">Preview Visi:</span>
          <p className="visi-text">{kandidat.visi.length > 100 ? `${kandidat.visi.substring(0, 100)}...` : kandidat.visi}</p>
        </div>
      )}

      <button
        className="btn-view-profile"
        onClick={(event) => {
          event.stopPropagation()
          handleClick()
        }}
        type="button"
      >
        Lihat Profil
      </button>
    </div>
  )
}

export default KandidatCard
