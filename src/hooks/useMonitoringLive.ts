import { useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from './useAdminAuth'
import { fetchAdminCandidates } from '../services/adminCandidates'
import { fetchMonitoringLive, type MonitoringLiveResponse } from '../services/adminMonitoring'
import {
  candidateLiveStats,
  facultyParticipationLive,
  liveLogEntries,
  monitoringSummary,
  tpsLiveStatus,
} from '../data/monitoring'
import type { CandidateLiveStat, FacultyParticipation, LiveLogEntry, LiveSummary, TPSLiveStatus } from '../types/monitoring'

const colors = ['#5b61ff', '#22ccee', '#ec4899', '#fbbf24', '#22c55e', '#a855f7']

const mapSnapshotToState = (snapshot: MonitoringLiveResponse, candidatesRef: CandidateLiveStat[]): { summary: LiveSummary; candidates: CandidateLiveStat[]; tps: TPSLiveStatus[] } => {
  const totalVotes = snapshot.total_votes
  const totalVoters = snapshot.participation.total_eligible || monitoringSummary.totalVoters
  const mappedCandidates =
    candidatesRef.length > 0
      ? candidatesRef.map((candidate, idx) => {
          const votes = snapshot.candidate_votes[candidate.id.toString()] ?? 0
          return {
            ...candidate,
            votes,
            percentage: totalVotes ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
            color: candidate.color ?? colors[idx % colors.length],
          }
        })
      : Object.entries(snapshot.candidate_votes).map(([id, votes], idx) => ({
          id: Number(id),
          name: `Kandidat ${id}`,
          votes,
          percentage: totalVotes ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
          color: colors[idx % colors.length],
        }))

  const mappedTPS: TPSLiveStatus[] = snapshot.tps_stats.map((item) => ({
    id: item.tps_id.toString(),
    name: item.tps_name,
    location: '-',
    votes: item.total_votes,
    status: 'active',
    note: item.pending_checkins ? `${item.pending_checkins} menunggu verifikasi` : undefined,
  }))

  const summary: LiveSummary = {
    totalVoters,
    votesIn: totalVotes,
    onlineVotes: 0,
    tpsVotes: 0,
    tpsActive: mappedTPS.length,
    tpsTotal: mappedTPS.length,
    lastUpdated: new Date(snapshot.timestamp).toLocaleTimeString('id-ID', { hour12: false }),
    statusLabel: totalVotes > 0 ? 'Voting Berlangsung' : 'Menunggu Voting',
    statusType: 'running',
  }

  return { summary, candidates: mappedCandidates, tps: mappedTPS }
}

export const useMonitoringLive = () => {
  const { token } = useAdminAuth()
  const [summary, setSummary] = useState<LiveSummary>(monitoringSummary)
  const [candidates, setCandidates] = useState<CandidateLiveStat[]>(candidateLiveStats)
  const [faculty] = useState<FacultyParticipation[]>(facultyParticipationLive)
  const [tps, setTps] = useState<TPSLiveStatus[]>(tpsLiveStatus)
  const [logs, setLogs] = useState<LiveLogEntry[]>(liveLogEntries)
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar')
  const [publicLiveEnabled, setPublicLiveEnabled] = useState(true)
  const [filters, setFilters] = useState({ faculty: 'all', tps: 'all' })
  const [loading, setLoading] = useState(false)

  const loadSnapshot = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [snapshot, adminCandidates] = await Promise.all([
        fetchMonitoringLive(token),
        fetchAdminCandidates(token).catch(() => []),
      ])
      const baselineCandidates =
        adminCandidates.length > 0
          ? adminCandidates.map((item, idx) => ({
              id: Number(item.id),
              name: item.name,
              votes: 0,
              percentage: 0,
              color: colors[idx % colors.length],
            }))
          : candidates
      const mapped = mapSnapshotToState(snapshot, baselineCandidates)
      setSummary(mapped.summary)
      setCandidates(mapped.candidates)
      setTps(mapped.tps)
      setLogs((prev) => [
        { id: `log-${Date.now()}`, timestamp: mapped.summary.lastUpdated, message: 'Snapshot diperbarui' },
        ...prev,
      ])
    } catch (err) {
      console.error('Failed to load monitoring snapshot', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    void loadSnapshot()
    const interval = window.setInterval(loadSnapshot, 20000)
    return () => window.clearInterval(interval)
  }, [token])

  const participationPercent = useMemo(() => Number(((summary.votesIn / summary.totalVoters) * 100).toFixed(1)), [summary])

  const refreshNow = () => {
    if (token) {
      void loadSnapshot()
      return
    }
    setSummary((prev) => ({ ...prev, lastUpdated: new Date().toLocaleTimeString('id-ID', { hour12: false }) }))
    setLogs((prev) => [
      { id: `log-${Date.now()}`, timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }), message: 'Refresh manual (mock)' },
      ...prev,
    ])
  }

  const exportSnapshot = () => {
    alert(`Export data per ${summary.lastUpdated}`) // TODO: integrate real export endpoint
  }

  return {
    summary,
    candidates,
    faculty,
    tps,
    logs,
    chartMode,
    setChartMode,
    filters,
    setFilters,
    participationPercent,
    publicLiveEnabled,
    setPublicLiveEnabled,
    refreshNow,
    exportSnapshot,
    loading,
  }
}
