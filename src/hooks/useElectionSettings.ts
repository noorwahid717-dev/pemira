import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { electionStatusOptions, initialBranding, initialElectionStatus, initialRules, initialTimeline, initialVotingMode } from '../data/electionSettings'
import {
  archiveAdminElection,
  closeAdminElectionVoting,
  fetchAdminElection,
  fetchAdminElectionSettings,
  fetchElectionMode,
  fetchElectionPhases,
  fetchElectionSummary,
  openAdminElectionVoting,
  updateAdminElection,
  updateElectionMode,
  updateElectionPhases,
  type AdminElectionResponse,
  type AdminElectionUpdatePayload,
  type ElectionPhase,
  type ElectionSummary,
} from '../services/adminElection'
import { fetchAdminCandidates } from '../services/adminCandidates'
import { fetchAdminDpt } from '../services/adminDpt'
import { fetchAdminTpsList } from '../services/adminTps'
import { deleteBrandingLogo, fetchBranding, fetchBrandingLogo, uploadBrandingLogo, type BrandingMetadata } from '../services/adminBranding'
import { fetchCurrentElection } from '../services/publicElection'
import type { BrandingSettings, ElectionRules, ElectionStatus, TimelineStage, VotingMode } from '../types/electionSettings'
import type { ApiError } from '../utils/apiClient'
import { useAdminAuth } from './useAdminAuth'
import { useActiveElection } from './useActiveElection'
import { getActiveElectionId } from '../state/activeElection'

type BasicElectionInfo = {
  name: string
  slug: string
  year: string
  academicYear: string
  description: string
}

const formatTimestamp = (value: string) => new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

const formatInputDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const mapModeFromFlags = (online?: boolean, tps?: boolean): VotingMode => {
  if (online && tps) return 'hybrid'
  if (online) return 'online'
  if (tps) return 'tps'
  return 'online'
}

const mapModeToFlags = (mode: VotingMode) => {
  if (mode === 'hybrid') return { online_enabled: true, tps_enabled: true }
  if (mode === 'tps') return { online_enabled: false, tps_enabled: true }
  return { online_enabled: true, tps_enabled: false }
}

const phaseToTimelineId: Record<string, TimelineStage['id']> = {
  registration: 'pendaftaran',
  verification: 'pemeriksaan',
  campaign: 'kampanye',
  quiet: 'masa_tenang',
  quiet_period: 'masa_tenang',
  voting: 'voting_dibuka',
  recap: 'rekapitulasi',
}

const timelineIdToPhase: Record<TimelineStage['id'], ElectionPhase['phase']> = {
  pendaftaran: 'registration',
  pemeriksaan: 'verification',
  verifikasi: 'verification',
  kampanye: 'campaign',
  masa_tenang: 'quiet',
  voting_dibuka: 'voting',
  voting: 'voting',
  rekapitulasi: 'recap',
  selesai: 'recap',
}

const normalizePhaseKey = (value?: string | null) => (value ? value.toLowerCase() : '')

const mapStatusFromApi = (status?: string): ElectionStatus => {
  switch ((status ?? '').toUpperCase()) {
    case 'REGISTRATION_OPEN':
    case 'REGISTRATION':
    case 'DRAFT':
      return 'pendaftaran'
    case 'CAMPAIGN':
      return 'kampanye'
    case 'QUIET':
    case 'QUIET_PERIOD':
      return 'masa_tenang'
    case 'VOTING_OPEN':
      return 'voting_dibuka'
    case 'VOTING_CLOSED':
    case 'CLOSED':
    case 'ARCHIVED':
      return 'voting_ditutup'
    case 'RECAP':
      return 'rekapitulasi'
    default:
      return 'kampanye'
  }
}

const toIsoOrNull = (value: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export const useElectionSettings = () => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const thisYear = new Date().getFullYear()
  const [basicInfo, setBasicInfo] = useState<BasicElectionInfo>({
    name: 'Pemira Kampus',
    slug: 'pemira-kampus',
    year: thisYear.toString(),
    academicYear: `${thisYear - 1}/${thisYear}`,
    description: 'Pemilihan Ketua & Wakil BEM serta anggota MPM Universitas Wijaya Kusuma.',
  })
  const [currentElectionId, setCurrentElectionId] = useState<number>(getActiveElectionId())
  const [status, setStatus] = useState<ElectionStatus>(initialElectionStatus)
  const [mode, setMode] = useState<VotingMode>(initialVotingMode)
  const [timeline, setTimeline] = useState<TimelineStage[]>(initialTimeline)
  const [rules, setRules] = useState<ElectionRules>(initialRules)
  const [branding, setBrandingState] = useState<BrandingSettings>(initialBranding)
  const [brandingUploads, setBrandingUploads] = useState<{ primary?: File; secondary?: File }>({})
  const [brandingRemoval, setBrandingRemoval] = useState<{ primary: boolean; secondary: boolean }>({ primary: false, secondary: false })
  const [security, setSecurity] = useState({ lockVoting: false })
  const [summary, setSummary] = useState<ElectionSummary>({
    total_candidates: 0,
    total_voters: 0,
    online_voters: 0,
    tps_voters: 0,
    active_tps: 0,
  })
  const [saving, setSaving] = useState<{ section: string | null }>({ section: null })
  const [lastUpdated, setLastUpdated] = useState('12 Juni 10:32 oleh Admin Dwi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const brandingObjectUrlRef = useRef<{ primary?: string; secondary?: string }>({})
  const resolveElectionId = useCallback(
    () => currentElectionId || activeElectionId || getActiveElectionId(),
    [activeElectionId, currentElectionId],
  )

  const isModeChangeDisabled = status === 'voting_dibuka' || status === 'voting_ditutup'

  const applyElectionData = useCallback((election: AdminElectionResponse) => {
    setCurrentElectionId(election.id)
    setStatus(mapStatusFromApi(election.status))
    setMode(mapModeFromFlags(election.online_enabled, election.tps_enabled))
    setLastUpdated(formatTimestamp(election.updated_at ?? election.created_at ?? new Date().toISOString()))
    setBasicInfo((prev) => ({
      ...prev,
      name: election.name ?? prev.name,
      slug: election.slug ?? prev.slug,
      year: election.year ? election.year.toString() : prev.year,
      academicYear: election.academic_year ?? (prev.academicYear || (election.year ? `${election.year - 1}/${election.year}` : prev.academicYear)),
      description: election.description ?? prev.description,
    }))
  }, [])

  const setTimelineFromPhases = useCallback((phasesPayload: ElectionPhase[] | { phases?: ElectionPhase[]; items?: ElectionPhase[] } | null | undefined) => {
    const phases = Array.isArray(phasesPayload)
      ? phasesPayload
      : Array.isArray((phasesPayload as any)?.phases)
        ? ((phasesPayload as { phases: ElectionPhase[] }).phases ?? [])
        : Array.isArray((phasesPayload as any)?.items)
          ? ((phasesPayload as { items: ElectionPhase[] }).items ?? [])
          : []

    setTimeline((prev) =>
      prev.map((stage) => {
        const targetPhase = phases.find((item) => {
          const key = normalizePhaseKey((item as any).phase ?? (item as any).key)
          const mapped = phaseToTimelineId[key]
          if (mapped === stage.id) return true
          return stage.id === 'verifikasi' && mapped === 'pemeriksaan'
        })
        const startValue = targetPhase ? (targetPhase as any).start_at ?? (targetPhase as any).startAt : undefined
        const endValue = targetPhase ? (targetPhase as any).end_at ?? (targetPhase as any).endAt : undefined
        return {
          ...stage,
          start: targetPhase ? formatInputDateTime(startValue) ?? '' : '',
          end: targetPhase ? formatInputDateTime(endValue) ?? '' : '',
        }
      }),
    )
  }, [])

  const revokeLogoUrl = useCallback((slot: 'primary' | 'secondary') => {
    const existing = brandingObjectUrlRef.current[slot]
    if (existing) {
      URL.revokeObjectURL(existing)
      brandingObjectUrlRef.current[slot] = undefined
    }
  }, [])

  const setBrandingPreview = useCallback(
    (slot: 'primary' | 'secondary', preview?: string, file?: File) => {
      const key = slot === 'primary' ? 'primaryLogo' : 'secondaryLogo'
      setBrandingState((prev) => ({ ...prev, [key]: preview }))
      setBrandingUploads((prev) => ({ ...prev, [slot]: file ?? undefined }))
      setBrandingRemoval((prev) => ({ ...prev, [slot]: false }))
    },
    [],
  )

  const markBrandingRemoval = useCallback(
    (slot: 'primary' | 'secondary') => {
      const key = slot === 'primary' ? 'primaryLogo' : 'secondaryLogo'
      setBrandingState((prev) => ({ ...prev, [key]: undefined }))
      setBrandingUploads((prev) => ({ ...prev, [slot]: undefined }))
      setBrandingRemoval((prev) => ({ ...prev, [slot]: true }))
      revokeLogoUrl(slot)
    },
    [revokeLogoUrl],
  )

  const resetBrandingDraft = useCallback(() => {
    markBrandingRemoval('primary')
    markBrandingRemoval('secondary')
  }, [markBrandingRemoval])

  const loadBrandingLogos = useCallback(
    async (meta: BrandingMetadata, electionId: number) => {
      if (!token) return

      const [primaryUrl, secondaryUrl] = await Promise.all([
        meta.primary_logo_id ? fetchBrandingLogo(token, 'primary', electionId).catch(() => null) : Promise.resolve(null),
        meta.secondary_logo_id ? fetchBrandingLogo(token, 'secondary', electionId).catch(() => null) : Promise.resolve(null),
      ])

      if (primaryUrl !== null) {
        revokeLogoUrl('primary')
        if (primaryUrl) brandingObjectUrlRef.current.primary = primaryUrl
      }
      if (secondaryUrl !== null) {
        revokeLogoUrl('secondary')
        if (secondaryUrl) brandingObjectUrlRef.current.secondary = secondaryUrl
      }

      setBrandingState({
        primaryLogo: primaryUrl || undefined,
        secondaryLogo: secondaryUrl || undefined,
      })
      setBrandingRemoval({ primary: false, secondary: false })
      setBrandingUploads({})
      if (meta.updated_at) {
        setLastUpdated(formatTimestamp(meta.updated_at))
      }
    },
    [revokeLogoUrl, token],
  )

  const fetchElectionWithFallback = useCallback(
    async (targetId: number) => {
      try {
        const election = await fetchAdminElection(token as string, targetId)
        return election
      } catch (err) {
        const apiErr = err as ApiError
        if (apiErr?.status === 404) {
          const current = await fetchCurrentElection()
          setCurrentElectionId(current.id)
          return fetchAdminElection(token as string, current.id)
        }
        throw err
      }
    },
    [token],
  )

  const refreshBranding = useCallback(
    async (targetId?: number) => {
      if (!token) {
        setBrandingState(initialBranding)
        setBrandingUploads({})
        setBrandingRemoval({ primary: false, secondary: false })
        revokeLogoUrl('primary')
        revokeLogoUrl('secondary')
        return
      }
      try {
        const electionId = targetId || resolveElectionId()
        const meta = await fetchBranding(token, electionId)
        await loadBrandingLogos(meta, electionId)
      } catch (err) {
        console.error('Failed to load branding', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat branding')
      }
    },
    [loadBrandingLogos, resolveElectionId, revokeLogoUrl, token],
  )

  const refreshElection = useCallback(
    async (targetId?: number) => {
      if (!token) return
      setLoading(true)
      setError(undefined)
      try {
        const electionId = targetId ?? resolveElectionId()
        let resolvedElectionId = electionId

        try {
          const settings = await fetchAdminElectionSettings(token, electionId)
          if (settings?.election) {
            applyElectionData(settings.election as AdminElectionResponse)
            resolvedElectionId = settings.election.id
            setCurrentElectionId(settings.election.id)
          }
          if (settings?.phases) setTimelineFromPhases(settings.phases as ElectionPhase[] | { phases?: ElectionPhase[] })
          if (settings?.mode_settings) setMode(mapModeFromFlags(settings.mode_settings.online_enabled, settings.mode_settings.tps_enabled))
        } catch (settingsErr) {
          console.warn('Fallback to legacy settings endpoints', settingsErr)
          const election = await fetchElectionWithFallback(electionId)
          applyElectionData(election)
          resolvedElectionId = election.id
          setCurrentElectionId(election.id)
          const phases = await fetchElectionPhases(token, election.id).catch(() => null)
          if (phases) setTimelineFromPhases(phases)
          const modeSettings = await fetchElectionMode(token, election.id).catch(() => null)
          if (modeSettings) setMode(mapModeFromFlags(modeSettings.online_enabled, modeSettings.tps_enabled))
        }

        const summaryData = await fetchElectionSummary(token, resolvedElectionId).catch(() => null)
        if (summaryData) {
          setSummary(summaryData)
        } else {
          setSummary((prev) => prev)
        }

        // Fallback counts if summary missing/zero
        if (!summaryData || !summaryData.total_candidates || !summaryData.total_voters || !summaryData.active_tps) {
          try {
            const [candidates, dptSummary, tpsList] = await Promise.all([
              fetchAdminCandidates(token, resolvedElectionId).catch(() => []),
              fetchAdminDpt(token, new URLSearchParams({ limit: '1', page: '1' }), resolvedElectionId).catch(() => ({ total: 0 })),
              fetchAdminTpsList(token, resolvedElectionId).catch(() => []),
            ])
            setSummary({
              total_candidates: candidates.length || summary.total_candidates,
              total_voters: (dptSummary as any).total ?? summary.total_voters,
              online_voters: summary.online_voters,
              tps_voters: summary.tps_voters,
              active_tps: tpsList.filter((tps) => tps.status === 'active').length || summary.active_tps,
            })
          } catch {
            // ignore fallback errors
          }
        }

        await refreshBranding(resolvedElectionId)
      } catch (err) {
        console.error('Failed to load election settings', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat pengaturan pemilu')
      } finally {
        setLoading(false)
      }
    },
    [applyElectionData, fetchElectionWithFallback, refreshBranding, resolveElectionId, setTimelineFromPhases, token],
  )

  useEffect(() => {
    void refreshElection()
  }, [refreshElection])

  useEffect(() => {
    if (activeElectionId && activeElectionId !== currentElectionId) {
      setCurrentElectionId(activeElectionId)
      void refreshElection(activeElectionId)
    }
  }, [activeElectionId, currentElectionId, refreshElection])

  useEffect(() => {
    if (!token) {
      setBrandingState(initialBranding)
      setBrandingUploads({})
      setBrandingRemoval({ primary: false, secondary: false })
      revokeLogoUrl('primary')
      revokeLogoUrl('secondary')
    }
  }, [revokeLogoUrl, token])

  useEffect(
    () => () => {
      revokeLogoUrl('primary')
      revokeLogoUrl('secondary')
    },
    [revokeLogoUrl],
  )

  const handleTimelineChange = useCallback((id: TimelineStage['id'], field: 'start' | 'end', value: string) => {
    setTimeline((prev) => prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage)))
  }, [])

  const validateTimeline = useCallback(() => {
    for (let i = 0; i < timeline.length - 1; i += 1) {
      const currentEndValue = timeline[i].end
      const nextStartValue = timeline[i + 1].start
      if (!currentEndValue || !nextStartValue) continue
      const currentEnd = new Date(currentEndValue).getTime()
      const nextStart = new Date(nextStartValue).getTime()
      if (Number.isNaN(currentEnd) || Number.isNaN(nextStart)) continue
      if (currentEnd > nextStart) {
        return false
      }
    }
    return true
  }, [timeline])

  const updateBasicInfo = useCallback(<K extends keyof BasicElectionInfo>(field: K, value: BasicElectionInfo[K]) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  const buildPhasesPayload = useCallback((): ElectionPhase[] => {
    const phaseOrder: ElectionPhase['phase'][] = ['registration', 'verification', 'campaign', 'quiet', 'voting', 'recap']
    const collected = new Map<ElectionPhase['phase'], ElectionPhase>()

    timeline.forEach((stage) => {
      const phaseKey = timelineIdToPhase[stage.id]
      if (!phaseKey) return
      const existing = collected.get(phaseKey) ?? { phase: phaseKey }
      if (stage.start) existing.start_at = toIsoOrNull(stage.start)
      if (stage.end) existing.end_at = toIsoOrNull(stage.end)
      collected.set(phaseKey, existing)
    })

    return phaseOrder.map((phase) => collected.get(phase) ?? { phase, start_at: null, end_at: null })
  }, [timeline])

  const saveSection = useCallback(async (section: string, callback: () => Promise<void> | void) => {
    setSaving({ section })
    setError(undefined)
    try {
      await callback()
      setLastUpdated(formatTimestamp(new Date().toISOString()))
    } catch (err) {
      console.error(`Failed to save section ${section}`, err)
      setError((err as { message?: string })?.message ?? 'Gagal menyimpan pengaturan')
      throw err
    } finally {
      setSaving({ section: null })
    }
  }, [])

  const saveBasicInfo = useCallback(async () => {
    await saveSection('info', async () => {
      if (!token) return
      const electionId = resolveElectionId()
      const payload: AdminElectionUpdatePayload = {
        name: basicInfo.name,
        slug: basicInfo.slug,
        code: basicInfo.slug,
        description: basicInfo.description,
        academic_year: basicInfo.academicYear,
      }
      const parsedYear = Number.parseInt(basicInfo.year, 10)
      if (!Number.isNaN(parsedYear)) {
        payload.year = parsedYear
      }
      const updated = await updateAdminElection(token, payload, electionId)
      applyElectionData(updated)
    })
  }, [applyElectionData, basicInfo.academicYear, basicInfo.description, basicInfo.name, basicInfo.slug, basicInfo.year, resolveElectionId, saveSection, token])

  const saveMode = useCallback(async () => {
    await saveSection('mode', async () => {
      if (!token) return
      const electionId = resolveElectionId()
      const payload = mapModeToFlags(mode)
      const updated = await updateElectionMode(token, payload, electionId)
      setMode(mapModeFromFlags(updated.online_enabled, updated.tps_enabled))
    })
  }, [mode, resolveElectionId, saveSection, token])

  const saveTimeline = useCallback(async () => {
    await saveSection('timeline', async () => {
      if (!token) return
       const electionId = resolveElectionId()
      const phasesPayload = buildPhasesPayload()
      const updatedPhases = await updateElectionPhases(token, phasesPayload, electionId)
      setTimelineFromPhases(updatedPhases)
    })
  }, [buildPhasesPayload, resolveElectionId, saveSection, setTimelineFromPhases, token])

  const saveRules = useCallback(async () => {
    await saveSection('rules', async () => {
      // Placeholder untuk integrasi aturan ketika endpoint tersedia.
      return
    })
  }, [saveSection])

  const saveBranding = useCallback(async () => {
    await saveSection('branding', async () => {
      if (!token) return
      const electionId = resolveElectionId()
      const operations: Promise<unknown>[] = []

      if (brandingRemoval.primary) {
        operations.push(deleteBrandingLogo(token, 'primary', electionId))
      }
      if (brandingRemoval.secondary) {
        operations.push(deleteBrandingLogo(token, 'secondary', electionId))
      }
      if (brandingUploads.primary) {
        operations.push(uploadBrandingLogo(token, 'primary', brandingUploads.primary, electionId))
      }
      if (brandingUploads.secondary) {
        operations.push(uploadBrandingLogo(token, 'secondary', brandingUploads.secondary, electionId))
      }

      if (operations.length) {
        await Promise.all(operations)
      }

      await refreshBranding(electionId)
    })
    setBrandingUploads({})
    setBrandingRemoval({ primary: false, secondary: false })
  }, [brandingRemoval.primary, brandingRemoval.secondary, brandingUploads.primary, brandingUploads.secondary, refreshBranding, resolveElectionId, saveSection, token])

  const openVoting = useCallback(async () => {
    await saveSection('voting-control', async () => {
      if (!token) return
      const updated = await openAdminElectionVoting(token, resolveElectionId())
      applyElectionData(updated)
    })
  }, [applyElectionData, resolveElectionId, saveSection, token])

  const closeVoting = useCallback(async () => {
    await saveSection('voting-control', async () => {
      if (!token) return
      const updated = await closeAdminElectionVoting(token, resolveElectionId())
      applyElectionData(updated)
    })
  }, [applyElectionData, resolveElectionId, saveSection, token])

  const archiveElection = useCallback(async () => {
    await saveSection('archive', async () => {
      if (!token) return
      const updated = await archiveAdminElection(token, resolveElectionId())
      applyElectionData(updated)
    })
  }, [applyElectionData, resolveElectionId, saveSection, token])

  const timelineValid = validateTimeline()

  const statusLabel = useMemo(() => electionStatusOptions.find((option) => option.value === status)?.label ?? '', [status])

  return {
    basicInfo,
    updateBasicInfo,
    saveBasicInfo,
    status,
    statusLabel,
    setStatus,
    mode,
    setMode,
    timeline,
    handleTimelineChange,
    timelineValid,
    rules,
    setRules,
    branding,
    setBranding: setBrandingPreview,
    queueBrandingUpload: setBrandingPreview,
    markBrandingRemoval,
    resetBrandingDraft,
    security,
    setSecurity,
    summary,
    savingSection: saving.section,
    lastUpdated,
    isModeChangeDisabled,
    isVotingOpen: status === 'voting_dibuka',
    openVoting,
    closeVoting,
    archiveElection,
    saveMode,
    saveTimeline,
    saveRules,
    saveBranding,
    loading,
    error,
    refreshElection,
  }
}
