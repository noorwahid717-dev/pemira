import { apiRequest } from '../utils/apiClient'

export type AuthUserProfile = {
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  semester?: string
}

export type AuthUser = {
  id: number
  username: string
  role: string
  voter_id?: number
  profile?: AuthUserProfile
}

export type AuthTokens = {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export type AuthResponse = AuthTokens & { user: AuthUser }

export type RegisterResponse = { user: AuthUser; message: string; voting_mode?: 'ONLINE' | 'TPS' }

export const loginUser = (username: string, password: string) =>
  apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } })

export const registerStudent = (payload: {
  nim: string
  name: string
  email?: string
  password: string
  faculty_name?: string
  study_program_name?: string
  semester: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<RegisterResponse>('/auth/register/student', {
    method: 'POST',
    body: payload,
  })

export const registerLecturerOrStaff = (payload: {
  username: string
  name: string
  email?: string
  password: string
  type: 'LECTURER' | 'STAFF'
  faculty_name?: string
  department_name?: string
  unit_name?: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<RegisterResponse>('/auth/register/lecturer-staff', {
    method: 'POST',
    body: {
      type: payload.type,
      nidn: payload.type === 'LECTURER' ? payload.username : undefined,
      nip: payload.type === 'STAFF' ? payload.username : undefined,
      name: payload.name,
      email: payload.email,
      faculty_name: payload.faculty_name,
      department_name: payload.department_name,
      unit_name: payload.unit_name,
      password: payload.password,
      voting_mode: payload.voting_mode,
    },
  })

export const refreshToken = (refreshTokenValue: string) => {
  return apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshTokenValue } })
}
