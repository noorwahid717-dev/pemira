import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../ProtectedRoute'
import PublicOnlyRoute from '../PublicOnlyRoute'
import type { VoterSession } from '../../types/voting'
import { useVotingSession } from '../../hooks/useVotingSession'

vi.mock('../../hooks/useVotingSession', () => ({
  useVotingSession: vi.fn(),
}))

const mockedSessionHook = vi.mocked(useVotingSession)

const dummySession: VoterSession = {
  nim: '2110510001',
  hasVoted: false,
  votingStatus: 'open',
}

const ProtectedContent = () => <p>Protected Content</p>
const PublicContent = () => <p>Beranda Publik</p>
const LoginPage = () => <p>Login Page</p>
const DashboardPage = () => <p>Dashboard Page</p>

beforeEach(() => {
  mockedSessionHook.mockReset()
})

describe('ProtectedRoute', () => {
  it('redirects to login when session missing', () => {
    mockedSessionHook.mockReturnValue({ session: null } as any)

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<ProtectedRoute component={ProtectedContent} />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login Page')).toBeDefined()
  })

  it('renders component when session exists', () => {
    mockedSessionHook.mockReturnValue({ session: dummySession } as any)

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<ProtectedRoute component={ProtectedContent} />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeDefined()
  })
})

describe('PublicOnlyRoute', () => {
  it('renders public route when no session', () => {
    mockedSessionHook.mockReturnValue({ session: null } as any)

    render(
      <MemoryRouter initialEntries={['/demo']}>
        <Routes>
          <Route path="/demo" element={<PublicOnlyRoute component={PublicContent} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Beranda Publik')).toBeDefined()
  })

  it('redirects to dashboard when session exists', () => {
    mockedSessionHook.mockReturnValue({ session: dummySession } as any)

    render(
      <MemoryRouter initialEntries={['/demo']}>
        <Routes>
          <Route path="/demo" element={<PublicOnlyRoute component={PublicContent} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Dashboard Page')).toBeDefined()
  })
})
