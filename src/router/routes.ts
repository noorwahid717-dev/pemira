import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

type RouteComponent = ComponentType<any> | LazyExoticComponent<ComponentType<any>>

const lazyPage = <T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) => lazy(loader)

const LandingPage = lazyPage(() => import('../pages/LandingPage'))
const DashboardPemilihHiFi = lazyPage(() => import('../pages/DashboardPemilihHiFi'))
const DaftarKandidat = lazyPage(() => import('../pages/DaftarKandidat'))
const DemoAccounts = lazyPage(() => import('../pages/DemoAccounts'))
const DetailKandidat = lazyPage(() => import('../pages/DetailKandidat'))
const LoginMahasiswa = lazyPage(() => import('../pages/LoginMahasiswa'))
const ResetPassword = lazyPage(() => import('../pages/ResetPassword'))
const RegisterNew = lazyPage(() => import('../pages/RegisterNew'))
const TPSScanner = lazyPage(() => import('../pages/TPSScanner'))
const TPSSuccess = lazyPage(() => import('../pages/TPSSuccess'))
const TPSValidation = lazyPage(() => import('../pages/TPSValidation'))
const TPSVoting = lazyPage(() => import('../pages/TPSVoting'))
const VotingOnline = lazyPage(() => import('../pages/VotingOnline'))
const VotingTPS = lazyPage(() => import('../pages/VotingTPS'))
const TPSPanelDashboard = lazyPage(() => import('../pages/TPSPanelDashboard'))
const AdminTPSPanel = lazyPage(() => import('../pages/AdminTPSPanel'))
const TPSPanelHistory = lazyPage(() => import('../pages/TPSPanelHistory'))
const TPSPanelVotingRoom = lazyPage(() => import('../pages/TPSPanelVotingRoom'))
const TPSQRScanner = lazyPage(() => import('../pages/TPSQRScanner'))
const TPSCheckInSuccess = lazyPage(() => import('../pages/TPSCheckInSuccess'))
const TPSVoterDetail = lazyPage(() => import('../pages/TPSVoterDetail'))
const TPSPanelSettings = lazyPage(() => import('../pages/TPSPanelSettings'))
const VoterQRScanner = lazyPage(() => import('../pages/VoterQRScanner'))
const VoterHistory = lazyPage(() => import('../pages/VoterHistory'))
const VoterCandidates = lazyPage(() => import('../pages/VoterCandidates'))
const VoterCandidateDetail = lazyPage(() => import('../pages/VoterCandidateDetail'))
const VoterHelp = lazyPage(() => import('../pages/VoterHelp'))
const VoterProfile = lazyPage(() => import('../pages/VoterProfile'))
const ElectionResults = lazyPage(() => import('../pages/ElectionResults'))
const AdminDashboard = lazyPage(() => import('../pages/AdminDashboard'))
const AdminLogin = lazyPage(() => import('../pages/AdminLogin'))
const AdminCandidatesList = lazyPage(() => import('../pages/AdminCandidatesList'))
const AdminCandidateForm = lazyPage(() => import('../pages/AdminCandidateForm'))
const AdminCandidatePreview = lazyPage(() => import('../pages/AdminCandidatePreview'))
const AdminElectionSettings = lazyPage(() => import('../pages/AdminElectionSettings'))
const AdminMonitoringLiveCount = lazyPage(() => import('../pages/AdminMonitoringLiveCount'))
const AdminTPSList = lazyPage(() => import('../pages/AdminTPSList'))
const AdminTPSForm = lazyPage(() => import('../pages/AdminTPSForm'))
const AdminTPSDetail = lazyPage(() => import('../pages/AdminTPSDetail'))
const AdminDPTList = lazyPage(() => import('../pages/AdminDPTList'))
const AdminDPTImport = lazyPage(() => import('../pages/AdminDPTImport'))
const AdminDPTDetail = lazyPage(() => import('../pages/AdminDPTDetail'))
const AdminDPTEdit = lazyPage(() => import('../pages/AdminDPTEdit'))
const AdminDPTAdd = lazyPage(() => import('../pages/AdminDPTAdd'))
const AdminUserManagement = lazyPage(() => import('../pages/AdminUserManagement'))
const Panduan = lazyPage(() => import('../pages/Panduan'))
const AdminFlowGuide = lazyPage(() => import('../pages/AdminFlowGuide'))
const JadwalPemilu = lazyPage(() => import('../pages/JadwalPemilu'))
const Tentang = lazyPage(() => import('../pages/Tentang'))
const ContactPanitia = lazyPage(() => import('../pages/ContactPanitia'))

export type RouteDefinition = {
  id: string
  path: string
  Component: RouteComponent
  requiresAuth?: boolean
  publicOnly?: boolean
  requiresAdminAuth?: boolean
}

export const appRoutes: RouteDefinition[] = [
  { id: 'landing', path: '/', Component: LandingPage },
  { id: 'panduan', path: '/panduan', Component: Panduan },
  { id: 'demo-accounts', path: '/demo', Component: DemoAccounts, publicOnly: true },
  { id: 'login', path: '/login', Component: LoginMahasiswa, publicOnly: true },
  { id: 'reset-password', path: '/reset-password', Component: ResetPassword, publicOnly: true },
  { id: 'register', path: '/register', Component: RegisterNew, publicOnly: true },
  { id: 'admin-login', path: '/admin/login', Component: AdminLogin },
  { id: 'dashboard', path: '/dashboard', Component: DashboardPemilihHiFi, requiresAuth: true },
  { id: 'voter-history', path: '/dashboard/riwayat', Component: VoterHistory, requiresAuth: true },
  { id: 'voter-candidates', path: '/dashboard/kandidat', Component: VoterCandidates, requiresAuth: true },
  { id: 'voter-candidate-detail', path: '/dashboard/kandidat/detail/:id', Component: VoterCandidateDetail, requiresAuth: true },
  { id: 'voter-help', path: '/dashboard/bantuan', Component: VoterHelp, requiresAuth: true },
  { id: 'voter-profile', path: '/dashboard/profil', Component: VoterProfile, requiresAuth: true },
  { id: 'candidates', path: '/kandidat', Component: DaftarKandidat },
  { id: 'candidate-detail', path: '/kandidat/detail/:id', Component: DetailKandidat },
  { id: 'online-voting', path: '/voting', Component: VotingOnline, requiresAuth: true },
  { id: 'tps-home', path: '/voting-tps', Component: VotingTPS, requiresAuth: true },
  { id: 'tps-scanner', path: '/voting-tps/scanner', Component: TPSScanner, requiresAuth: true },
  { id: 'tps-validate', path: '/voting-tps/validate', Component: TPSValidation, requiresAuth: true },
  { id: 'tps-vote', path: '/voting-tps/vote', Component: TPSVoting, requiresAuth: true },
  { id: 'tps-scan-candidate', path: '/voting-tps/scan-candidate', Component: VoterQRScanner, requiresAuth: true },
  { id: 'tps-success', path: '/voting-tps/success', Component: TPSSuccess, requiresAuth: true },
  { id: 'hasil-pemilihan', path: '/hasil', Component: ElectionResults },
  { id: 'tps-panel', path: '/tps-panel', Component: TPSPanelDashboard },
  { id: 'tps-panel-history', path: '/tps-panel/riwayat', Component: TPSPanelHistory },
  { id: 'tps-panel-voting-room', path: '/tps-panel/mode-voting', Component: TPSPanelVotingRoom },
  { id: 'tps-panel-scan-qr', path: '/tps-panel/scan-qr', Component: TPSQRScanner },
  { id: 'tps-panel-checkin-success', path: '/tps-panel/checkin-success', Component: TPSCheckInSuccess },
  { id: 'tps-panel-voter-detail', path: '/tps-panel/detail/:id', Component: TPSVoterDetail },
  { id: 'tps-panel-settings', path: '/tps-panel/settings', Component: TPSPanelSettings },
  { id: 'admin-tps-panel', path: '/admin/tps/panel', Component: AdminTPSPanel, requiresAdminAuth: true },
  { id: 'admin-dashboard', path: '/admin', Component: AdminDashboard, requiresAdminAuth: true },
  { id: 'admin-candidates', path: '/admin/kandidat', Component: AdminCandidatesList, requiresAdminAuth: true },
  { id: 'admin-candidate-add', path: '/admin/kandidat/tambah', Component: AdminCandidateForm, requiresAdminAuth: true },
  { id: 'admin-candidate-edit', path: '/admin/kandidat/:id/edit', Component: AdminCandidateForm, requiresAdminAuth: true },
  { id: 'admin-candidate-preview', path: '/admin/kandidat/:id/preview', Component: AdminCandidatePreview, requiresAdminAuth: true },
  { id: 'admin-election-settings', path: '/admin/pengaturan', Component: AdminElectionSettings, requiresAdminAuth: true },
  { id: 'admin-election-flow-guide', path: '/admin/pengaturan/panduan', Component: AdminFlowGuide, requiresAdminAuth: true },
  { id: 'admin-monitoring', path: '/admin/monitoring', Component: AdminMonitoringLiveCount, requiresAdminAuth: true },
  { id: 'admin-tps-list', path: '/admin/tps', Component: AdminTPSList, requiresAdminAuth: true },
  { id: 'admin-tps-add', path: '/admin/tps/tambah', Component: AdminTPSForm, requiresAdminAuth: true },
  { id: 'admin-tps-edit', path: '/admin/tps/:id/edit', Component: AdminTPSForm, requiresAdminAuth: true },
  { id: 'admin-tps-detail', path: '/admin/tps/:id', Component: AdminTPSDetail, requiresAdminAuth: true },
  { id: 'admin-dpt-list', path: '/admin/dpt', Component: AdminDPTList, requiresAdminAuth: true },
  { id: 'admin-dpt-import', path: '/admin/dpt/import', Component: AdminDPTImport, requiresAdminAuth: true },
  { id: 'admin-dpt-add', path: '/admin/dpt/tambah', Component: AdminDPTAdd, requiresAdminAuth: true },
  { id: 'admin-dpt-edit', path: '/admin/dpt/:id/edit', Component: AdminDPTEdit, requiresAdminAuth: true },
  { id: 'admin-dpt-detail', path: '/admin/dpt/:id', Component: AdminDPTDetail, requiresAdminAuth: true },
  { id: 'admin-users', path: '/admin/users', Component: AdminUserManagement, requiresAdminAuth: true },
  { id: 'jadwal-pemilu', path: '/jadwal', Component: JadwalPemilu },
  { id: 'tentang', path: '/tentang', Component: Tentang },
  { id: 'kontak-panitia', path: '/kontak', Component: ContactPanitia },
]

export const fallbackRoute: RouteDefinition = {
  id: 'fallback',
  path: '*',
  Component: LandingPage,
}
