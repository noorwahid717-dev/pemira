import { useEffect, useMemo, useState } from 'react'
import {
  activityLogs,
  adminOverview,
  candidateVoteStats,
  facultyParticipationStats,
  participationStats,
  quickActions,
  tpsStatusSummary,
} from '../data/adminDashboard'
import type { AdminOverview, CandidateVoteStat, FacultyParticipationStat, ParticipationStats, SystemInfo, TPSStatusSummary } from '../types/admin'
import type { CandidateAdmin } from '../types/candidateAdmin'
import { useAdminAuth } from './useAdminAuth'
import { fetchMonitoringLive, type MonitoringLiveResponse } from '../services/adminMonitoring'
import { fetchAdminCandidates } from '../services/adminCandidates'
import { fetchAdminElection, type AdminElectionResponse } from '../services/adminElection'
import { fetchCurrentElection } from '../services/publicElection'
import { ACTIVE_ELECTION_ID } from '../config/env'
import type { ApiError } from '../utils/apiClient'

const stageLabels: Record<AdminOverview['stage'], string> = {
  pendaftaran: 'Pendaftaran',
  kampanye: 'Kampanye',
  voting_dibuka: 'Voting Dibuka',
  voting_ditutup: 'Voting Ditutup',
  rekapitulasi: 'Rekapitulasi',
}

const mapStatusToStage = (status?: string): AdminOverview['stage'] => {
  switch ((status ?? '').toUpperCase()) {
    case 'REGISTRATION':
    case 'REGISTRATION_OPEN':
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

const formatPeriod = (start?: string | null, end?: string | null) => {
  if (!start && !end) return 'Jadwal belum diatur'
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  const startLabel = start ? new Date(start).toLocaleDateString('id-ID', opts) : ''
  const endLabel = end ? new Date(end).toLocaleDateString('id-ID', { ...opts, year: 'numeric' }) : ''
  if (startLabel && endLabel) return `${startLabel}–${endLabel}`
  return startLabel || endLabel
}

const deriveModeLabel = (online?: boolean, tps?: boolean) => {
  if (online && tps) return 'Online + TPS'
  if (online) return 'Online'
  if (tps) return 'TPS'
  return 'Tidak aktif'
}

const mapTpsStatus = (snapshot?: MonitoringLiveResponse): TPSStatusSummary => {
  const detail =
    snapshot?.tps_stats?.map((item) => ({
      id: item.tps_id.toString(),
      name: item.tps_name,
      voters: item.total_votes,
      status: item.pending_checkins && item.pending_checkins > 0 ? 'issue' : 'active',
    })) ?? []
  if (!detail.length) return tpsStatusSummary
  const issue = detail.filter((item) => item.status === 'issue').length
  const active = detail.filter((item) => item.status === 'active').length

  return {
    total: detail.length,
    active,
    issue,
    closed: Math.max(0, detail.length - active - issue),
    detail: detail.length ? detail : tpsStatusSummary.detail,
  }
}

const mapCandidateVotes = (snapshot: MonitoringLiveResponse, candidates: CandidateAdmin[]): CandidateVoteStat[] => {
  const voteEntries = Object.entries(snapshot.candidate_votes ?? {})
  const totalVotesFromSnapshot = snapshot.total_votes || voteEntries.reduce((sum, [, value]) => sum + Number(value ?? 0), 0)

  if (!voteEntries.length) return candidateVoteStats

  return voteEntries
    .map(([id, value], index) => {
      const numericId = Number(id)
      const votes = Number(value ?? 0)
      const candidate = candidates.find((item) => Number(item.id) === numericId)
      return {
        id: Number.isNaN(numericId) ? index + 1 : numericId,
        name: candidate?.name ?? `Kandidat ${id}`,
        votes,
        percentage: totalVotesFromSnapshot ? Number(((votes / totalVotesFromSnapshot) * 100).toFixed(1)) : 0,
      }
    })
    .sort((a, b) => b.votes - a.votes)
}

const buildOverview = (election: AdminElectionResponse | null, totalCandidates: number, totalVoters: number): AdminOverview => {
  const stage = mapStatusToStage(election?.status)
  const period =
    stage === 'pendaftaran'
      ? formatPeriod(election?.registration_start_at, election?.registration_end_at)
      : stage === 'kampanye'
        ? formatPeriod(election?.campaign_start_at, election?.campaign_end_at)
        : stage === 'rekapitulasi'
          ? formatPeriod(election?.recap_start_at, election?.recap_end_at)
          : formatPeriod(election?.voting_start_at, election?.voting_end_at)

  return {
    stage,
    stageLabel: stageLabels[stage],
    votingPeriod: period,
    totalCandidates: totalCandidates || adminOverview.totalCandidates,
    totalVoters: totalVoters || adminOverview.totalVoters,
    activeMode: deriveModeLabel(election?.online_enabled, election?.tps_enabled),
  }
}

export const useAdminDashboardData = () => {
  const { token } = useAdminAuth()
  const [electionId, setElectionId] = useState<number>(ACTIVE_ELECTION_ID)
  const [overview, setOverview] = useState<AdminOverview>({
    ...adminOverview,
    totalCandidates: 0,
    totalVoters: 0,
    votingPeriod: 'Memuat...',
  })
  const [participation, setParticipation] = useState<ParticipationStats>({ totalVoters: 0, voted: 0, notVoted: 0 })
  const [tpsStatus, setTpsStatus] = useState<TPSStatusSummary>({ ...tpsStatusSummary, total: 0, active: 0, issue: 0, closed: 0, detail: [] })
  const [logs, setLogs] = useState(activityLogs.length ? [] : [])
  const [votes, setVotes] = useState<CandidateVoteStat[]>([])
  const [liveSystemInfo, setLiveSystemInfo] = useState<SystemInfo>({ serverStatus: 'normal', lastSync: '—', dataLocked: false })
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('bar')
  const [activeFilter, setActiveFilter] = useState<'all' | 'fakultas'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!token) return
    let mounted = true

    const loadDashboard = async () => {
      setLoading(true)
      setError(undefined)
      try {
        let targetElectionId = electionId || ACTIVE_ELECTION_ID
        let election: AdminElectionResponse | null = null

        try {
          election = await fetchAdminElection(token, targetElectionId)
        } catch (err: any) {
          if (err?.status === 404) {
            const current = await fetchCurrentElection()
            targetElectionId = current.id
            if (mounted) setElectionId(current.id)
            election = await fetchAdminElection(token, current.id)
          } else {
            throw err
          }
        }

        const [snapshot, candidateList] = await Promise.all([fetchMonitoringLive(token, targetElectionId), fetchAdminCandidates(token, targetElectionId)])
        if (!mounted) return

        const totalVoters = snapshot.participation?.total_eligible ?? participationStats.totalVoters
        const voted = snapshot.participation?.total_voted ?? snapshot.total_votes ?? 0
        const mappedVotes = mapCandidateVotes(snapshot, candidateList)

        setParticipation({
          totalVoters,
          voted,
          notVoted: Math.max(0, totalVoters - voted),
        })
        setVotes(mappedVotes)
        setTpsStatus(mapTpsStatus(snapshot))
        setOverview(buildOverview(election, mappedVotes.length || candidateList.length, totalVoters))
        setLiveSystemInfo({
          serverStatus: 'normal',
          lastSync: new Date(snapshot.timestamp ?? Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          dataLocked: false,
        })
        setLogs([
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            message: 'Data dashboard diperbarui',
            highlight: true,
          },
        ])
      } catch (err) {
        if (!mounted) return
        const apiErr = err as ApiError
        console.error('Failed to load admin dashboard data', err)
        setError(apiErr?.message ?? 'Gagal memuat data dashboard dari server')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadDashboard()
    const interval = window.setInterval(loadDashboard, 20000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [electionId, token])

  useEffect(() => {
    if (token) return
    setOverview(adminOverview)
    setParticipation(participationStats)
    setTpsStatus(tpsStatusSummary)
    setVotes(candidateVoteStats)
    setLogs(activityLogs)
    setError(undefined)
  }, [token])

  const participationPercentage = useMemo(() => {
    const { voted, totalVoters } = participation
    if (!totalVoters) return 0
    return Number(((voted / totalVoters) * 100).toFixed(1))
  }, [participation])

  const facultyStats = useMemo<FacultyParticipationStat[]>(() => {
    // Belum ada endpoint partisipasi per fakultas; hindari tampilan data mock saat token ada.
    if (token) return []
    return facultyParticipationStats
  }, [activeFilter, token])

  return {
    overview,
    participation,
    participationPercentage,
    tpsStatus,
    logs,
    votes,
    voteViewMode: viewMode,
    setVoteViewMode: setViewMode,
    facultyStats,
    setActiveFilter,
    actions: quickActions,
    systemInfo: liveSystemInfo,
    loading,
    error,
  }
}
