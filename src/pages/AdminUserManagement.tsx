import React, { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useToast } from '../components/Toast'
import { usePopup } from '../components/Popup'
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  roleLabels,
  adminRoleLabels,
  getRoleColor,
  type AdminUser,
  type UserRole,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '../services/adminUsers'
import '../styles/AdminDPT.css'

const AdminUserManagement = (): JSX.Element => {
  const { token } = useAdminAuth()
  const { showToast } = useToast()
  const { showPopup } = usePopup()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  // Form data
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    full_name: '',
    role: 'ADMIN',
    password: '',
    is_active: true,
  })

  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({})

  const fetchUsers = async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (activeFilter !== 'all') params.append('active', activeFilter)
      params.append('page', '1')
      params.append('limit', '1000')

      const response = await listAdminUsers(token, params)
      
      // Filter hanya role admin di frontend
      const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TPS_OPERATOR', 'KETUA_TPS', 'OPERATOR_PANEL', 'PANITIA', 'VIEWER']
      const filteredUsers = (response.items || []).filter(user => adminRoles.includes(user.role))
      
      // Pagination manual
      const startIdx = (page - 1) * limit
      const endIdx = startIdx + limit
      setUsers(filteredUsers.slice(startIdx, endIdx))
      setTotal(filteredUsers.length)
    } catch (err) {
      console.error('Failed to fetch users', err)
      setError((err as any)?.message || 'Gagal memuat data pengguna')
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      void fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, search, roleFilter, activeFilter])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    // Validation
    if (!formData.username || !formData.email || !formData.full_name || !formData.password) {
      showToast('Semua field wajib diisi', 'error')
      return
    }

    if (formData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error')
      return
    }

    try {
      await createAdminUser(token, formData)
      showToast('Pengguna berhasil ditambahkan', 'success')
      setShowCreateModal(false)
      setFormData({
        username: '',
        email: '',
        full_name: '',
        role: 'ADMIN',
        password: '',
        is_active: true,
      })
      await fetchUsers()
    } catch (err) {
      console.error('Failed to create user', err)
      const errorMsg = (err as any)?.message || 'Gagal menambahkan pengguna'
      showToast(errorMsg, 'error')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !editingUser) return

    try {
      await updateAdminUser(token, editingUser.id, editFormData)
      showToast('Pengguna berhasil diperbarui', 'success')
      setShowEditModal(false)
      setEditingUser(null)
      setEditFormData({})
      await fetchUsers()
    } catch (err) {
      console.error('Failed to update user', err)
      showToast((err as any)?.message || 'Gagal memperbarui pengguna', 'error')
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!token) return

    const confirmed = await showPopup({
      title: 'Konfirmasi Hapus',
      message: `Hapus pengguna "${user.full_name}" (${user.username})?\n\nPeringatan: Aksi ini tidak dapat dibatalkan!`,
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    })

    if (!confirmed) return

    try {
      await deleteAdminUser(token, user.id)
      showToast('Pengguna berhasil dihapus', 'success')
      await fetchUsers()
    } catch (err) {
      console.error('Failed to delete user', err)
      showToast((err as any)?.message || 'Gagal menghapus pengguna', 'error')
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    if (!token) return

    try {
      if (user.is_active) {
        await deactivateUser(token, user.id)
        showToast(`${user.full_name} dinonaktifkan`, 'success')
      } else {
        await activateUser(token, user.id)
        showToast(`${user.full_name} diaktifkan`, 'success')
      }
      await fetchUsers()
    } catch (err) {
      console.error('Failed to toggle user active status', err)
      showToast((err as any)?.message || 'Gagal mengubah status', 'error')
    }
  }

  const handleResetPassword = async (user: AdminUser) => {
    if (!token) return

    const newPassword = prompt(`Reset password untuk ${user.full_name}.\n\nMasukkan password baru (min 6 karakter):`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      showToast('Password minimal 6 karakter', 'error')
      return
    }

    try {
      await resetUserPassword(token, user.id, { new_password: newPassword })
      showToast('Password berhasil direset', 'success')
    } catch (err) {
      console.error('Failed to reset password', err)
      showToast((err as any)?.message || 'Gagal reset password', 'error')
    }
  }

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user)
    setEditFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      tps_id: user.tps_id,
      voter_id: user.voter_id,
      lecturer_id: user.lecturer_id,
      staff_id: user.staff_id,
      is_active: user.is_active,
    })
    setShowEditModal(true)
  }

  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <AdminLayout title="Manajemen Pengguna">
      <div className="admin-dpt-page">
        <div className="page-header">
          <div>
            <h1>Manajemen Pengguna Admin</h1>
            <p>Kelola akun admin, operator TPS, dan pengguna sistem lainnya</p>
          </div>
          <button className="btn-primary" type="button" onClick={() => setShowCreateModal(true)}>
            + Tambah Pengguna
          </button>
        </div>

        {error && (
          <div className="alert" style={{ backgroundColor: '#fee', border: '1px solid #fcc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="filters">
          <input type="search" placeholder="Cari username/email/nama..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}>
            <option value="all">Semua Role</option>
            {Object.entries(adminRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}>
            <option value="all">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Login Terakhir</th>
                <th>Total Login</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Memuat data...
                  </td>
                </tr>
              )}
              {!loading && (!users || users.length === 0) && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              )}
              {!loading &&
                users &&
                users.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="status-chip" style={{ backgroundColor: getRoleColor(user.role) + '20', color: getRoleColor(user.role), border: `1px solid ${getRoleColor(user.role)}` }}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td>
                      {user.is_active ? (
                        <span className="status-chip status-verified">Aktif</span>
                      ) : (
                        <span className="status-chip status-blocked">Nonaktif</span>
                      )}
                    </td>
                    <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Belum pernah login</span>}</td>
                    <td>{user.login_count}</td>
                    <td>
                      <button className="btn-table" type="button" onClick={() => openEditModal(user)} style={{ marginRight: '4px' }}>
                        Edit
                      </button>
                      <button
                        className="btn-table"
                        type="button"
                        onClick={() => void handleToggleActive(user)}
                        style={{ marginRight: '4px', backgroundColor: user.is_active ? '#f59e0b' : '#10b981', color: 'white' }}
                      >
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button className="btn-table" type="button" onClick={() => void handleResetPassword(user)} style={{ marginRight: '4px' }}>
                        Reset PW
                      </button>
                      <button className="btn-table danger" type="button" onClick={() => void handleDeleteUser(user)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div>
            Menampilkan {users && users.length ? `${(page - 1) * limit + 1}–${(page - 1) * limit + users.length}` : '0'} dari {total.toLocaleString('id-ID')} pengguna
          </div>
          <div className="pagination-controls">
            <button className="btn-outline" type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
              ◀ Sebelumnya
            </button>
            <span>
              Halaman {page} dari {pageCount}
            </span>
            <button className="btn-outline" type="button" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page >= pageCount || loading}>
              Berikutnya ▶
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <h2>Tambah Pengguna Baru</h2>
              <form onSubmit={handleCreateUser}>
                <div className="form-field">
                  <label>Username *</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Nama Lengkap *</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Password * (min 6 karakter)</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                </div>
                <div className="form-field">
                  <label>Role *</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}>
                    {Object.entries(adminRoleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>
                    <input type="checkbox" checked={formData.is_active ?? true} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    Aktif
                  </label>
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn-primary" type="submit">
                    Simpan
                  </button>
                  <button className="btn-outline" type="button" onClick={() => setShowCreateModal(false)}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <h2>Edit Pengguna: {editingUser.username}</h2>
              <form onSubmit={handleEditUser}>
                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Nama Lengkap *</label>
                  <input type="text" value={editFormData.full_name || ''} onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Role *</label>
                  <select value={editFormData.role || 'ADMIN'} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}>
                    {Object.entries(adminRoleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>TPS ID (opsional)</label>
                  <input
                    type="number"
                    value={editFormData.tps_id ?? ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tps_id: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="form-field">
                  <label>
                    <input type="checkbox" checked={editFormData.is_active ?? true} onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })} />
                    Aktif
                  </label>
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn-primary" type="submit">
                    Simpan
                  </button>
                  <button className="btn-outline" type="button" onClick={() => setShowEditModal(false)}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .form-field {
          margin-bottom: 1rem;
        }
        .form-field label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .form-field input,
        .form-field select {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
      `}</style>
    </AdminLayout>
  )
}

export default AdminUserManagement
