import { useEffect, useMemo, useRef, useState } from 'react'
import { useAdminAuth } from './useAdminAuth'
import { fetchAdminCandidates } from '../services/adminCandidates'
import { fetchMonitoringLive, type MonitoringLiveResponse } from '../services/adminMonitoring'
import type { CandidateLiveStat, FacultyParticipation, LiveLogEntry, LiveSummary, TPSLiveStatus } from '../types/monitoring'

const colors = ['#5b61ff', '#22ccee', '#ec4899', '#fbbf24', '#22c55e', '#a855f7']

const mapSnapshotToState = (snapshot: MonitoringLiveResponse, candidatesRef: CandidateLiveStat[]): { summary: LiveSummary; candidates: CandidateLiveStat[]; tps: TPSLiveStatus[] } => {
  const totalVotes = snapshot.total_votes
  const totalVoters = snapshot.participation.total_eligible || 0
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
    tpsVotes: totalVotes,
    tpsActive: mappedTPS.length,
    tpsTotal: mappedTPS.length,
    lastUpdated: new Date(snapshot.timestamp).toLocaleTimeString('id-ID', { hour12: false }),
    statusLabel: totalVotes > 0 ? 'Voting Berlangsung' : 'Menunggu Voting',
    statusType: totalVotes > 0 ? 'running' : 'idle',
  }

  return { summary, candidates: mappedCandidates, tps: mappedTPS }
}

export const useMonitoringLive = () => {
  const { token } = useAdminAuth()
  const [summary, setSummary] = useState<LiveSummary>({
    totalVoters: 0,
    votesIn: 0,
    onlineVotes: 0,
    tpsVotes: 0,
    tpsActive: 0,
    tpsTotal: 0,
    lastUpdated: '-',
    statusLabel: 'Menunggu data',
    statusType: 'idle',
  })
  const [candidates, setCandidates] = useState<CandidateLiveStat[]>([])
  const [faculty, setFaculty] = useState<FacultyParticipation[]>([])
  const [tps, setTps] = useState<TPSLiveStatus[]>([])
  const [logs, setLogs] = useState<LiveLogEntry[]>([])
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar')
  const [publicLiveEnabled, setPublicLiveEnabled] = useState(true)
  const [filters, setFilters] = useState({ faculty: 'all', tps: 'all' })
  const [loading, setLoading] = useState(false)
  const baselineCandidatesRef = useRef<CandidateLiveStat[] | null>(null)
  const logCounterRef = useRef(0)

  const nextLogId = () => {
    const id = `log-${Date.now()}-${logCounterRef.current}`
    logCounterRef.current += 1
    return id
  }

  const loadSnapshot = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [snapshot, adminCandidates] = await Promise.all([
        fetchMonitoringLive(token),
        (async () => {
          if (baselineCandidatesRef.current) return baselineCandidatesRef.current
          try {
            const fetched = await fetchAdminCandidates(token)
            const normalized = fetched.map((item, idx) => ({
              id: Number(item.id),
              name: item.name,
              votes: 0,
              percentage: 0,
              color: colors[idx % colors.length],
            }))
            baselineCandidatesRef.current = normalized
            return normalized
          } catch {
            return baselineCandidatesRef.current ?? []
          }
        })(),
      ])
      const baselineCandidates = (adminCandidates.length ? adminCandidates : baselineCandidatesRef.current) ?? candidates
      if (!baselineCandidatesRef.current && adminCandidates.length) {
        baselineCandidatesRef.current = adminCandidates
      }
      const mapped = mapSnapshotToState(snapshot, baselineCandidates.length ? baselineCandidates : candidates)
      setSummary(mapped.summary)
      setCandidates(mapped.candidates)
      setTps(mapped.tps)
      setFaculty([])
      setLogs((prev) => [
        { id: nextLogId(), timestamp: mapped.summary.lastUpdated, message: 'Snapshot diperbarui' },
        ...prev,
      ].slice(0, 200))
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
      { id: nextLogId(), timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }), message: 'Refresh manual (mock)' },
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
