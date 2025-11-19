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
]

export const fallbackRoute: RouteDefinition = {
  id: 'fallback',
  path: '*',
  Component: LandingPage,
}
