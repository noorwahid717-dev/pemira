export type CandidateStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'APPROVED'
  | 'HIDDEN'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ARCHIVED'

export type CandidateMediaSlot = 'poster' | 'photo_extra' | 'pdf_program' | 'pdf_visimisi'

export type CandidateMedia = {
  id: string
  slot: CandidateMediaSlot
  type: 'photo' | 'pdf'
  url: string
  label: string
  contentType?: string
}

export type CandidateProgramAdmin = {
  id: string
  title: string
  description: string
  category?: string
}

export type CandidateAdmin = {
  id: string
  number: number
  name: string
  faculty: string
  programStudi: string
  angkatan: string
  status: CandidateStatus
  photoUrl: string
  photoMediaId?: string | null
  tagline?: string
  shortBio?: string
  longBio?: string
  visionTitle: string
  visionDescription: string
  missions: string[]
  programs: CandidateProgramAdmin[]
  media: CandidateMedia[]
  campaignVideo?: string
}
