import { useEffect, useMemo, useState } from 'react'
import {
  activityLogs,
  adminOverview,
  candidateVoteStats,
  facultyParticipationStats,
  participationStats,
  quickActions,
  systemInfo,
  tpsStatusSummary,
} from '../data/adminDashboard'
import type { AdminOverview, CandidateVoteStat, FacultyParticipationStat, ParticipationStats, TPSStatusSummary } from '../types/admin'
import type { CandidateAdmin } from '../types/candidateAdmin'
import { useAdminAuth } from './useAdminAuth'
import { fetchMonitoringLive, type MonitoringLiveResponse } from '../services/adminMonitoring'
import { fetchAdminCandidates } from '../services/adminCandidates'
import { fetchAdminElection, type AdminElectionResponse } from '../services/adminElection'

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

const formatVotingPeriod = (start?: string | null, end?: string | null) => {
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
  return {
    stage,
    stageLabel: stageLabels[stage],
    votingPeriod: formatVotingPeriod(election?.voting_start_at, election?.voting_end_at),
    totalCandidates: totalCandidates || adminOverview.totalCandidates,
    totalVoters: totalVoters || adminOverview.totalVoters,
    activeMode: deriveModeLabel(election?.online_enabled, election?.tps_enabled),
  }
}

export const useAdminDashboardData = () => {
  const { token } = useAdminAuth()
  const [overview, setOverview] = useState<AdminOverview>(adminOverview)
  const [participation, setParticipation] = useState<ParticipationStats>(participationStats)
  const [tpsStatus, setTpsStatus] = useState<TPSStatusSummary>(tpsStatusSummary)
  const [logs, setLogs] = useState(activityLogs)
  const [votes, setVotes] = useState(candidateVoteStats)
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
        const [snapshot, candidateList, election] = await Promise.all([
          fetchMonitoringLive(token).catch(() => ({
            participation: { total_eligible: 0, total_voted: 0 },
            total_votes: 0,
            candidates: [],
            tps_stations: [],
          })),
          fetchAdminCandidates(token).catch(() => []),
          fetchAdminElection(token).catch(() => null),
        ])
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
        setLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            message: 'Data dashboard diperbarui',
            highlight: true,
          },
          ...prev.slice(0, 5),
        ])
      } catch (err) {
        if (!mounted) return
        console.error('Failed to load admin dashboard data', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat data dashboard')
        setParticipation(participationStats)
        setVotes(candidateVoteStats)
        setTpsStatus(tpsStatusSummary)
        setOverview(adminOverview)
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
  }, [token])

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
    if (activeFilter === 'all') return facultyParticipationStats
    return facultyParticipationStats
  }, [activeFilter])

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
    systemInfo,
    loading,
    error,
  }
}
