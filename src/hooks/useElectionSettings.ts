import { useCallback, useEffect, useMemo, useState } from 'react'
import { electionStatusOptions, initialElectionStatus, initialRules, initialTimeline, initialVotingMode } from '../data/electionSettings'
import { fetchAdminElection, updateAdminElection, type AdminElectionResponse } from '../services/adminElection'
import type { ElectionRules, ElectionStatus, TimelineStage, VotingMode } from '../types/electionSettings'
import { useAdminAuth } from './useAdminAuth'

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

const mapStatusFromApi = (status?: string): ElectionStatus => {
  switch ((status ?? '').toUpperCase()) {
    case 'REGISTRATION':
    case 'DRAFT':
      return 'pendaftaran'
    case 'CAMPAIGN':
      return 'kampanye'
    case 'VOTING_OPEN':
      return 'voting_dibuka'
    case 'VOTING_CLOSED':
    case 'CLOSED':
    case 'ARCHIVED':
      return 'voting_ditutup'
    default:
      return 'kampanye'
  }
}

export const useElectionSettings = () => {
  const { token } = useAdminAuth()
  const [status, setStatus] = useState<ElectionStatus>(initialElectionStatus)
  const [mode, setMode] = useState<VotingMode>(initialVotingMode)
  const [timeline, setTimeline] = useState<TimelineStage[]>(initialTimeline)
  const [rules, setRules] = useState<ElectionRules>(initialRules)
  const [security, setSecurity] = useState({ lockVoting: false })
  const [saving, setSaving] = useState<{ section: string | null }>({ section: null })
  const [lastUpdated, setLastUpdated] = useState('12 Juni 10:32 oleh Admin Dwi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const isModeChangeDisabled = status === 'voting_dibuka' || status === 'voting_ditutup'

  const applyElectionData = useCallback((election: AdminElectionResponse) => {
    setStatus(mapStatusFromApi(election.status))
    setMode(mapModeFromFlags(election.online_enabled, election.tps_enabled))
    setLastUpdated(formatTimestamp(election.updated_at ?? election.created_at ?? new Date().toISOString()))
    setTimeline((prev) =>
      prev.map((stage) =>
        stage.id === 'voting_dibuka'
          ? {
              ...stage,
              start: formatInputDateTime(election.voting_start_at) || stage.start,
              end: formatInputDateTime(election.voting_end_at ?? election.voting_start_at) || stage.end,
            }
          : stage,
      ),
    )
  }, [])

  const refreshElection = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const election = await fetchAdminElection(token)
      applyElectionData(election)
    } catch (err) {
      console.error('Failed to load election settings', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat pengaturan pemilu')
    } finally {
      setLoading(false)
    }
  }, [applyElectionData, token])

  useEffect(() => {
    void refreshElection()
  }, [refreshElection])

  const handleTimelineChange = useCallback((id: TimelineStage['id'], field: 'start' | 'end', value: string) => {
    setTimeline((prev) => prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage)))
  }, [])

  const validateTimeline = useCallback(() => {
    for (let i = 0; i < timeline.length - 1; i += 1) {
      const currentEnd = new Date(timeline[i].end).getTime()
      const nextStart = new Date(timeline[i + 1].start).getTime()
      if (currentEnd > nextStart) {
        return false
      }
    }
    return true
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

  const saveMode = useCallback(async () => {
    await saveSection('mode', async () => {
      if (!token) return
      const payload = mapModeToFlags(mode)
      const updated = await updateAdminElection(token, payload)
      applyElectionData(updated)
    })
  }, [applyElectionData, mode, saveSection, token])

  const saveTimeline = useCallback(async () => {
    await saveSection('timeline', async () => {
      // Timeline detail belum tersedia di API, jadi simpan lokal saja.
      return
    })
  }, [saveSection])

  const saveRules = useCallback(async () => {
    await saveSection('rules', async () => {
      // Placeholder untuk integrasi aturan ketika endpoint tersedia.
      return
    })
  }, [saveSection])

  const timelineValid = validateTimeline()

  const statusLabel = useMemo(() => electionStatusOptions.find((option) => option.value === status)?.label ?? '', [status])

  return {
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
    security,
    setSecurity,
    savingSection: saving.section,
    lastUpdated,
    isModeChangeDisabled,
    saveMode,
    saveTimeline,
    saveRules,
    loading,
    error,
    refreshElection,
  }
}
