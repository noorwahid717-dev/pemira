import { useEffect, useMemo, useState } from 'react'
import {
  candidateLiveStats,
  facultyParticipationLive,
  liveLogEntries,
  monitoringSummary,
  tpsLiveStatus,
} from '../data/monitoring'
import type { CandidateLiveStat, FacultyParticipation, LiveLogEntry, LiveSummary, TPSLiveStatus } from '../types/monitoring'

const randomDelta = () => Math.floor(Math.random() * 3)

export const useMonitoringLive = () => {
  const [summary, setSummary] = useState<LiveSummary>(monitoringSummary)
  const [candidates, setCandidates] = useState<CandidateLiveStat[]>(candidateLiveStats)
  const [faculty, setFaculty] = useState<FacultyParticipation[]>(facultyParticipationLive)
  const [tps, setTPS] = useState<TPSLiveStatus[]>(tpsLiveStatus)
  const [logs, setLogs] = useState<LiveLogEntry[]>(liveLogEntries)
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar')
  const [publicLiveEnabled, setPublicLiveEnabled] = useState(true)
  const [filters, setFilters] = useState({ faculty: 'all', tps: 'all' })

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSummary((prev) => {
        const addVotes = randomDelta()
        const newVotes = Math.min(prev.votesIn + addVotes, prev.totalVoters)
        return {
          ...prev,
          votesIn: newVotes,
          onlineVotes: prev.onlineVotes + addVotes,
          lastUpdated: new Date().toLocaleTimeString('id-ID', { hour12: false }),
        }
      })
      setCandidates((prev) => prev.map((candidate) => ({ ...candidate, votes: candidate.votes + randomDelta() })))
    }, 8000)
    return () => window.clearInterval(interval)
  }, [])

  const participationPercent = useMemo(() => Number(((summary.votesIn / summary.totalVoters) * 100).toFixed(1)), [summary])

  const refreshNow = () => {
    setSummary((prev) => ({ ...prev, lastUpdated: new Date().toLocaleTimeString('id-ID', { hour12: false }) }))
    setLogs((prev) => [
      { id: `log-${Date.now()}`, timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }), message: 'Refresh manual dilakukan admin' },
      ...prev,
    ])
  }

  const exportSnapshot = () => {
    alert(`Export data per ${summary.lastUpdated} (simulasi)`) // Replace with real export
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
  }
}
