const getEnv = (key: string): string | undefined => {
  const value = import.meta.env[key] as string | undefined
  return value && value.trim() ? value : undefined
}

const resolveApiBaseUrl = (): string => {
  const configured = getEnv('VITE_API_BASE_URL')
  const localOverride = getEnv('VITE_API_BASE_URL_LOCAL')
  const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

  if (isLocalHost) {
    return localOverride ?? configured ?? 'http://localhost:8080/api/v1'
  }

  return configured ?? '/api/v1'
}

export const API_BASE_URL = resolveApiBaseUrl()

const resolveElectionId = (): number => {
  const envId = getEnv('VITE_ELECTION_ID')
  return envId ? Number(envId) : 1
}

export const ACTIVE_ELECTION_ID = resolveElectionId()
