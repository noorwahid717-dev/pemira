import { useEffect, useMemo, useState, type JSX } from 'react'
import { fetchPublicPhases, type PublicElection, type PublicPhase } from '../services/publicElection'
import { getActiveElectionId } from '../state/activeElection'
import '../styles/HeroSection.css'

type Props = {
  election: PublicElection | null
  loading?: boolean
  error?: string | null
}

const FALLBACK_VOTING_DATE = (import.meta.env.VITE_FALLBACK_VOTING_START as string | undefined) ?? '2026-01-01T08:00:00+07:00'

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  target: Date
}

type PhaseKey = 'REGISTRATION' | 'VERIFICATION' | 'CAMPAIGN' | 'QUIET_PERIOD' | 'VOTING' | 'RECAP'

type TimelinePhase = {
  key: PhaseKey
  label: string
  start?: string | null
  end?: string | null
  status: 'active' | 'upcoming' | 'completed'
}

const PHASE_ORDER: PhaseKey[] = ['REGISTRATION', 'VERIFICATION', 'CAMPAIGN', 'QUIET_PERIOD', 'VOTING', 'RECAP']

const PHASE_META: Record<PhaseKey, string> = {
  REGISTRATION: 'Pendaftaran',
  VERIFICATION: 'Verifikasi Berkas',
  CAMPAIGN: 'Kampanye',
  QUIET_PERIOD: 'Masa Tenang',
  VOTING: 'Voting',
  RECAP: 'Rekapitulasi',
}

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Pemilu disiapkan',
  REGISTRATION: 'Pendaftaran pemilih',
  REGISTRATION_OPEN: 'Pendaftaran pemilih',
  VERIFICATION: 'Verifikasi berkas',
  CAMPAIGN: 'Masa kampanye',
  QUIET_PERIOD: 'Masa tenang',
  VOTING: 'Voting dibuka',
  VOTING_OPEN: 'Voting dibuka',
  VOTING_CLOSED: 'Voting ditutup',
  RECAPITULATION: 'Rekapitulasi hasil',
  RECAP: 'Rekapitulasi hasil',
  CLOSED: 'Pemilu selesai',
  ARCHIVED: 'Arsip',
}

const normalizePhaseKey = (value?: string | null): PhaseKey | null => {
  if (!value) return null
  const normalized = value.toString().trim().replace(/-/g, '_').toUpperCase()
  if (normalized === 'QUIET') return 'QUIET_PERIOD'
  if (normalized === 'RECAPITULATION') return 'RECAP'
  if ((PHASE_ORDER as string[]).includes(normalized)) return normalized as PhaseKey
  return null
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
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
      label: source?.label ?? (source as any)?.name ?? PHASE_META[key],
      start,
      end,
      status: determineStatus(start, end),
    }
  })
}

const resolveTargetDate = (election?: PublicElection | null, phases?: TimelinePhase[]): Date => {
  const now = Date.now()
  
  const votingPhase = phases?.find((item) => item.key === 'VOTING')

  let votingStart: Date | null = votingPhase ? parseDate(votingPhase.start) : null
  let votingEnd: Date | null = votingPhase ? parseDate(votingPhase.end) : null

  // Fallback to election voting dates
  if (!votingStart) votingStart = parseDate(election?.voting_start_at)
  if (!votingEnd) votingEnd = parseDate(election?.voting_end_at)

  // Before voting starts: countdown to start
  if (votingStart && votingStart.getTime() > now) return votingStart
  
  // During voting: countdown to end
  if (votingStart && votingEnd && now >= votingStart.getTime() && now <= votingEnd.getTime()) return votingEnd
  
  // After voting or no dates: fallback
  return parseDate(FALLBACK_VOTING_DATE) ?? new Date('2026-01-01T00:00:00Z')
}

const formatPhaseRange = (start?: string | null, end?: string | null): string => {
  const format = (value?: string | null) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  const startLabel = format(start)
  const endLabel = format(end)
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
  return startLabel || endLabel || 'Jadwal belum ditentukan'
}

const buildCountdown = (target: Date): CountdownState => {
  const now = Date.now()
  const diff = target.getTime() - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return {
    days: Math.max(days, 0),
    hours: Math.max(hours, 0),
    minutes: Math.max(minutes, 0),
    seconds: Math.max(seconds, 0),
    isPast: diff <= 0,
    target,
  }
}

const HeroSection = ({ election, loading = false, error }: Props): JSX.Element => {
  const hasElection = Boolean(election)
  const isNoActiveElectionError = error?.toLowerCase().includes('pemilu aktif')
  const showNoElectionState = !hasElection && !loading
  
  // Use current_phase from backend (calculated) instead of status
  const effectivePhase = election?.current_phase ?? election?.status
  const statusLabel = loading ? 'Memuat status...' : hasElection ? statusLabelMap[effectivePhase ?? ''] ?? 'Pemilu aktif' : 'Belum ada pemilu aktif'
  const [timelinePhases, setTimelinePhases] = useState<TimelinePhase[]>(() => buildTimeline([]))
  const votingPhase = useMemo(() => timelinePhases.find((phase) => phase.key === 'VOTING'), [timelinePhases])
  const startDate = useMemo(() => parseDate(votingPhase?.start ?? election?.voting_start_at), [election?.voting_start_at, votingPhase])
  const endDate = useMemo(() => parseDate(votingPhase?.end ?? election?.voting_end_at), [election?.voting_end_at, votingPhase])
  const now = Date.now()
  const startMs = startDate?.getTime()
  const endMs = endDate?.getTime()
  const isBeforeVoting = Boolean(startMs !== undefined && now < startMs)
  const isVotingWindow = Boolean(startMs !== undefined && endMs !== undefined && now >= startMs && now <= endMs)
  const isAfterVoting = Boolean(endMs !== undefined && now > endMs)

  const derivedState: 'pre' | 'voting' | 'post' | 'unknown' = isBeforeVoting
    ? 'pre'
    : isVotingWindow
      ? 'voting'
      : isAfterVoting
        ? 'post'
        : 'unknown'

  const showLiveBadge = derivedState === 'voting'
  const primaryCtaLabel = 'Registrasi'
  const primaryCtaHref = '/register'
  const subtitle = 'Sistem pemilu kampus yang aman, rahasia, dan mudah digunakan oleh seluruh mahasiswa, dosen, dan staf UNIWA.'
  const friendlyError =
    !loading && error && !isNoActiveElectionError ? 'Data jadwal belum dapat dimuat. Panitia sedang memperbarui informasi.' : null
  const targetDate = useMemo(() => resolveTargetDate(election, timelinePhases), [election, timelinePhases])
  const [countdown, setCountdown] = useState<CountdownState>(() => buildCountdown(targetDate))

  useEffect(() => {
    let interval: number | undefined

    const tick = () => setCountdown(buildCountdown(targetDate))

    const startInterval = () => {
      if (interval) window.clearInterval(interval)
      tick()
      interval = window.setInterval(() => {
        if (document.visibilityState === 'hidden') return
        tick()
      }, 1000)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (interval) window.clearInterval(interval)
      } else {
        startInterval()
      }
    }

    startInterval()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (interval) window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [targetDate])

  useEffect(() => {
    const controller = new AbortController()
    const isAbortError = (err: unknown) => (err as any)?.name === 'AbortError'
    const loadPhases = async () => {
      try {
        const electionId = election?.id ?? getActiveElectionId()
        if (!electionId) return
        const phasesResponse = await fetchPublicPhases(electionId, { signal: controller.signal }).catch(() => election?.phases ?? [])
        let phases = Array.isArray(phasesResponse) && phasesResponse.length > 0 ? phasesResponse : election?.phases ?? []

        if ((!phases || phases.length === 0) && getActiveElectionId() && getActiveElectionId() !== electionId) {
          const fallback = await fetchPublicPhases(getActiveElectionId(), { signal: controller.signal }).catch(() => [])
          if (fallback && fallback.length > 0) {
            phases = fallback
          }
        }

        setTimelinePhases(buildTimeline(phases))
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) return
        // keep silent fail, will show fallback text
      }
    }

    void loadPhases()

    return () => controller.abort()
  }, [election])

  const targetLabel = useMemo(
    () => targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [targetDate],
  )

  const displayCountdownTitle = derivedState === 'voting' ? 'Sisa waktu voting' : 'Menuju hari voting'
  const displayCountdownCaption =
    derivedState === 'voting' ? 'Pemilihan akan ditutup otomatis setelah waktu habis.' : 'Voting dimulai pada tanggal yang tertera.'

  return (
    <section className="hero" id="tentang">
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-brand">
            <span className="hero-brand-text">PEMIRA UNIWA 2025</span>
          </div>

          <h1 className="hero-title">Pemilihan Ketua BEM Universitas Wahidiyah</h1>

          <p className="hero-subtitle">{subtitle}</p>

          <div className="hero-badge">
            <span className="badge-status-dot">●</span>
            <span className="badge-status-text">{statusLabel}</span>
          </div>

          {showNoElectionState ? (
            <div className="countdown-card no-election">
              <div className="no-election-icon">📋</div>
              <h3 className="no-election-title">Tidak ada pemilu aktif</h3>
              <p className="no-election-text">Panitia belum membuka jadwal resmi pemilihan.</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          ) : (
            <div className="countdown-card">
              <div className="countdown-header">
                <div className="countdown-header-left">
                  <div>
                    <h3 className="countdown-title">{displayCountdownTitle}</h3>
                    <p className="countdown-date">{targetLabel}</p>
                  </div>
                </div>
              {showLiveBadge && <span className="badge-live">● Sedang berlangsung</span>}
            </div>
              <div className="countdown-grid">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Hari</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Jam</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Menit</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Detik</span>
                </div>
              </div>
              <p className="countdown-caption">{displayCountdownCaption}</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          )}

          <div className="hero-cta">
            <a href={primaryCtaHref}>
              <button className="btn-primary btn-large">{primaryCtaLabel}</button>
            </a>
            <a href="/panduan">
              <button className="btn-outline btn-large">Panduan pemilihan</button>
            </a>
          </div>

          <div className="hero-note">
            <a className="hero-guide-link" href="#kandidat">
              Lihat calon & jadwal lengkap →
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="election-timeline">
              <h3 className="timeline-title">Tahapan Pemilihan</h3>
              <div className="timeline-phases">
                {timelinePhases.map((phase) => {
                  const stateClass = phase.status === 'active' ? 'active' : phase.status === 'completed' ? 'completed' : 'upcoming'
                  return (
                    <div key={phase.key} className={`timeline-phase ${stateClass}`}>
                      <div className="phase-dot"></div>
                      <div className="phase-content">
                        <h4 className="phase-title">{phase.label}</h4>
                        <p className="phase-desc">{formatPhaseRange(phase.start, phase.end)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
