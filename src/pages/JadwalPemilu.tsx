import { useEffect, useMemo, useState, type JSX } from 'react'
import Header from '../components/Header'
import { fetchCurrentElection, fetchPublicPhases, type PublicPhase } from '../services/publicElection'
import { getActiveElectionId } from '../state/activeElection'
import '../styles/JadwalPemilu.css'

type PhaseKey = 'REGISTRATION' | 'VERIFICATION' | 'CAMPAIGN' | 'QUIET_PERIOD' | 'VOTING' | 'RECAP'

type TimelinePhase = {
    key: PhaseKey
    label: string
    description: string
    start?: string | null
    end?: string | null
    status: 'active' | 'upcoming' | 'completed'
}

const PHASE_ORDER: PhaseKey[] = ['REGISTRATION', 'VERIFICATION', 'CAMPAIGN', 'QUIET_PERIOD', 'VOTING', 'RECAP']

const PHASE_META: Record<PhaseKey, { label: string; description: string }> = {
    REGISTRATION: { label: 'Pendaftaran', description: 'Pendaftaran pemilu untuk mahasiswa, dosen, dan staf UNIWA' },
    VERIFICATION: { label: 'Verifikasi Berkas', description: 'Verifikasi dokumen dan berkas pemilu' },
    CAMPAIGN: { label: 'Kampanye', description: 'Periode kampanye kandidat' },
    QUIET_PERIOD: { label: 'Masa Tenang', description: 'Masa tenang sebelum pemungutan suara' },
    VOTING: { label: 'Voting', description: 'Proses pemungutan suara online' },
    RECAP: { label: 'Rekapitulasi', description: 'Pengumuman hasil akhir pemilihan' },
}

const normalizePhaseKey = (value?: string | null): PhaseKey | null => {
    if (!value) return null
    const normalized = value.toString().trim().replace(/-/g, '_').toUpperCase()
    if (normalized === 'QUIET') return 'QUIET_PERIOD'
    if (normalized === 'RECAPITULATION') return 'RECAP'
    if ((PHASE_ORDER as string[]).includes(normalized)) return normalized as PhaseKey
    return null
}

const determineStatus = (start?: string | null, end?: string | null): 'active' | 'upcoming' | 'completed' => {
    const now = Date.now()
    const startTime = start ? new Date(start).getTime() : Number.NaN
    const endTime = end ? new Date(end).getTime() : Number.NaN

    if (!Number.isNaN(startTime) && now < startTime) return 'upcoming'
    if (!Number.isNaN(startTime) && Number.isNaN(endTime) && now >= startTime) return 'active'
    if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && now >= startTime && now <= endTime) return 'active'
    if (!Number.isNaN(endTime) && now > endTime) return 'completed'
    return 'upcoming'
}

const formatPhaseDate = (value?: string | null): string => {
    if (!value) return 'Belum ditentukan'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Belum ditentukan'
    const datePart = parsed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timePart = parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${datePart}, pukul ${timePart}`
}

const buildTimeline = (phases: PublicPhase[]): TimelinePhase[] => {
    const lookup = new Map<PhaseKey, PublicPhase>()
    phases.forEach((phase) => {
        const key = normalizePhaseKey(phase.key ?? phase.phase)
        if (key) lookup.set(key, phase)
    })

    return PHASE_ORDER.map((key) => {
        const source = lookup.get(key)
        const start = (source as any)?.start_at ?? (source as any)?.startAt ?? (source as any)?.start ?? null
        const end = (source as any)?.end_at ?? (source as any)?.endAt ?? (source as any)?.end ?? null
        return {
            key,
            label: source?.label ?? (source as any)?.name ?? PHASE_META[key].label,
            description: PHASE_META[key].description,
            start,
            end,
            status: determineStatus(start, end),
        }
    })
}

const JadwalPemilu = (): JSX.Element => {
    const [timelinePhases, setTimelinePhases] = useState<TimelinePhase[]>(() => buildTimeline([]))
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const isAbortError = (err: unknown) => (err as any)?.name === 'AbortError'
        let isMounted = true
        const controller = new AbortController()
        const load = async () => {
            try {
                const election = await fetchCurrentElection({ signal: controller.signal })
                const phasesResponse = await fetchPublicPhases(election.id, { signal: controller.signal }).catch(() => election?.phases ?? [])
                const fallbackElectionId = getActiveElectionId()
                let phases = Array.isArray(phasesResponse) && phasesResponse.length > 0 ? phasesResponse : election?.phases ?? []

                if ((!phases || phases.length === 0) && fallbackElectionId && fallbackElectionId !== election.id) {
                    const fallbackPhases = await fetchPublicPhases(fallbackElectionId, { signal: controller.signal }).catch(() => [])
                    if (fallbackPhases && fallbackPhases.length > 0) {
                        phases = fallbackPhases
                    }
                }

                if (!isMounted) return
                setTimelinePhases(buildTimeline(phases ?? []))
                setError(null)
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted || !isMounted) return
                console.error('Gagal memuat jadwal pemilu', err)
                setError('Gagal memuat jadwal pemilu. Silakan coba lagi.')
                setTimelinePhases(buildTimeline([]))
            } finally {
                if (isMounted && !controller.signal.aborted) setLoading(false)
            }
        }

        void load()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    const hasAtLeastOneSchedule = useMemo(() => timelinePhases.some((phase) => phase.start || phase.end), [timelinePhases])

    return (
        <div className="jadwal-pemilu-page">
            <Header />

            <main className="jadwal-container">
                <div className="jadwal-header">
                    <h1 className="jadwal-title">Jadwal Pemilihan</h1>
                    <p className="jadwal-subtitle">
                        Informasi lengkap tentang tahapan dan jadwal pemilihan BEM Universitas
                    </p>
                </div>

                <div className="jadwal-timeline">
                    {loading && <p className="timeline-info">Memuat jadwal pemilu...</p>}
                    {!loading && error && <p className="timeline-info error">{error}</p>}
                    {!loading && !error && !hasAtLeastOneSchedule && <p className="timeline-info">Jadwal pemilu belum ditentukan.</p>}
                    <div className="timeline-phases">
                        {timelinePhases.map((phase) => (
                            <div
                                key={phase.key}
                                className={`timeline-phase ${phase.status === 'active' ? 'active' : phase.status === 'upcoming' ? 'upcoming' : ''}`}
                            >
                                <div className="phase-dot"></div>
                                <div className="phase-content">
                                    <h3 className="phase-title">{phase.label}</h3>
                                    <p className="phase-desc">{phase.description}</p>
                                    <div className="phase-dates">
                                        <div className="date-range">
                                            <div className="date-item">
                                                <span className="date-label">Mulai:</span>
                                                <span className="date-value">{formatPhaseDate(phase.start)}</span>
                                            </div>
                                            <div className="date-item">
                                                <span className="date-label">Selesai:</span>
                                                <span className="date-value">{formatPhaseDate(phase.end)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="jadwal-footer">
                    <div className="jadwal-note">
                        <h3 className="note-title">Informasi Penting</h3>
                        <ul className="note-list">
                            <li>Jadwal dapat berubah sesuai dengan keputusan panitia pemilihan</li>
                            <li>Pastikan untuk memantau pengumuman resmi dari panitia</li>
                            <li>Semua waktu menggunakan WIB (Waktu Indonesia Barat)</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default JadwalPemilu
