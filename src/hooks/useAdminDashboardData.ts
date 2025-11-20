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
import type { CandidateVoteStat, FacultyParticipationStat, ParticipationStats } from '../types/admin'

const randomDelta = () => Math.floor(Math.random() * 5)

export const useAdminDashboardData = () => {
  const [participation, setParticipation] = useState(participationStats)
  const [votes, setVotes] = useState(candidateVoteStats)
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('bar')
  const [activeFilter, setActiveFilter] = useState<'all' | 'fakultas'>('all')

  useEffect(() => {
    const interval = window.setInterval(() => {
      setParticipation((prev) => {
        const additional = randomDelta()
        const cap = Math.min(prev.voted + additional, prev.totalVoters)
        return {
          ...prev,
          voted: cap,
          notVoted: prev.totalVoters - cap,
        }
      })
      setVotes((prev) => {
        const index = Math.floor(Math.random() * prev.length)
        return prev.map((candidate, candidateIndex) =>
          candidateIndex === index
            ? { ...candidate, votes: candidate.votes + randomDelta() }
            : candidate,
        ) as CandidateVoteStat[]
      })
    }, 8000)

    return () => window.clearInterval(interval)
  }, [])

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
    overview: adminOverview,
    participation,
    participationPercentage,
    tpsStatus: tpsStatusSummary,
    logs: activityLogs,
    votes,
    voteViewMode: viewMode,
    setVoteViewMode: setViewMode,
    facultyStats,
    setActiveFilter,
    actions: quickActions,
    systemInfo,
  }
}
