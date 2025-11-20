import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import type { TPSAdmin, TPSPanitia, TPSStatus } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const roleOptions = ['Ketua TPS', 'Sekretaris', 'Anggota TPS', 'Operator Panel', 'Pengawas']

const AdminTPSForm = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, createEmpty, saveTPS, isKodeAvailable } = useTPSAdminStore()
  const editing = Boolean(id)
  const existing = id ? getById(id) : undefined

  const [formData, setFormData] = useState<TPSAdmin>(existing ?? createEmpty())
  const [panitiaInput, setPanitiaInput] = useState({ nama: '', peran: roleOptions[0] })
  const kodeAvailable = useMemo(() => isKodeAvailable(formData.kode, editing ? formData.id : undefined), [formData.kode, editing, formData.id, isKodeAvailable])

  useEffect(() => {
    if (existing) {
      setFormData(existing)
    }
  }, [existing])

  const updateField = <K extends keyof TPSAdmin>(field: K, value: TPSAdmin[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTargetDPT = () => {
    if (!panitiaInput.nama.trim()) return
    if (formData.dptTarget.includes(panitiaInput.nama.trim())) return
    updateField('dptTarget', [...formData.dptTarget, panitiaInput.nama.trim()])
    setPanitiaInput((prev) => ({ ...prev, nama: '' }))
  }

  const removeTarget = (label: string) => {
    updateField('dptTarget', formData.dptTarget.filter((item) => item !== label))
  }

  const addPanitia = () => {
    if (!panitiaInput.nama.trim()) return
    updateField('panitia', [...formData.panitia, { id: `panitia-${Date.now()}`, nama: panitiaInput.nama.trim(), peran: panitiaInput.peran }])
    setPanitiaInput({ nama: '', peran: roleOptions[0] })
  }

  const removePanitia = (panitiaId: string) => {
    updateField('panitia', formData.panitia.filter((item) => item.id !== panitiaId))
  }

  const canActivate = formData.panitia.some((p) => p.peran === 'Ketua TPS') && Boolean(formData.nama) && kodeAvailable

  const handleSubmit = (status: TPSStatus) => {
    if (!formData.nama || !formData.kode) {
      alert('Nama TPS dan Kode wajib diisi.')
      return
    }
    if (!kodeAvailable) {
      alert('Kode TPS sudah digunakan.')
      return
    }
    if (formData.jamBuka >= formData.jamTutup) {
      alert('Jam buka harus lebih awal dibanding jam tutup.')
      return
    }
    if (status === 'active' && !canActivate) {
      alert('Minimal harus ada panitia dengan peran Ketua TPS untuk mengaktifkan TPS.')
      return
    }
    saveTPS(formData, status === 'draft' ? 'draft' : 'active')
    navigate('/admin/tps')
  }

  return (
    <div className="admin-tps-page">
      <div className="page-header">
        <div>
          <h1>{editing ? `Edit TPS – ${formData.nama}` : 'Tambah TPS Baru'}</h1>
          <p>Atur informasi, QR, dan panitia untuk TPS ini.</p>
        </div>
        <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
          ← Kembali ke daftar
        </button>
      </div>

      <form className="tps-form" onSubmit={(event) => event.preventDefault()}>
        <section>
          <h2>Informasi Dasar</h2>
          <div className="form-grid">
            <label>
              Nama TPS
              <input type="text" value={formData.nama} onChange={(event) => updateField('nama', event.target.value)} required />
            </label>
            <label>
              Kode TPS
              <input type="text" value={formData.kode} onChange={(event) => updateField('kode', event.target.value.toUpperCase())} required />
              {!kodeAvailable && <small className="error">Kode sudah digunakan.</small>}
            </label>
            <label>
              Fakultas / Area
              <input type="text" value={formData.fakultasArea} onChange={(event) => updateField('fakultasArea', event.target.value)} />
            </label>
            <label>
              Tipe TPS
              <select value={formData.tipe} onChange={(event) => updateField('tipe', event.target.value as TPSAdmin['tipe'])}>
                <option value="umum">Umum (Lintas Fakultas)</option>
                <option value="fakultas">Khusus Fakultas</option>
              </select>
            </label>
          </div>
          <label>
            Lokasi Detail
            <input type="text" value={formData.lokasi} onChange={(event) => updateField('lokasi', event.target.value)} />
          </label>
          <label>
            Deskripsi
            <textarea value={formData.deskripsi} onChange={(event) => updateField('deskripsi', event.target.value)} />
          </label>
        </section>

        <section>
          <h2>Jam Operasional</h2>
          <div className="form-grid">
            <label>
              Tanggal Voting
              <input type="date" value={formData.tanggalVoting} onChange={(event) => updateField('tanggalVoting', event.target.value)} />
            </label>
            <label>
              Jam Buka
              <input type="time" value={formData.jamBuka} onChange={(event) => updateField('jamBuka', event.target.value)} />
            </label>
            <label>
              Jam Tutup
              <input type="time" value={formData.jamTutup} onChange={(event) => updateField('jamTutup', event.target.value)} />
            </label>
          </div>
        </section>

        <section>
          <h2>Kapasitas & Target</h2>
          <label>
            Perkiraan Kapasitas
            <input type="number" value={formData.kapasitas} onChange={(event) => updateField('kapasitas', Number(event.target.value))} />
          </label>
          <div className="dpt-target">
            <strong>Target DPT</strong>
            <div className="target-list">
              {formData.dptTarget.map((target) => (
                <span key={target}>
                  {target}
                  <button type="button" onClick={() => removeTarget(target)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="target-input">
              <input type="text" placeholder="Tambah Fakultas / Program" value={panitiaInput.nama} onChange={(event) => setPanitiaInput((prev) => ({ ...prev, nama: event.target.value }))} />
              <button type="button" className="btn-outline" onClick={addTargetDPT}>
                + Tambah
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2>QR TPS (Statis)</h2>
          <div className="qr-grid">
            <label>
              ID QR TPS
              <input type="text" value={formData.qrId} onChange={(event) => updateField('qrId', event.target.value)} />
            </label>
            <label>
              Status QR
              <select value={formData.qrStatus} onChange={(event) => updateField('qrStatus', event.target.value as TPSAdmin['qrStatus'])}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </label>
          </div>
          <div className="qr-actions">
            <button type="button" className="btn-outline" onClick={() => alert('Generate QR (simulasi)')}>
              {formData.qrId ? 'Generate Ulang QR' : 'Generate QR'}
            </button>
            {formData.qrId && (
              <>
                <button type="button" className="btn-outline" onClick={() => alert('Preview QR (simulasi)')}>
                  Preview QR
                </button>
                <button type="button" className="btn-primary" onClick={() => alert('Download QR (simulasi)')}>
                  Download QR untuk Dicetak
                </button>
              </>
            )}
          </div>
        </section>

        <section>
          <h2>Panitia TPS</h2>
          <div className="panitia-input">
            <input type="text" placeholder="Nama panitia" value={panitiaInput.nama} onChange={(event) => setPanitiaInput((prev) => ({ ...prev, nama: event.target.value }))} />
            <select value={panitiaInput.peran} onChange={(event) => setPanitiaInput((prev) => ({ ...prev, peran: event.target.value }))}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button type="button" className="btn-primary" onClick={addPanitia}>
              + Tambah Panitia
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Peran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {formData.panitia.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-state">
                    Belum ada panitia ditambahkan.
                  </td>
                </tr>
              )}
              {formData.panitia.map((panitia) => (
                <tr key={panitia.id}>
                  <td>{panitia.nama}</td>
                  <td>{panitia.peran}</td>
                  <td>
                    <button type="button" className="btn-link" onClick={() => removePanitia(panitia.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Status TPS</h2>
          <div className="status-options">
            <label>
              <input type="radio" checked={formData.status === 'draft'} onChange={() => updateField('status', 'draft')} />
              Draft
            </label>
            <label>
              <input type="radio" checked={formData.status === 'active'} onChange={() => updateField('status', 'active')} />
              Aktif
            </label>
            <label>
              <input type="radio" checked={formData.status === 'closed'} onChange={() => updateField('status', 'closed')} />
              Ditutup
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button className="btn-outline" type="button" onClick={() => handleSubmit('draft')}>
            Simpan sebagai Draft
          </button>
          <button className="btn-primary" type="button" onClick={() => handleSubmit('active')}>
            Simpan & Aktifkan TPS
          </button>
          <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminTPSForm
