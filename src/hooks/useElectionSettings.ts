import { useCallback, useMemo, useState } from 'react'
import { electionStatusOptions, initialElectionStatus, initialRules, initialTimeline, initialVotingMode } from '../data/electionSettings'
import type { ElectionRules, ElectionStatus, TimelineStage, VotingMode } from '../types/electionSettings'

const formatTimestamp = (value: string) => new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

export const useElectionSettings = () => {
  const [status, setStatus] = useState<ElectionStatus>(initialElectionStatus)
  const [mode, setMode] = useState<VotingMode>(initialVotingMode)
  const [timeline, setTimeline] = useState<TimelineStage[]>(initialTimeline)
  const [rules, setRules] = useState<ElectionRules>(initialRules)
  const [security, setSecurity] = useState({ lockVoting: false })
  const [saving, setSaving] = useState<{ section: string | null }>({ section: null })
  const [lastUpdated, setLastUpdated] = useState('12 Juni 10:32 oleh Admin Dwi')

  const isModeChangeDisabled = status === 'voting_dibuka' || status === 'voting_ditutup'

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

  const saveSection = useCallback(async (section: string, callback: () => void) => {
    setSaving({ section })
    await new Promise((resolve) => setTimeout(resolve, 600))
    callback()
    setSaving({ section: null })
    setLastUpdated(`${formatTimestamp(new Date().toISOString())} oleh Admin Dwi`)
  }, [])

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
    saveSection,
    lastUpdated,
    isModeChangeDisabled,
  }
}
