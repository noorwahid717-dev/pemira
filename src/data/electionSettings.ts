import type { ElectionRules, ElectionStatus, TimelineStage, VotingMode } from '../types/electionSettings'

export const electionStatusOptions: { value: ElectionStatus; label: string }[] = [
  { value: 'pendaftaran', label: 'Pendaftaran Kandidat' },
  { value: 'pemeriksaan', label: 'Pemeriksaan Berkas' },
  { value: 'kampanye', label: 'Kampanye' },
  { value: 'masa_tenang', label: 'Masa Tenang' },
  { value: 'voting_dibuka', label: 'Voting Dibuka' },
  { value: 'voting_ditutup', label: 'Voting Ditutup' },
  { value: 'rekapitulasi', label: 'Rekapitulasi' },
  { value: 'selesai', label: 'Selesai' },
]

export const initialElectionStatus: ElectionStatus = 'kampanye'

export const initialVotingMode: VotingMode = 'hybrid'

export const initialTimeline: TimelineStage[] = [
  { id: 'pendaftaran', label: 'Pendaftaran', start: '2024-06-01T08:00', end: '2024-06-05T16:00' },
  { id: 'pemeriksaan', label: 'Verifikasi Berkas', start: '2024-06-06T08:00', end: '2024-06-07T18:00' },
  { id: 'kampanye', label: 'Kampanye', start: '2024-06-08T08:00', end: '2024-06-10T20:00' },
  { id: 'masa_tenang', label: 'Masa Tenang', start: '2024-06-11T00:00', end: '2024-06-11T23:59' },
  { id: 'voting_dibuka', label: 'Voting', start: '2024-06-12T08:00', end: '2024-06-12T20:00' },
  { id: 'rekapitulasi', label: 'Rekapitulasi', start: '2024-06-13T08:00', end: '2024-06-15T17:00' },
]

export const initialRules: ElectionRules = {
  allowActiveStudents: true,
  allowLeaveStudents: true,
  allowAlumni: false,
  publicWeight: 1,
  specialWeight: 1,
  singleDeviceOnly: true,
  geolocationRequired: false,
  tpsMode: 'static',
  requirePanitiaVerification: true,
}
