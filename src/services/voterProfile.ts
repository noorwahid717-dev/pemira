import { apiRequest } from '../utils/apiClient'

export type VoterCompleteProfile = {
  personal_info: {
    voter_id: number
    voter_type: 'STUDENT' | 'LECTURER' | 'STAFF'
    name: string
    username: string
    email?: string
    phone?: string
    // For students
    faculty_name?: string
    study_program_name?: string
    cohort_year?: number
    semester?: string
    // For lecturers
    nidn?: string
    department?: string
    department_name?: string
    title?: string
    // For staff
    nip?: string
    unit?: string
    unit_name?: string
    position?: string
    photo_url?: string
  }
  voting_info: {
    preferred_method?: string
    has_voted: boolean
    voted_at?: string | null
    tps_name?: string
    tps_location?: string
  }
  participation: {
    total_elections: number
    participated_elections: number
    participation_rate: number
    last_participation?: string | null
  }
  account_info: {
    created_at: string
    last_login?: string
    login_count: number
    account_status: string
  }
}

export type UpdateProfileRequest = {
  email?: string
  phone?: string
  photo_url?: string
  faculty_code?: string
  study_program_code?: string
  cohort_year?: number
  class_label?: string
}

export type ChangePasswordRequest = {
  current_password: string
  new_password: string
  confirm_password: string
}

export type UpdateVotingMethodRequest = {
  election_id: number
  preferred_method: 'ONLINE' | 'TPS'
}

export type ParticipationStats = {
  summary: {
    total_elections: number
    participated: number
    not_participated: number
    participation_rate: number
  }
  elections: Array<{
    election_id: number
    election_name: string
    year: number
    voted: boolean
    voted_at?: string | null
    method: string
  }>
}

export const fetchCompleteProfile = async (
  token: string,
  options?: { signal?: AbortSignal }
): Promise<VoterCompleteProfile> => {
  const response = await apiRequest<any>('/voters/me/complete-profile', {
    method: 'GET',
    token,
    signal: options?.signal,
  })
  
  // Handle both direct response and wrapped response
  if (response.data) {
    return response.data as VoterCompleteProfile
  }
  
  return response as VoterCompleteProfile
}

export const updateProfile = async (
  token: string,
  data: UpdateProfileRequest,
  options?: { signal?: AbortSignal }
): Promise<{ success: boolean; message: string; updated_fields?: string[]; synced_to_identity?: boolean }> => {
  const response = await apiRequest<any>('/voters/me/profile', {
    method: 'PUT',
    token,
    body: data,
    signal: options?.signal,
  })
  
  // Handle wrapped response
  if (response.data) {
    return response.data
  }
  
  return response
}

export const changePassword = async (
  token: string,
  data: ChangePasswordRequest,
  options?: { signal?: AbortSignal }
): Promise<{ success: boolean; message: string }> => {
  return apiRequest('/voters/me/change-password', {
    method: 'POST',
    token,
    body: data,
    signal: options?.signal,
  })
}

export const updateVotingMethod = async (
  token: string,
  data: UpdateVotingMethodRequest,
  options?: { signal?: AbortSignal }
): Promise<{ success: boolean; message: string; new_method: string }> => {
  return apiRequest('/voters/me/voting-method', {
    method: 'PUT',
    token,
    body: data,
    signal: options?.signal,
  })
}

export const fetchParticipationStats = async (
  token: string,
  options?: { signal?: AbortSignal }
): Promise<ParticipationStats> => {
  const response = await apiRequest<any>('/voters/me/participation-stats', {
    method: 'GET',
    token,
    signal: options?.signal,
  })
  
  // Handle both direct response and wrapped response
  if (response.data) {
    return response.data as ParticipationStats
  }
  
  return response as ParticipationStats
}

export const deletePhoto = async (
  token: string,
  options?: { signal?: AbortSignal }
): Promise<{ success: boolean; message: string }> => {
  return apiRequest('/voters/me/photo', {
    method: 'DELETE',
    token,
    signal: options?.signal,
  })
}
