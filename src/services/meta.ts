import { apiRequest } from '../utils/apiClient'

export type FacultyProgram = {
  faculty_name: string
  programs: string[]
}

export const fetchFacultiesPrograms = () => {
  return apiRequest<{ data: FacultyProgram[] }>('/meta/faculties-programs')
}
