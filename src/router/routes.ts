import type { ComponentType } from 'react'
import DashboardPemilih from '../pages/DashboardPemilih'
import DaftarKandidat from '../pages/DaftarKandidat'
import DemoAccounts from '../pages/DemoAccounts'
import DetailKandidat from '../pages/DetailKandidat'
import LandingPage from '../pages/LandingPage'
import LoginMahasiswa from '../pages/LoginMahasiswa'
import TPSScanner from '../pages/TPSScanner'
import TPSSuccess from '../pages/TPSSuccess'
import TPSValidation from '../pages/TPSValidation'
import TPSVoting from '../pages/TPSVoting'
import VotingOnline from '../pages/VotingOnline'
import VotingTPS from '../pages/VotingTPS'
import TPSPanelDashboard from '../pages/TPSPanelDashboard'
import TPSPanelHistory from '../pages/TPSPanelHistory'
import TPSPanelVotingRoom from '../pages/TPSPanelVotingRoom'
import AdminDashboard from '../pages/AdminDashboard'
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

export type RouteDefinition = {
  id: string
  path: string
  Component: ComponentType
  requiresAuth?: boolean
  publicOnly?: boolean
}

export const appRoutes: RouteDefinition[] = [
  { id: 'landing', path: '/', Component: LandingPage },
  { id: 'demo-accounts', path: '/demo', Component: DemoAccounts, publicOnly: true },
  { id: 'login', path: '/login', Component: LoginMahasiswa, publicOnly: true },
  { id: 'dashboard', path: '/dashboard', Component: DashboardPemilih, requiresAuth: true },
  { id: 'candidates', path: '/kandidat', Component: DaftarKandidat },
  { id: 'candidate-detail', path: '/kandidat/detail/:id', Component: DetailKandidat },
  { id: 'online-voting', path: '/voting', Component: VotingOnline, requiresAuth: true },
  { id: 'tps-home', path: '/voting-tps', Component: VotingTPS, requiresAuth: true },
  { id: 'tps-scanner', path: '/voting-tps/scanner', Component: TPSScanner, requiresAuth: true },
  { id: 'tps-validate', path: '/voting-tps/validate', Component: TPSValidation, requiresAuth: true },
  { id: 'tps-vote', path: '/voting-tps/vote', Component: TPSVoting, requiresAuth: true },
  { id: 'tps-success', path: '/voting-tps/success', Component: TPSSuccess, requiresAuth: true },
  { id: 'tps-panel', path: '/tps-panel', Component: TPSPanelDashboard },
  { id: 'tps-panel-history', path: '/tps-panel/riwayat', Component: TPSPanelHistory },
  { id: 'tps-panel-voting-room', path: '/tps-panel/mode-voting', Component: TPSPanelVotingRoom },
  { id: 'admin-dashboard', path: '/admin', Component: AdminDashboard },
  { id: 'admin-candidates', path: '/admin/kandidat', Component: AdminCandidatesList },
  { id: 'admin-candidate-add', path: '/admin/kandidat/tambah', Component: AdminCandidateForm },
  { id: 'admin-candidate-edit', path: '/admin/kandidat/:id/edit', Component: AdminCandidateForm },
  { id: 'admin-candidate-preview', path: '/admin/kandidat/:id/preview', Component: AdminCandidatePreview },
  { id: 'admin-election-settings', path: '/admin/pengaturan', Component: AdminElectionSettings },
  { id: 'admin-monitoring', path: '/admin/monitoring', Component: AdminMonitoringLiveCount },
  { id: 'admin-tps-list', path: '/admin/tps', Component: AdminTPSList },
  { id: 'admin-tps-add', path: '/admin/tps/tambah', Component: AdminTPSForm },
  { id: 'admin-tps-edit', path: '/admin/tps/:id/edit', Component: AdminTPSForm },
  { id: 'admin-tps-detail', path: '/admin/tps/:id', Component: AdminTPSDetail },
  { id: 'admin-dpt-list', path: '/admin/dpt', Component: AdminDPTList },
  { id: 'admin-dpt-import', path: '/admin/dpt/import', Component: AdminDPTImport },
  { id: 'admin-dpt-detail', path: '/admin/dpt/:id', Component: AdminDPTDetail },
]

export const fallbackRoute: RouteDefinition = {
  id: 'fallback',
  path: '*',
  Component: LandingPage,
}
