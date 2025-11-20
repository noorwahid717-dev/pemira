import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDPTAdminStore } from '../hooks/useDPTAdminStore'
import '../styles/AdminDPT.css'

const AdminDPTImport = (): JSX.Element => {
  const navigate = useNavigate()
  const { importStep, setImportStep, importFileName, setImportFileName, mapping, setMapping, importErrors, resetImport } = useDPTAdminStore()
  const [previewValid] = useState({ total: 8432, valid: 8430, errors: importErrors.length })
  const [mappedColumns] = useState(['NIM', 'Nama Lengkap', 'Fakultas', 'Program Studi', 'Angkatan', 'Status', 'Email'])

  const goNext = () => setImportStep((prev) => (prev < 4 ? ((prev + 1) as typeof prev) : prev))
  const goBack = () => setImportStep((prev) => (prev > 1 ? ((prev - 1) as typeof prev) : prev))

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportFileName(event.target.files[0].name)
    }
  }

  const handleImport = () => {
    alert('Impor berhasil (simulasi).')
    resetImport()
    navigate('/admin/dpt')
  }

  return (
    <div className="admin-dpt-page">
      <div className="page-header">
        <div>
          <h1>Import DPT</h1>
          <p>Impor data pemilih dari file eksternal.</p>
        </div>
        <button className="btn-link" type="button" onClick={() => navigate('/admin/dpt')}>
          × Tutup
        </button>
      </div>

      <div className="import-steps">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className={`step ${importStep >= step ? 'active' : ''}`}>
            <span>{step}</span>
            {step === 1 && 'Upload File'}
            {step === 2 && 'Mapping Kolom'}
            {step === 3 && 'Preview & Validasi'}
            {step === 4 && 'Hasil Import'}
          </div>
        ))}
      </div>

      {importStep === 1 && (
        <section className="card">
          <h2>Step 1 – Upload File</h2>
          <p>Format yang didukung: .xlsx, .csv</p>
          <input type="file" accept=".xlsx,.csv" onChange={handleUpload} />
          {importFileName && <p>File dipilih: {importFileName}</p>}
          <div className="form-actions">
            <button className="btn-outline" type="button" onClick={() => navigate('/admin/dpt')}>
              Batalkan
            </button>
            <button className="btn-primary" type="button" onClick={goNext} disabled={!importFileName}>
              Lanjutkan
            </button>
          </div>
        </section>
      )}

      {importStep === 2 && (
        <section className="card">
          <h2>Step 2 – Mapping Kolom</h2>
          <p>Cocokkan kolom dari file dengan field sistem.</p>
          <div className="mapping-grid">
            {Object.entries(mapping).map(([key, value]) => (
              <label key={key}>
                {key}
                <select value={value} onChange={(event) => setMapping((prev) => ({ ...prev, [key]: event.target.value }))}>
                  {mappedColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn-outline" type="button" onClick={goBack}>
              Kembali
            </button>
            <button className="btn-primary" type="button" onClick={goNext}>
              Lanjutkan
            </button>
          </div>
        </section>
      )}

      {importStep === 3 && (
        <section className="card">
          <h2>Step 3 – Preview & Validasi</h2>
          <p>
            ✔ {previewValid.valid} baris valid · ⚠ {previewValid.errors} baris bermasalah
          </p>
          <table>
            <thead>
              <tr>
                <th>NIM</th>
                <th>Nama</th>
                <th>Fakultas</th>
                <th>Prodi</th>
                <th>Angkatan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {['2110510023', '2109920344', '2108810041'].map((nim) => (
                <tr key={nim}>
                  <td>{nim}</td>
                  <td>Nama Mahasiswa</td>
                  <td>Fakultas</td>
                  <td>Program</td>
                  <td>2021</td>
                  <td>Aktif</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-link" type="button" onClick={() => alert('Detail error')}>
            Lihat detail error
          </button>
          <div className="form-actions">
            <button className="btn-outline" type="button" onClick={goBack}>
              Kembali
            </button>
            <button className="btn-primary" type="button" onClick={goNext}>
              Impor Sekarang
            </button>
          </div>
        </section>
      )}

      {importStep === 4 && (
        <section className="card">
          <h2>Step 4 – Hasil Import</h2>
          <p>Impor berhasil.</p>
          <p>
            Berhasil: {previewValid.valid} pemilih · Gagal: {previewValid.errors} pemilih
          </p>
          <div className="form-actions">
            <button className="btn-outline" type="button" onClick={() => alert('Download log error')}>
              Download Log Error
            </button>
            <button className="btn-primary" type="button" onClick={handleImport}>
              Tutup
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminDPTImport
