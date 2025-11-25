import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useElectionSettings } from '../hooks/useElectionSettings'
import { useToast } from '../components/Toast'
import { usePopup } from '../components/Popup'
import { useActiveElection } from '../hooks/useActiveElection'
import type { VotingMode } from '../types/electionSettings'
import '../styles/AdminElectionSettings.css'

const votingModeLabels: Record<VotingMode, string> = {
  online: 'Online saja',
  tps: 'TPS saja',
  hybrid: 'Hybrid (Online + TPS)',
}

const tabs: { id: 'info' | 'timeline' | 'mode' | 'relations'; label: string }[] = [
  { id: 'info', label: 'Informasi Umum' },
  { id: 'timeline', label: 'Tahapan & Jadwal' },
  { id: 'mode', label: 'Mode Pemilihan' },
  { id: 'relations', label: 'Keterkaitan Data' },
]

const quickLinks = [
  { label: 'Kelola Kandidat', path: '/admin/kandidat' },
  { label: 'Kelola DPT', path: '/admin/dpt' },
  { label: 'Kelola TPS', path: '/admin/tps' },
  { label: 'Lihat Hasil Sementara', path: '/admin/monitoring' },
]

const AdminElectionSettings = (): JSX.Element => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { showPopup } = usePopup()
  const {
    activeElectionId,
    defaultElectionId,
    elections,
    loading: activeSettingsLoading,
    updating: activeSettingsUpdating,
    error: activeElectionError,
    setActiveElection,
    createElection,
  } = useActiveElection()
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('info')
  const [onlineLoginUrl, setOnlineLoginUrl] = useState('https://pemira.uniwa.ac.id')
  const [maxOnlineSessions, setMaxOnlineSessions] = useState(3)
  const [tpsActiveCount, setTpsActiveCount] = useState(5)
  const [selectedElectionId, setSelectedElectionId] = useState<number | ''>(activeElectionId)
  const [newElection, setNewElection] = useState({ name: '', slug: '', year: new Date().getFullYear(), description: '' })
  const {
    basicInfo,
    updateBasicInfo,
    saveBasicInfo,
    status,
    statusLabel,
    mode,
    setMode,
    timeline,
    handleTimelineChange,
    timelineValid,
    rules,
    setRules,
    summary,
    savingSection,
    lastUpdated,
    isModeChangeDisabled,
    isVotingOpen,
    openVoting,
    closeVoting,
    archiveElection,
    saveMode,
    saveTimeline,
    loading,
    error,
    refreshElection,
  } = useElectionSettings()

  const allowOnline = mode === 'online' || mode === 'hybrid'
  const allowTPS = mode === 'tps' || mode === 'hybrid'

  const statusTone = useMemo(() => {
    if (status === 'voting_dibuka') return 'success'
    if (status === 'voting_ditutup' || status === 'rekapitulasi' || status === 'selesai') return 'muted'
    if (status === 'masa_tenang') return 'warning'
    return 'info'
  }, [status])

  useEffect(() => {
    if (summary?.active_tps !== undefined && summary.active_tps !== null) {
      setTpsActiveCount(summary.active_tps)
    }
  }, [summary.active_tps])

  useEffect(() => {
    setSelectedElectionId(activeElectionId)
  }, [activeElectionId])

  const sortedElections = useMemo(
    () =>
      [...elections].sort((a, b) => {
        const yearA = a.year ?? 0
        const yearB = b.year ?? 0
        return yearB - yearA || a.id - b.id
      }),
    [elections],
  )

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0'
    return value.toLocaleString('id-ID')
  }

  const formatRange = (start?: string, end?: string) => {
    const format = (value?: string) => {
      if (!value) return ''
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return ''
      return parsed.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    }
    const startLabel = format(start)
    const endLabel = format(end)
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
    return startLabel || endLabel || 'Belum diatur'
  }

  const toggleModeCheckbox = (target: 'online' | 'tps', checked: boolean) => {
    if (target === 'online') {
      if (checked && allowTPS) setMode('hybrid')
      else if (checked) setMode('online')
      else if (allowTPS) setMode('tps')
    } else {
      if (checked && allowOnline) setMode('hybrid')
      else if (checked) setMode('tps')
      else if (allowOnline) setMode('online')
    }
  }

  const handleSaveInfo = async () => {
    try {
      await saveBasicInfo()
      showToast('Informasi pemilu berhasil disimpan.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan informasi pemilu.', 'error')
    }
  }

  const handleSaveTimeline = async () => {
    if (!timelineValid) {
      showToast('Periksa kembali jadwal. Pastikan tidak ada tanggal yang tumpang tindih.', 'warning')
      return
    }
    try {
      await saveTimeline()
      showToast('Jadwal pemilu diperbarui.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan jadwal pemilu.', 'error')
    }
  }

  const handleSaveMode = async () => {
    try {
      await saveMode()
      showToast('Pengaturan mode pemilihan disimpan.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan mode pemilihan.', 'error')
    }
  }

  const handleArchive = () => {
    void (async () => {
      const confirmed = await showPopup({
        title: 'Arsipkan Pemilu',
        message: 'Yakin mengarsipkan pemilu ini? Aksi tidak dapat dibatalkan.',
        type: 'warning',
        confirmText: 'Arsipkan',
        cancelText: 'Batal',
      })
      if (!confirmed) return
      try {
        await archiveElection()
        showToast('Pemilu berhasil diarsipkan.', 'success')
      } catch (err) {
        console.error(err)
        showToast('Gagal mengarsipkan pemilu.', 'error')
      }
    })()
  }

  const handleVotingControl = async () => {
    if (isVotingOpen) {
      const confirmed = await showPopup({
        title: 'Tutup Voting Sekarang',
        message: 'Yakin menutup voting? Tindakan ini tidak dapat dibatalkan dan pemilih tidak bisa memberikan suara.',
        type: 'warning',
        confirmText: 'Tutup Voting',
        cancelText: 'Batal',
      })
      if (confirmed) {
        try {
          await closeVoting()
          showToast('Voting berhasil ditutup.', 'success')
        } catch (err) {
          console.error(err)
          showToast('Gagal menutup voting.', 'error')
        }
      }
      return
    }

    const confirmed = await showPopup({
      title: 'Buka Voting Sekarang',
      message: 'Buka voting sesuai jadwal yang telah ditentukan?',
      type: 'info',
      confirmText: 'Buka Voting',
      cancelText: 'Nanti saja',
    })
    if (confirmed) {
      try {
        await openVoting()
        showToast('Voting dibuka.', 'success')
      } catch (err) {
        console.error(err)
        showToast('Gagal membuka voting.', 'error')
      }
    }
  }

  const handleActivateElection = async () => {
    const targetId = Number(selectedElectionId)
    if (!targetId || targetId === activeElectionId) {
      showToast('Pilih pemilu berbeda untuk dijadikan aktif.', 'info')
      return
    }
    try {
      const updatedId = await setActiveElection(targetId)
      await refreshElection(updatedId)
      showToast(`Pemilu aktif diubah ke ID ${updatedId}.`, 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal mengubah pemilu aktif.', 'error')
    }
  }

  const handleCreateElection = async () => {
    const parsedYear = Number.parseInt(String(newElection.year), 10)
    if (!newElection.name.trim() || !newElection.slug.trim() || Number.isNaN(parsedYear)) {
      showToast('Lengkapi nama, slug, dan tahun pemilu.', 'warning')
      return
    }

    try {
      const created = await createElection({
        name: newElection.name.trim(),
        slug: newElection.slug.trim(),
        year: parsedYear,
        description: newElection.description.trim() || undefined,
      })
      showToast('Pemilu baru berhasil dibuat.', 'success')
      setSelectedElectionId(created.id)
      await setActiveElection(created.id)
      await refreshElection(created.id)
      setNewElection({ name: '', slug: '', year: new Date().getFullYear(), description: '' })
    } catch (err) {
      console.error(err)
      showToast('Gagal membuat pemilu baru.', 'error')
    }
  }

  const quickAction = (path: string) => {
    navigate(path)
  }

  return (
    <AdminLayout title="Pengaturan Pemilu">
      <div className="admin-settings-page">
        <header className="settings-hero">
          <div className="hero-left">
            <button className="back-link" type="button" onClick={() => navigate('/admin')}>
              ◀ Kembali ke daftar pemilu
            </button>
            <div className="hero-title">
              <div className="hero-text">
                <p className="eyebrow">Pemira</p>
                <h1>{basicInfo.name || 'Pemilu Aktif'}</h1>
                <div className="meta-row">
                  <span className="meta-chip">Tahun: {basicInfo.year || '-'}</span>
                  <span className="meta-chip">Slug: {basicInfo.slug || '-'}</span>
                  <span className={`status-chip badge-${statusTone}`}>{statusLabel || 'Status pemilu'}</span>
                </div>
                <p className="sub-label">Mode: {votingModeLabels[mode]}</p>
                <p className="sub-label">Terakhir diubah: {lastUpdated}</p>
                {loading && <p className="sub-label">Memuat pengaturan...</p>}
                {error && <p className="error-text">{error}</p>}
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" type="button" onClick={() => navigate('/admin/pengaturan/panduan')}>
              Panduan Alur Pemilihan
            </button>
          </div>
        </header>

        <section className="card active-election-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Pemilu Aktif</p>
              <h2>Atur Pemilu yang Dipakai Panel Admin</h2>
              <p className="sub-label">Default ID: {defaultElectionId || '-'}</p>
            </div>
            {(activeElectionError || error) && <span className="error-text">{activeElectionError || error}</span>}
          </div>
          <div className="active-election-grid">
            <div className="selector-panel">
              <label>
                Pilih Pemilu Aktif
                <select
                  value={selectedElectionId}
                  onChange={(event) => setSelectedElectionId(event.target.value ? Number(event.target.value) : '')}
                  disabled={activeSettingsLoading || activeSettingsUpdating || (!sortedElections.length && !selectedElectionId)}
                >
                  {sortedElections.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || `Pemilu ${item.year ?? ''}`} {item.year ? `(${item.year})` : ''} • ID {item.id}
                    </option>
                  ))}
                  {!sortedElections.length && (
                    <option value={activeElectionId}>Pemilu aktif ID {activeElectionId}</option>
                  )}
                </select>
              </label>
              <button
                className="btn-primary"
                type="button"
                onClick={handleActivateElection}
                disabled={activeSettingsUpdating || activeSettingsLoading}
              >
                {activeSettingsUpdating ? 'Menyimpan...' : 'Set sebagai Pemilu Aktif'}
              </button>
              <p className="hint">Semua modul admin akan otomatis menggunakan ID ini.</p>
            </div>

            <div className="selector-panel new-election-form">
              <p className="eyebrow">Buat Pemilu Baru</p>
              <label>
                Nama Pemilu
                <input
                  type="text"
                  value={newElection.name}
                  onChange={(event) => setNewElection((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="PEMIRA BEM 2027"
                />
              </label>
              <div className="split-field">
                <label>
                  Slug
                  <input
                    type="text"
                    value={newElection.slug}
                    onChange={(event) => setNewElection((prev) => ({ ...prev, slug: event.target.value }))}
                    placeholder="pemira-2027"
                  />
                </label>
                <label>
                  Tahun
                  <input
                    type="number"
                    value={newElection.year}
                    onChange={(event) => setNewElection((prev) => ({ ...prev, year: Number(event.target.value) }))}
                    min={2000}
                  />
                </label>
              </div>
              <label>
                Deskripsi
                <textarea
                  value={newElection.description}
                  onChange={(event) => setNewElection((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Deskripsi singkat pemilu..."
                />
              </label>
              <div className="card-actions">
                <button className="btn-primary" type="button" onClick={handleCreateElection} disabled={activeSettingsUpdating}>
                  {activeSettingsUpdating ? 'Memproses...' : 'Buat & Aktifkan'}
                </button>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => setNewElection({ name: '', slug: '', year: new Date().getFullYear(), description: '' })}
                  disabled={activeSettingsUpdating}
                >
                  Reset Draft
                </button>
              </div>
            </div>
          </div>
          {activeSettingsLoading && <p className="sub-label">Memuat daftar pemilu...</p>}
        </section>

        <div className="tabs-card">
          <div className="tab-list">
            {tabs.map((tab) => (
              <button key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} type="button" onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-layout">
          <div className="settings-main">
            {activeTab === 'info' && (
              <>
                <section className="card info-card" id="informasi-umum">
                  <div className="card-head">
                    <div>
                      <p className="eyebrow">Informasi Umum</p>
                      <h2>Pengaturan Dasar Pemilu</h2>
                    </div>
                    <span className={`status-chip badge-${statusTone}`}>{statusLabel || 'Status tidak diketahui'}</span>
                  </div>

                  <div className="info-grid">
                    <label>
                      Nama Pemilu
                      <input type="text" value={basicInfo.name} onChange={(event) => updateBasicInfo('name', event.target.value)} placeholder="Contoh: PEMIRA UNIWA 2025" />
                    </label>
                    <label>
                      Deskripsi Singkat
                      <textarea value={basicInfo.description} onChange={(event) => updateBasicInfo('description', event.target.value)} placeholder="Pemilihan Ketua & Wakil BEM ..." />
                    </label>
                    <div className="split-field">
                      <label>
                        Tahun Akademik
                        <input type="text" value={basicInfo.academicYear} onChange={(event) => updateBasicInfo('academicYear', event.target.value)} placeholder="2024/2025" />
                      </label>
                      <label>
                        Tahun
                        <input type="number" value={basicInfo.year} onChange={(event) => updateBasicInfo('year', event.target.value)} placeholder="2025" />
                      </label>
                    </div>
                    <div className="split-field">
                      <label>
                        Slug
                        <input type="text" value={basicInfo.slug} onChange={(event) => updateBasicInfo('slug', event.target.value)} placeholder="pemira-uniwa-2025" />
                      </label>
                      <label>
                        Status Pemilu
                        <div className="readonly-field">
                          <span className={`status-chip badge-${statusTone}`}>{statusLabel || 'Status pemilu'}</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="btn-primary" type="button" onClick={handleSaveInfo} disabled={savingSection === 'info'}>
                      {savingSection === 'info' ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button className="btn-outline danger" type="button" onClick={handleArchive} disabled={savingSection === 'archive'}>
                      Arsipkan Pemilu
                    </button>
                  </div>
                </section>

                <section className="card quick-links">
                  <div className="card-head">
                    <div>
                      <p className="eyebrow">Akses Cepat</p>
                      <h2>Modul Terkait</h2>
                    </div>
                  </div>
                  <div className="quick-links-grid">
                    {quickLinks.map((link) => (
                      <button key={link.label} className="quick-link" type="button" onClick={() => quickAction(link.path)}>
                        <span>{link.label}</span>
                        <span className="arrow">→</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'timeline' && (
              <>
                <section className="card timeline-card">
                  <div className="card-head">
                    <div>
                      <p className="eyebrow">Tahapan & Jadwal</p>
                      <h2>Timeline Pemira</h2>
                    </div>
                    <small>Terakhir diubah: {lastUpdated}</small>
                  </div>

                  <div className="timeline-rail">
                    {timeline.map((stage, index) => (
                      <div key={stage.id} className="timeline-node">
                        <div className={`node-dot ${index === 0 ? 'start' : ''} ${index === timeline.length - 1 ? 'end' : ''}`} />
                        <div className="node-label">
                          <p className="label">{stage.label}</p>
                          <p className="range">{formatRange(stage.start, stage.end)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="timeline-table">
                    <div className="table-head">
                      <span>Tahap</span>
                      <span>Mulai</span>
                      <span>Selesai</span>
                    </div>
                    {timeline.map((stage) => (
                      <div key={stage.id} className="table-row">
                        <span className="stage-name">{stage.label}</span>
                        <input
                          className="time-input"
                          type="datetime-local"
                          value={stage.start}
                          onChange={(event) => handleTimelineChange(stage.id, 'start', event.target.value)}
                        />
                        <input className="time-input" type="datetime-local" value={stage.end} onChange={(event) => handleTimelineChange(stage.id, 'end', event.target.value)} />
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

                <section className="card notes-card">
                  <h3>Catatan Sistem</h3>
                  <ul>
                    <li>Tahapan bergeser otomatis mengikuti waktu sekarang.</li>
                    <li>Voting hanya bisa dibuka saat waktu masuk range Voting.</li>
                  </ul>
                </section>
              </>
            )}

            {activeTab === 'mode' && (
              <section className="card mode-card">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Mode Pemilihan</p>
                    <h2>Online / TPS / Hybrid</h2>
                  </div>
                  <span className="mode-label">{votingModeLabels[mode]}</span>
                </div>

                <div className="mode-options">
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={allowOnline}
                      disabled={isModeChangeDisabled}
                      onChange={(event) => toggleModeCheckbox('online', event.target.checked)}
                    />
                    Online (via platform web)
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={allowTPS} disabled={isModeChangeDisabled} onChange={(event) => toggleModeCheckbox('tps', event.target.checked)} />
                    Offline via TPS (QR Pendaftaran + Surat Suara)
                  </label>
                </div>

                <div className="mode-panels">
                  <div className="mode-panel">
                    <h3>Pengaturan Online</h3>
                    <label>
                      URL Login Pemilih Online
                      <input type="text" value={onlineLoginUrl} onChange={(event) => setOnlineLoginUrl(event.target.value)} />
                    </label>
                    <label>
                      Max sesi login per pemilih
                      <input type="number" min={1} value={maxOnlineSessions} onChange={(event) => setMaxOnlineSessions(Number(event.target.value || 0))} />
                    </label>
                    <label className="check-row">
                      <input type="checkbox" checked={rules.singleDeviceOnly} onChange={(event) => setRules((prev) => ({ ...prev, singleDeviceOnly: event.target.checked }))} />
                      Batasi hanya 1 perangkat
                    </label>
                    <label className="check-row">
                      <input type="checkbox" checked={rules.geolocationRequired} onChange={(event) => setRules((prev) => ({ ...prev, geolocationRequired: event.target.checked }))} />
                      Lokasi wajib saat login
                    </label>
                  </div>

                  <div className="mode-panel">
                    <div className="panel-head">
                      <h3>Pengaturan TPS</h3>
                      <button className="btn-link" type="button" onClick={() => quickAction('/admin/tps')}>
                        Kelola TPS
                      </button>
                    </div>
                    <label>
                      Jumlah TPS aktif
                      <input type="number" min={0} value={tpsActiveCount} onChange={(event) => setTpsActiveCount(Number(event.target.value || 0))} />
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={rules.requirePanitiaVerification}
                        onChange={(event) => setRules((prev) => ({ ...prev, requirePanitiaVerification: event.target.checked }))}
                      />
                      Pemilih sudah check-in
                    </label>
                    <label className="check-row">
                      <input type="checkbox" checked={rules.tpsMode === 'dynamic'} onChange={(event) => setRules((prev) => ({ ...prev, tpsMode: event.target.checked ? 'dynamic' : 'static' }))} />
                      QR paslon valid dan terekam (mode rotasi)
                    </label>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="btn-primary" type="button" onClick={handleSaveMode} disabled={savingSection === 'mode'}>
                    {savingSection === 'mode' ? 'Menyimpan...' : 'Simpan Pengaturan Mode'}
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'relations' && (
              <section className="card relations-card">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Keterkaitan Data</p>
                    <h2>Ringkasan Modul</h2>
                  </div>
                </div>
                <div className="relations-grid">
                  <div className="relation-tile">
                    <div className="tile-head">
                      <p className="label">Kandidat</p>
                      <button className="btn-link" type="button" onClick={() => quickAction('/admin/kandidat')}>
                        Kelola
                      </button>
                    </div>
                    <p className="stat">{formatNumber(summary.total_candidates)} Kandidat</p>
                  </div>
                  <div className="relation-tile">
                    <div className="tile-head">
                      <p className="label">DPT</p>
                      <button className="btn-link" type="button" onClick={() => quickAction('/admin/dpt')}>
                        Kelola
                      </button>
                    </div>
                    <p className="stat">{formatNumber(summary.total_voters)} Pemilih</p>
                    <p className="sub-stat">
                      Mode Online: {formatNumber(summary.online_voters)} | TPS: {formatNumber(summary.tps_voters)}
                    </p>
                  </div>
                  <div className="relation-tile">
                    <div className="tile-head">
                      <p className="label">TPS</p>
                      <button className="btn-link" type="button" onClick={() => quickAction('/admin/tps')}>
                        Kelola
                      </button>
                    </div>
                    <p className="stat">TPS Aktif: {formatNumber(tpsActiveCount)}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="settings-aside">
            <div className="card voting-control">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Kontrol Voting</p>
                  <h3>Status Voting</h3>
                </div>
              </div>
              <div className="voting-status">
                <span className={`status-chip badge-${isVotingOpen ? 'success' : 'muted'}`}>{isVotingOpen ? 'VOTING_OPEN' : 'BELUM DIBUKA'}</span>
              </div>
              <button className={`btn-${isVotingOpen ? 'danger' : 'primary'}`} type="button" onClick={handleVotingControl} disabled={savingSection === 'voting-control'}>
                {savingSection === 'voting-control' ? 'Memproses...' : isVotingOpen ? 'Tutup Voting Sekarang' : 'Buka Voting Sekarang'}
              </button>
              <p className="hint">Voting hanya dapat dibuka ketika jadwal Voting aktif.</p>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminElectionSettings
