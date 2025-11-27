import { apiRequest } from '../utils/apiClient'

export type FacultyProgram = {
  faculty: string
  programs: string[]
}

export type Faculty = {
  id: number
  code: string
  name: string
  created_at: string
  updated_at: string
}

export type StudyProgram = {
  id: number
  faculty_id: number
  code: string
  name: string
  level: string
  created_at: string
  updated_at: string
}

export type LecturerUnit = {
  id: number
  code: string
  name: string
  created_at: string
  updated_at: string
}

export type LecturerPosition = {
  id: number
  category: 'FUNGSIONAL' | 'STRUKTURAL'
  code: string
  name: string
  created_at: string
  updated_at: string
}

export type StaffUnit = {
  id: number
  code: string
  name: string
  created_at: string
  updated_at: string
}

export type StaffPosition = {
  id: number
  code: string
  name: string
  created_at: string
  updated_at: string
}

export const fetchFacultiesPrograms = () => {
  return apiRequest<{ faculties: FacultyProgram[] }>('/meta/faculties-programs')
}

// Master data endpoints for API v2.0
export const fetchFaculties = () => {
  return apiRequest<{ data: Faculty[] }>('/master/faculties')
}

export const fetchStudyPrograms = (facultyId?: number) => {
  const params = facultyId ? `?faculty_id=${facultyId}` : ''
  return apiRequest<{ data: StudyProgram[] }>(`/master/study-programs${params}`)
}

export const fetchLecturerUnits = () => {
  return apiRequest<{ data: LecturerUnit[] }>('/master/lecturer-units')
}

export const fetchLecturerPositions = (category?: 'FUNGSIONAL' | 'STRUKTURAL') => {
  const params = category ? `?category=${category}` : ''
  return apiRequest<{ data: LecturerPosition[] }>(`/master/lecturer-positions${params}`)
}

export const fetchStaffUnits = () => {
  return apiRequest<{ data: StaffUnit[] }>('/master/staff-units')
}

export const fetchStaffPositions = () => {
  return apiRequest<{ data: StaffPosition[] }>('/master/staff-positions')
}
