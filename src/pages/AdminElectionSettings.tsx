import AdminLayout from '../components/admin/AdminLayout'
import { useElectionSettings } from '../hooks/useElectionSettings'
import type { ElectionRules, VotingMode } from '../types/electionSettings'
import '../styles/AdminElectionSettings.css'

const votingModeLabels: Record<VotingMode, string> = {
  online: 'Online saja',
  tps: 'TPS saja',
  hybrid: 'Hybrid (Online + TPS)',
}

const AdminElectionSettings = (): JSX.Element => {
  const {
    statusLabel,
    mode,
    setMode,
    timeline,
    handleTimelineChange,
    timelineValid,
    rules,
    setRules,
    security,
    setSecurity,
    savingSection,
    lastUpdated,
    isModeChangeDisabled,
    saveMode,
    saveTimeline,
    saveRules,
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
            <div className="status-chip">
              <span className="dot live" />
              <span>{statusLabel || 'Aktif'}</span>
            </div>
          </div>
          <p className="sub-label">Mode: {votingModeLabels[mode]}</p>
          {loading && <p className="sub-label">Memuat pengaturan...</p>}
          {error && <p className="error-text">{error}</p>}
        </header>

        <div className="settings-grid">
          <div className="settings-col">
            <section className="card schedule-card">
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
            <section className="card mode-card">
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
