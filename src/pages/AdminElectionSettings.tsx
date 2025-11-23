import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import PemiraLogos from '../components/shared/PemiraLogos'
import { useElectionSettings } from '../hooks/useElectionSettings'
import type { ElectionRules, VotingMode } from '../types/electionSettings'
import '../styles/AdminElectionSettings.css'

const votingModeLabels: Record<VotingMode, string> = {
  online: 'Online saja',
  tps: 'TPS saja',
  hybrid: 'Hybrid (Online + TPS)',
}

type BrandingKey = 'primaryLogo' | 'secondaryLogo'

const AdminElectionSettings = (): JSX.Element => {
  const navigate = useNavigate()
  const [brandingError, setBrandingError] = useState<string | undefined>(undefined)
  const {
    statusLabel,
    mode,
    setMode,
    timeline,
    handleTimelineChange,
    timelineValid,
    rules,
    setRules,
    branding,
    queueBrandingUpload,
    markBrandingRemoval,
    resetBrandingDraft,
    security,
    setSecurity,
    savingSection,
    lastUpdated,
    isModeChangeDisabled,
    saveMode,
    saveTimeline,
    saveRules,
    saveBranding,
    loading,
    error,
  } = useElectionSettings()

  const updateRule = <K extends keyof ElectionRules>(field: K, value: ElectionRules[K]) => {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveMode = () => {
    void saveMode()
  }

  const handleSaveTimeline = () => {
    if (!timelineValid) {
      alert('Periksa kembali jadwal. Pastikan tidak ada tanggal yang tumpang tindih.')
      return
    }
    void saveTimeline()
  }

  const handleSaveRules = () => {
    void saveRules()
  }

  const handleSaveBranding = () => {
    setBrandingError(undefined)
    void saveBranding()
  }

  const toSlot = (field: BrandingKey): 'primary' | 'secondary' => (field === 'primaryLogo' ? 'primary' : 'secondary')

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, field: BrandingKey) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setBrandingError('Ukuran logo maksimal 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      queueBrandingUpload(toSlot(field), reader.result as string, file)
      setBrandingError(undefined)
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleResetBranding = () => {
    resetBrandingDraft()
    setBrandingError(undefined)
  }

  const handleLockVoting = () => {
    setSecurity((prev) => ({ ...prev, lockVoting: !prev.lockVoting }))
  }

  const handleResetTPS = () => {
    if (window.confirm('Reset queue TPS? Semua antrean akan hilang.')) {
      alert('Queue TPS berhasil direset (simulasi).')
    }
  }

  const handleResetElection = () => {
    if (window.prompt('Ketik "RESET PEMIRA" untuk melanjutkan.') === 'RESET PEMIRA') {
      if (window.confirm('Yakin ingin reset seluruh suara dan data pemilu? Aksi ini tidak dapat dibatalkan.')) {
        alert('Pemilu direset (simulasi).')
      }
    }
  }

  return (
    <AdminLayout title="Pengaturan Pemilu">
      <div className="admin-settings-page">
        <header className="settings-sticky">
          <div className="settings-top">
            <a className="back-link" href="/admin">
              ◀ Pengaturan Pemilu
            </a>
            <div className="settings-actions">
              <div className="status-chip">
                <span className="dot live" />
                <span>{statusLabel || 'Aktif'}</span>
              </div>
              <button className="btn-outline" type="button" onClick={() => navigate('/admin/pengaturan/panduan')}>
                Panduan Alur Pemilihan
              </button>
            </div>
          </div>
          <p className="sub-label">Mode: {votingModeLabels[mode]}</p>
          {loading && <p className="sub-label">Memuat pengaturan...</p>}
          {error && <p className="error-text">{error}</p>}
        </header>

        <div className="settings-grid">
          <div className="settings-col">
            <section className="card schedule-card" id="jadwal">
              <div className="card-head">
                <h2>Jadwal Pemilu</h2>
                <small>Terakhir diubah: {lastUpdated}</small>
              </div>
              <div className="schedule-grid">
                {timeline.map((stage) => (
              <div key={stage.id} className="schedule-row">
                <label>{stage.label}</label>
                <input
                  className="time-input"
                  type="datetime-local"
                  value={stage.start}
                  onChange={(event) => handleTimelineChange(stage.id, 'start', event.target.value)}
                />
                <input
                  className="time-input"
                  type="datetime-local"
                  value={stage.end}
                  onChange={(event) => handleTimelineChange(stage.id, 'end', event.target.value)}
                />
              </div>
            ))}
          </div>
              {!timelineValid && <p className="warning">Cek kembali jadwal. Ada tanggal yang bertumpuk.</p>}
              <div className="card-actions">
                <button className="btn-primary" type="button" onClick={handleSaveTimeline} disabled={savingSection === 'timeline'}>
                  {savingSection === 'timeline' ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </section>

            <section className="card rules-card">
              <h2>Hak Suara & Bobot</h2>
              <div className="rules-stack">
                <div className="rule-block">
                  <h3>Hak Suara</h3>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={rules.allowActiveStudents}
                      onChange={(event) => updateRule('allowActiveStudents', event.target.checked)}
                    />
                    Mahasiswa aktif
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={rules.allowLeaveStudents}
                      onChange={(event) => updateRule('allowLeaveStudents', event.target.checked)}
                    />
                    Mahasiswa cuti
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={rules.allowAlumni} onChange={(event) => updateRule('allowAlumni', event.target.checked)} />
                    Alumni
                  </label>
                </div>

                <div className="rule-block">
                  <h3>Bobot Suara</h3>
                  <div className="weight-row">
                    <label>
                      DPT Umum
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={rules.publicWeight}
                        onChange={(event) => updateRule('publicWeight', Number(event.target.value))}
                      />
                    </label>
                    <label>
                      DPT Khusus
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={rules.specialWeight}
                        onChange={(event) => updateRule('specialWeight', Number(event.target.value))}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-primary" type="button" onClick={handleSaveRules} disabled={savingSection === 'rules'}>
                  {savingSection === 'rules' ? 'Menyimpan...' : 'Simpan Aturan'}
                </button>
              </div>
            </section>

            <section className="card checklist-card">
              <h2>Syarat Suara Sah</h2>
              <ul className="checklist">
                <li>
                  <span className="dot" /> Pilih satu kandidat
                </li>
                <li>
                  <span className="dot" /> Konfirmasi final dilakukan
                </li>
                <li>
                  <span className="dot" /> Tidak ada duplikasi perangkat
                </li>
              </ul>
            </section>
          </div>

          <div className="settings-col">
            <section className="card branding-card" id="branding">
              <div className="card-head">
                <div>
                  <h2>Branding & Logo</h2>
                  <p className="sub-label">Upload logo terbaru untuk tampilan publik.</p>
                </div>
                <button className="btn-outline" type="button" onClick={handleResetBranding}>
                  Reset Default
                </button>
              </div>
              {brandingError && <p className="error-text">{brandingError}</p>}
              <div className="logo-upload-grid">
                <div className="logo-upload">
                  <p className="label">Logo Utama</p>
                  <div className="logo-preview-box">
                    {branding.primaryLogo ? (
                      <img src={branding.primaryLogo} alt="Logo utama" />
                    ) : (
                      <span className="logo-placeholder">Logo utama belum dipilih</span>
                    )}
                  </div>
                  <label className="upload-control">
                    <input type="file" accept="image/*" onChange={(event) => handleLogoUpload(event, 'primaryLogo')} />
                    <span>Unggah Logo Utama</span>
                  </label>
                  <button className="btn-link" type="button" onClick={() => markBrandingRemoval('primary')}>
                    Hapus logo utama
                  </button>
                  <p className="upload-hint">PNG/JPG, maks 2MB</p>
                </div>
                <div className="logo-upload">
                  <p className="label">Logo Sekunder</p>
                  <div className="logo-preview-box">
                    {branding.secondaryLogo ? (
                      <img src={branding.secondaryLogo} alt="Logo sekunder" />
                    ) : (
                      <span className="logo-placeholder">Opsional, ditampilkan berdampingan</span>
                    )}
                  </div>
                  <label className="upload-control">
                    <input type="file" accept="image/*" onChange={(event) => handleLogoUpload(event, 'secondaryLogo')} />
                    <span>Unggah Logo Sekunder</span>
                  </label>
                  <button className="btn-link" type="button" onClick={() => markBrandingRemoval('secondary')}>
                    Hapus logo sekunder
                  </button>
                  <p className="upload-hint">Rekomendasi rasio persegi</p>
                </div>
              </div>
              <div className="branding-preview">
                <p className="label">Preview</p>
                <div className="branding-preview-box">
                  {([branding.primaryLogo, branding.secondaryLogo].filter(Boolean) as string[]).length ? (
                    <PemiraLogos size="md" stacked customLogos={([branding.primaryLogo, branding.secondaryLogo].filter(Boolean) as string[])} />
                  ) : (
                    <span className="logo-placeholder">Belum ada logo yang diunggah</span>
                  )}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-primary" type="button" onClick={handleSaveBranding} disabled={savingSection === 'branding'}>
                  {savingSection === 'branding' ? 'Menyimpan...' : 'Simpan Branding'}
                </button>
              </div>
            </section>

            <section className="card mode-card" id="mode-voting">
              <h2>Voting Online</h2>
              <div className="field-stack">
                <p className="label">Mode Voting</p>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="voting-mode"
                    checked={mode === 'hybrid'}
                    disabled={isModeChangeDisabled}
                    onChange={() => setMode('hybrid')}
                  />
                  Hybrid (Online + TPS)
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="voting-mode"
                    checked={mode === 'online'}
                    disabled={isModeChangeDisabled}
                    onChange={() => setMode('online')}
                  />
                  Online saja
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="voting-mode"
                    checked={mode === 'tps'}
                    disabled={isModeChangeDisabled}
                    onChange={() => setMode('tps')}
                  />
                  TPS saja
                </label>
              </div>
              <div className="field-stack">
                <p className="label">Perangkat</p>
                <label className="radio-row">
                  <input type="radio" name="device" checked={rules.singleDeviceOnly} onChange={() => updateRule('singleDeviceOnly', true)} />
                  Hanya 1 perangkat
                </label>
                <label className="radio-row">
                  <input type="radio" name="device" checked={!rules.singleDeviceOnly} onChange={() => updateRule('singleDeviceOnly', false)} />
                  Multi perangkat
                </label>
              </div>
              <div className="field-stack">
                <p className="label">Lokasi</p>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="geolocation"
                    checked={!rules.geolocationRequired}
                    onChange={() => updateRule('geolocationRequired', false)}
                  />
                  Lokasi tidak wajib
                </label>
                <label className="radio-row">
                  <input type="radio" name="geolocation" checked={rules.geolocationRequired} onChange={() => updateRule('geolocationRequired', true)} />
                  Lokasi wajib
                </label>
              </div>
              <div className="card-actions">
                <button className="btn-primary" type="button" onClick={handleSaveMode} disabled={savingSection === 'mode'}>
                  {savingSection === 'mode' ? 'Menyimpan...' : 'Simpan Mode'}
                </button>
              </div>
            </section>

            <section className="card tps-card">
              <h2>Pengaturan TPS</h2>
              <div className="field-stack">
                <p className="label">QR Mode</p>
                <label className="radio-row">
                  <input type="radio" name="tps-mode" checked={rules.tpsMode === 'static'} onChange={() => updateRule('tpsMode', 'static')} />
                  Statis + Verifikasi Panitia
                </label>
                <label className="radio-row">
                  <input type="radio" name="tps-mode" checked={rules.tpsMode === 'dynamic'} onChange={() => updateRule('tpsMode', 'dynamic')} />
                  Dinamis (Auto Rotate 30s)
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={rules.requirePanitiaVerification}
                  onChange={(event) => updateRule('requirePanitiaVerification', event.target.checked)}
                />
                Verifikasi panitia wajib
              </label>
            </section>

            <section className="card danger-card">
              <h2>⚠ Zona Bahaya (Critical)</h2>
              <label className="check-row danger-check">
                <input type="checkbox" checked={security.lockVoting} onChange={handleLockVoting} />
                Lock Voting
              </label>
              <div className="card-actions danger-actions">
                <button className="btn-outline danger" type="button" onClick={handleResetTPS}>
                  Reset Queue TPS
                </button>
                <button className="btn-danger" type="button" onClick={handleResetElection}>
                  Reset Seluruh Suara & Data Pemilu
                </button>
                <p className="danger-note">Hanya untuk keadaan darurat.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminElectionSettings
