import type { ComponentType } from 'react'
import DashboardPemilihHiFi from '../pages/DashboardPemilihHiFi'
import DaftarKandidat from '../pages/DaftarKandidat'
import DemoAccounts from '../pages/DemoAccounts'
import DetailKandidat from '../pages/DetailKandidat'
import LandingPage from '../pages/LandingPage'
import LoginMahasiswa from '../pages/LoginMahasiswa'
import RegisterNew from '../pages/RegisterNew'
import TPSScanner from '../pages/TPSScanner'
import TPSSuccess from '../pages/TPSSuccess'
import TPSValidation from '../pages/TPSValidation'
import TPSVoting from '../pages/TPSVoting'
import VotingOnline from '../pages/VotingOnline'
import VotingTPS from '../pages/VotingTPS'
import TPSPanelDashboard from '../pages/TPSPanelDashboard'
import AdminTPSPanel from '../pages/AdminTPSPanel'
import TPSPanelHistory from '../pages/TPSPanelHistory'
import TPSPanelVotingRoom from '../pages/TPSPanelVotingRoom'
import TPSQRScanner from '../pages/TPSQRScanner'
import TPSCheckInSuccess from '../pages/TPSCheckInSuccess'
import TPSVoterDetail from '../pages/TPSVoterDetail'
import TPSPanelSettings from '../pages/TPSPanelSettings'
import VoterQRScanner from '../pages/VoterQRScanner'
import VoterHistory from '../pages/VoterHistory'
import VoterCandidates from '../pages/VoterCandidates'
import VoterHelp from '../pages/VoterHelp'
import VoterProfile from '../pages/VoterProfile'
import ElectionResults from '../pages/ElectionResults'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLogin from '../pages/AdminLogin'
import AdminCandidatesList from '../pages/AdminCandidatesList'
import AdminCandidateForm from '../pages/AdminCandidateForm'
import AdminCandidatePreview from '../pages/AdminCandidatePreview'
import AdminElectionSettings from '../pages/AdminElectionSettings'
import AdminMonitoringLiveCount from '../pages/AdminMonitoringLiveCount'
import AdminTPSList from '../pages/AdminTPSList'
import AdminTPSForm from '../pages/AdminTPSForm'
import AdminTPSDetail from '../pages/AdminTPSDetail'
import AdminDPTList from '../pages/AdminDPTList'
import AdminDPTImport from '../pages/AdminDPTImport'
import AdminDPTDetail from '../pages/AdminDPTDetail'
import AdminDPTEdit from '../pages/AdminDPTEdit'
import AdminDPTAdd from '../pages/AdminDPTAdd'
import AdminUserManagement from '../pages/AdminUserManagement'
import Panduan from '../pages/Panduan'
import AdminFlowGuide from '../pages/AdminFlowGuide'
import JadwalPemilu from '../pages/JadwalPemilu'
import Tentang from '../pages/Tentang'
import ContactPanitia from '../pages/ContactPanitia'

export type RouteDefinition = {
  id: string
  path: string
  Component: ComponentType
  requiresAuth?: boolean
  publicOnly?: boolean
  requiresAdminAuth?: boolean
}

export const appRoutes: RouteDefinition[] = [
  { id: 'landing', path: '/', Component: LandingPage },
  { id: 'panduan', path: '/panduan', Component: Panduan },
  { id: 'demo-accounts', path: '/demo', Component: DemoAccounts, publicOnly: true },
  { id: 'login', path: '/login', Component: LoginMahasiswa, publicOnly: true },
  { id: 'register', path: '/register', Component: RegisterNew, publicOnly: true },
  { id: 'admin-login', path: '/admin/login', Component: AdminLogin },
  { id: 'dashboard', path: '/dashboard', Component: DashboardPemilihHiFi, requiresAuth: true },
  { id: 'voter-history', path: '/dashboard/riwayat', Component: VoterHistory, requiresAuth: true },
  { id: 'voter-candidates', path: '/dashboard/kandidat', Component: VoterCandidates, requiresAuth: true },
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
