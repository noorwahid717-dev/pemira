import { apiRequest } from '../utils/apiClient'

// ========== Types ==========

export type UserRole =
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'TPS_OPERATOR'
  | 'STUDENT'
  | 'LECTURER'
  | 'STAFF'
  | 'PANITIA'
  | 'KETUA_TPS'
  | 'OPERATOR_PANEL'
  | 'VIEWER'

export type AdminUser = {
  id: number
  username: string
  email: string
  full_name: string
  role: UserRole
  voter_id?: number | null
  tps_id?: number | null
  lecturer_id?: string | null
  staff_id?: string | null
  is_active: boolean
  last_login_at?: string | null
  login_count: number
  created_at: string
  updated_at: string
}

export type AdminUsersListResponse = {
  items: AdminUser[]
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export type CreateUserRequest = {
  username: string
  email: string
  full_name: string
  role: UserRole
  password: string
  tps_id?: number | null
  voter_id?: number | null
  lecturer_id?: string | null
  staff_id?: string | null
  is_active?: boolean
}

export type UpdateUserRequest = {
  email?: string
  full_name?: string
  role?: UserRole
  tps_id?: number | null
  voter_id?: number | null
  lecturer_id?: string | null
  staff_id?: string | null
  is_active?: boolean
}

export type ResetPasswordRequest = {
  new_password: string
}

// ========== API Functions ==========

/**
 * List all users with filters
 * GET /admin/users
 */
export const listAdminUsers = async (
  token: string,
  params: URLSearchParams
): Promise<AdminUsersListResponse> => {
  const response = await apiRequest<{ data: AdminUsersListResponse }>(`/admin/users?${params.toString()}`, { token })
  return response.data
}

/**
 * Create new user
 * POST /admin/users
 */
export const createAdminUser = async (
  token: string,
  data: CreateUserRequest
): Promise<AdminUser> => {
  const response = await apiRequest<{ data: AdminUser }>('/admin/users', {
    method: 'POST',
    token,
    body: data,
  })
  return response.data
}

/**
 * Get user detail
 * GET /admin/users/{userID}
 */
export const getAdminUser = async (token: string, userId: number): Promise<AdminUser> => {
  const response = await apiRequest<{ data: AdminUser }>(`/admin/users/${userId}`, { token })
  return response.data
}

/**
 * Update user (partial)
 * PATCH /admin/users/{userID}
 */
export const updateAdminUser = async (
  token: string,
  userId: number,
  data: UpdateUserRequest
): Promise<AdminUser> => {
  const response = await apiRequest<{ data: AdminUser }>(`/admin/users/${userId}`, {
    method: 'PATCH',
    token,
    body: data,
  })
  return response.data
}

/**
 * Reset user password
 * POST /admin/users/{userID}/reset-password
 */
export const resetUserPassword = async (
  token: string,
  userId: number,
  data: ResetPasswordRequest
): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
    token,
    body: data,
  })
}

/**
 * Activate user
 * POST /admin/users/{userID}/activate
 */
export const activateUser = async (token: string, userId: number): Promise<AdminUser> => {
  const response = await apiRequest<{ data: AdminUser }>(`/admin/users/${userId}/activate`, {
    method: 'POST',
    token,
  })
  return response.data
}

/**
 * Deactivate user
 * POST /admin/users/{userID}/deactivate
 */
export const deactivateUser = async (token: string, userId: number): Promise<AdminUser> => {
  const response = await apiRequest<{ data: AdminUser }>(`/admin/users/${userId}/deactivate`, {
    method: 'POST',
    token,
  })
  return response.data
}

/**
 * Delete user
 * DELETE /admin/users/{userID}
 */
export const deleteAdminUser = async (token: string, userId: number): Promise<void> => {
  return apiRequest<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  })
}

// ========== Helper Functions ==========

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  TPS_OPERATOR: 'Operator TPS',
  STUDENT: 'Mahasiswa',
  LECTURER: 'Dosen',
  STAFF: 'Staf',
  PANITIA: 'Panitia',
  KETUA_TPS: 'Ketua TPS',
  OPERATOR_PANEL: 'Operator Panel',
  VIEWER: 'Viewer',
}

export const adminRoleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  TPS_OPERATOR: 'Operator TPS',
  KETUA_TPS: 'Ketua TPS',
  OPERATOR_PANEL: 'Operator Panel',
  PANITIA: 'Panitia',
  VIEWER: 'Viewer',
}

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '#dc2626'
    case 'ADMIN':
      return '#2563eb'
    case 'TPS_OPERATOR':
    case 'KETUA_TPS':
    case 'OPERATOR_PANEL':
      return '#7c3aed'
    case 'PANITIA':
      return '#059669'
    case 'VIEWER':
      return '#6b7280'
    default:
      return '#f59e0b'
  }
}
