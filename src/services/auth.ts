import { apiRequest } from '../utils/apiClient'

export type AuthUserProfile = {
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  semester?: string
  department_name?: string
  unit_name?: string
  position?: string
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
export type ResetPasswordResponse = { message: string }

// Registration Response Types (API v2.0)
export type StudentRegistrationResponse = {
  message: string
  user: {
    id: number
    username: string
    role: 'STUDENT'
    voter_id: number
    profile: {
      name: string
      faculty_name?: string
      study_program_name?: string
      semester?: string
    }
  }
  voting_mode: 'ONLINE' | 'TPS'
}

export type LecturerRegistrationResponse = {
  message: string
  user: {
    id: number
    username: string
    role: 'LECTURER'
    voter_id: number
    lecturer_id: number
    profile: {
      name: string
      faculty_name?: string
      department_name?: string
      position?: string
    }
  }
  voting_mode: 'ONLINE' | 'TPS'
}

export type StaffRegistrationResponse = {
  message: string
  user: {
    id: number
    username: string
    role: 'STAFF'
    voter_id: number
    staff_id: number
    profile: {
      name: string
      unit_name?: string
      position?: string
    }
  }
  voting_mode: 'ONLINE' | 'TPS'
}

export type RegistrationResponse =
  | StudentRegistrationResponse
  | LecturerRegistrationResponse
  | StaffRegistrationResponse

// Legacy type for backward compatibility
export type RegisterResponse = { user: AuthUser; message: string; voting_mode?: 'ONLINE' | 'TPS' }

// Check Availability Response
export type CheckAvailabilityResponse = {
  available: boolean
  name?: string
  type?: 'STUDENT' | 'LECTURER' | 'STAFF'
  reason?: string
  message: string
}

export const loginUser = (username: string, password: string) =>
  apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } })

export const resetPassword = (identifier: string, newPassword: string) =>
  apiRequest<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: { identifier, new_password: newPassword },
  })

// API v2.0 Registration Functions
export const registerStudent = (payload: {
  nim: string
  name: string
  email?: string
  faculty_name: string
  study_program_name: string
  semester: string
  password: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<StudentRegistrationResponse>(
    '/auth/register/student',
    {
      method: 'POST',
      body: {
        ...payload,
        email: payload.email || '',
        voting_mode: payload.voting_mode || 'ONLINE',
      },
    }
  )

export const registerLecturerOrStaffV2 = (payload: {
  type: 'LECTURER' | 'STAFF'
  nidn?: string
  nip?: string
  name: string
  email?: string
  faculty_name?: string
  department_name?: string
  unit_name?: string
  position: string
  password: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<LecturerRegistrationResponse | StaffRegistrationResponse>(
    '/auth/register/lecturer-staff',
    {
      method: 'POST',
      body: {
        ...payload,
        email: payload.email || '',
        voting_mode: payload.voting_mode || 'ONLINE',
      },
    }
  )

export const checkIdentityAvailability = (
  type: 'student' | 'lecturer' | 'staff',
  identifier: string
) =>
  apiRequest<{ data: CheckAvailabilityResponse } | CheckAvailabilityResponse>(
    `/voters/register/check/${type}/${identifier}`,
    { method: 'GET' }
  ).then(res => (res as any).data || res as CheckAvailabilityResponse)

// Legacy function for backward compatibility
export const registerLecturerOrStaff = (payload: {
  username: string
  name: string
  email?: string
  password: string
  type: 'LECTURER' | 'STAFF'
  faculty_name?: string
  department_name?: string
  unit_name?: string
  position?: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<RegisterResponse | LecturerRegistrationResponse | StaffRegistrationResponse>('/auth/register/lecturer-staff', {
    method: 'POST',
    body: {
      type: payload.type,
      nidn: payload.type === 'LECTURER' ? payload.username : undefined,
      nip: payload.type === 'STAFF' ? payload.username : undefined,
      name: payload.name,
      email: payload.email || '',
      faculty_name: payload.faculty_name,
      department_name: payload.department_name,
      unit_name: payload.unit_name,
      position: payload.position || '',
      password: payload.password,
      voting_mode: payload.voting_mode,
    },
  })

export const refreshToken = (refreshTokenValue: string) => {
  return apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshTokenValue } })
}

export const fetchAuthMe = (token: string, options?: { signal?: AbortSignal }) => {
  return apiRequest<AuthUser>('/auth/me', { token, signal: options?.signal })
}
