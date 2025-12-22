import type { JSX } from 'react'

type LoadingScreenProps = {
  message?: string
  fullScreen?: boolean
  inline?: boolean
}

const LoadingScreen = ({ message = 'Memuat halaman...', fullScreen, inline }: LoadingScreenProps): JSX.Element => {
  const className = ['app-loading', fullScreen ? 'app-loading-full' : '', inline ? 'app-loading-inline' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} aria-live="polite" aria-busy="true">
      <div className="app-loading-spinner" />
      <p>{message}</p>
    </div>
  )
}

export default LoadingScreen
