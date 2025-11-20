import { electionStatusOptions } from '../data/electionSettings'
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
    status,
    setStatus,
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
    saveSection,
    lastUpdated,
    isModeChangeDisabled,
  } = useElectionSettings()

  const updateRule = <K extends keyof ElectionRules>(field: K, value: ElectionRules[K]) => {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveMode = () => {
    saveSection('mode', () => {
      console.log('Mode saved', { status, mode })
    })
  }

  const handleSaveTimeline = () => {
    if (!timelineValid) {
      alert('Periksa kembali jadwal. Pastikan tidak ada tanggal yang tumpang tindih.')
      return
    }
    saveSection('timeline', () => console.log('Timeline saved', timeline))
  }

  const handleSaveRules = () => {
    saveSection('rules', () => console.log('Rules saved', rules))
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
    <div className="admin-settings-page">
      <header className="settings-header">
        <div>
          <p className="label">PEMIRA UNIWA</p>
          <h1>Pengaturan Pemilu</h1>
          <p>Atur jadwal, mode voting, dan aturan utama pemilu.</p>
        </div>
      </header>

      <section className="card mode-card">
        <h2>Status & Mode Pemilu</h2>
        <div className="field-group">
          <label>Status Pemilu Saat Ini</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            {electionStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small>Override manual. Status otomatis mengikuti timeline ({statusLabel}).</small>
        </div>

        <div className="field-group">
          <label>Mode Voting</label>
          <div className="mode-options">
            {(Object.keys(votingModeLabels) as VotingMode[]).map((value) => (
              <label key={value} className={isModeChangeDisabled && mode !== value ? 'disabled' : ''}>
                <input
                  type="radio"
                  name="voting-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                  disabled={isModeChangeDisabled}
                />
                {votingModeLabels[value]}
              </label>
            ))}
          </div>
          {mode === 'hybrid' && (
            <div className="tps-hint">
              <p>TPS Aktif: 5</p>
              <button className="btn-link" type="button" onClick={() => (window.location.href = '/tps-panel')}>
                Kelola TPS →
              </button>
            </div>
          )}
        </div>

        <button className="btn-primary" type="button" onClick={handleSaveMode} disabled={savingSection === 'mode'}>
          {savingSection === 'mode' ? 'Menyimpan...' : 'Simpan Perubahan Mode'}
        </button>
      </section>

      <section className="card timeline-card">
        <div className="card-heading">
          <div>
            <h2>Pengaturan Jadwal</h2>
            <small>Terakhir diubah: {lastUpdated}</small>
          </div>
        </div>
        <div className="timeline-table">
          <div className="timeline-header">
            <span>Tahap</span>
            <span>Mulai</span>
            <span>Selesai</span>
          </div>
          {timeline.map((stage) => (
            <div key={stage.id} className="timeline-row">
              <span>{stage.label}</span>
              <input type="datetime-local" value={stage.start} onChange={(event) => handleTimelineChange(stage.id, 'start', event.target.value)} />
              <input type="datetime-local" value={stage.end} onChange={(event) => handleTimelineChange(stage.id, 'end', event.target.value)} />
            </div>
          ))}
        </div>
        {!timelineValid && <p className="warning">Cek kembali jadwal. Ada tanggal yang bertumpuk.</p>}
        <button className="btn-primary" type="button" onClick={handleSaveTimeline} disabled={savingSection === 'timeline'}>
          {savingSection === 'timeline' ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
      </section>

      <section className="card rules-card">
        <h2>Aturan Pemilu</h2>
        <div className="rules-grid">
          <div>
            <h3>Hak Suara</h3>
            <label>
              <input
                type="checkbox"
                checked={rules.allowActiveStudents}
                onChange={(event) => updateRule('allowActiveStudents', event.target.checked)}
              />
              Mahasiswa aktif
            </label>
            <label>
              <input
                type="checkbox"
                checked={rules.allowLeaveStudents}
                onChange={(event) => updateRule('allowLeaveStudents', event.target.checked)}
              />
              Mahasiswa cuti
            </label>
            <label>
              <input type="checkbox" checked={rules.allowAlumni} onChange={(event) => updateRule('allowAlumni', event.target.checked)} />
              Alumni
            </label>
          </div>
          <div>
            <h3>Bobot Suara</h3>
            <label>
              Bobot DPT Umum
              <input type="number" min={1} max={5} value={rules.publicWeight} onChange={(event) => updateRule('publicWeight', Number(event.target.value))} />
            </label>
            <label>
              Bobot DPT Khusus
              <input type="number" min={1} max={5} value={rules.specialWeight} onChange={(event) => updateRule('specialWeight', Number(event.target.value))} />
            </label>
          </div>
          <div>
            <h3>Voting Online</h3>
            <label>
              <input
                type="radio"
                name="device"
                checked={rules.singleDeviceOnly}
                onChange={() => updateRule('singleDeviceOnly', true)}
              />
              Hanya 1 perangkat
            </label>
            <label>
              <input type="radio" name="device" checked={!rules.singleDeviceOnly} onChange={() => updateRule('singleDeviceOnly', false)} />
              Multi perangkat
            </label>
            <label>
              <input
                type="radio"
                name="geolocation"
                checked={rules.geolocationRequired}
                onChange={() => updateRule('geolocationRequired', true)}
              />
              Lokasi wajib
            </label>
            <label>
              <input
                type="radio"
                name="geolocation"
                checked={!rules.geolocationRequired}
                onChange={() => updateRule('geolocationRequired', false)}
              />
              Lokasi tidak wajib
            </label>
          </div>
          <div>
            <h3>Pengaturan TPS</h3>
            <label>
              <input type="radio" name="tps-mode" checked={rules.tpsMode === 'static'} onChange={() => updateRule('tpsMode', 'static')} />
              QR Statis + Verifikasi Panitia
            </label>
            <label>
              <input type="radio" name="tps-mode" checked={rules.tpsMode === 'dynamic'} onChange={() => updateRule('tpsMode', 'dynamic')} />
              QR Dinamis + Auto Rotate 30s
            </label>
            <label>
              <input
                type="checkbox"
                checked={rules.requirePanitiaVerification}
                onChange={(event) => updateRule('requirePanitiaVerification', event.target.checked)}
              />
              Verifikasi panitia wajib
            </label>
          </div>
          <div>
            <h3>Syarat Suara Sah</h3>
            <ul>
              <li>Memilih satu kandidat</li>
              <li>Konfirmasi final dilakukan</li>
              <li>Tidak ditemukan duplikasi device/token</li>
            </ul>
          </div>
        </div>
        <button className="btn-primary" type="button" onClick={handleSaveRules} disabled={savingSection === 'rules'}>
          {savingSection === 'rules' ? 'Menyimpan...' : 'Simpan Aturan Pemilu'}
        </button>
      </section>

      <section className="card security-card">
        <h2>Kunci & Keamanan</h2>
        <div className="security-grid">
          <div>
            <h3>Lock Voting</h3>
            <label>
              <input type="checkbox" checked={security.lockVoting} onChange={handleLockVoting} />
              Kunci semua suara
            </label>
            <small>Aktifkan saat voting ditutup agar tidak ada data yang berubah.</small>
          </div>
          <div>
            <h3>Reset TPS</h3>
            <button className="btn-outline" type="button" onClick={handleResetTPS}>
              Reset Queue TPS
            </button>
          </div>
          <div>
            <h3>Reset Pemilu (Super Admin)</h3>
            <p className="warning-text">Aksi ini tidak dapat dibatalkan. Hanya untuk keadaan darurat.</p>
            <button className="btn-danger" type="button" onClick={handleResetElection}>
              Reset Seluruh Suara & Data Pemilu
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminElectionSettings
