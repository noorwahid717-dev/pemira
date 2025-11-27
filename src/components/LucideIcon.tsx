import type { SVGProps } from 'react'

export type IconName =
  | 'alertCircle'
  | 'arrowLeft'
  | 'arrowRight'
  | 'ballot'
  | 'barChart'
  | 'bell'
  | 'briefcase'
  | 'building'
  | 'calendar'
  | 'chevronDown'
  | 'checkCircle'
  | 'compass'
  | 'clock'
  | 'download'
  | 'fileCheck'
  | 'fileText'
  | 'folder'
  | 'graduationCap'
  | 'helpCircle'
  | 'home'
  | 'info'
  | 'laptop'
  | 'layoutDashboard'
  | 'lightbulb'
  | 'lock'
  | 'logOut'
  | 'mail'
  | 'mapPin'
  | 'megaphone'
  | 'moon'
  | 'package'
  | 'pencil'
  | 'presentation'
  | 'printer'
  | 'receipt'
  | 'refreshCw'
  | 'rocket'
  | 'satellite'
  | 'scroll'
  | 'search'
  | 'settings'
  | 'shieldCheck'
  | 'smartphone'
  | 'target'
  | 'ticket'
  | 'trash'
  | 'trendingUp'
  | 'user'
  | 'users'
  | 'xCircle'

const ICONS: Record<IconName, JSX.Element> = {
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  arrowLeft: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  ballot: (
    <>
      <path d="M4 9h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
      <path d="M9 4h6l1 4H8z" />
      <path d="M10 13l2 2 4-4" />
    </>
  ),
  barChart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="8" width="4" height="8" rx="1" />
      <rect x="13" y="5" width="4" height="11" rx="1" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  building: (
    <>
      <path d="M12 3 2 9h20Z" />
      <path d="M6 10v7" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
      <path d="M18 10v7" />
      <path d="M2 21h20" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  chevronDown: (
    <>
      <polyline points="6 9 12 15 18 9" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16 8 14.5 14.5 8 16 9.5 9.5 16 8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </>
  ),
  fileCheck: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 14l2 2 4-4" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h1" />
    </>
  ),
  folder: (
    <>
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </>
  ),
  graduationCap: (
    <>
      <path d="M22 10 12 4 2 10l10 6 10-6Z" />
      <path d="M6 12v5c3 1 9 1 12 0v-5" />
      <path d="M4 9v6" />
    </>
  ),
  helpCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 1 1 3.91 3.59c-.45.18-.75.61-.75 1.09V15" />
      <path d="M12 18h.01" />
    </>
  ),
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  laptop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </>
  ),
  layoutDashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="15" width="7" height="6" rx="1" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12l.5 1a2 2 0 0 0 1.5 1h4a2 2 0 0 0 1.5-1l.5-1a7 7 0 0 0-4-12Z" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  logOut: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a4 4 0 0 0 4 4h1l4 4v-6h4l3 2V4l-3 2H7a4 4 0 0 0-4 4Z" />
      <path d="M11 5v14" />
    </>
  ),
  moon: (
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  ),
  package: (
    <>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M3 7l9 5 9-5" />
      <path d="M21 7v10a2 2 0 0 1-1 1.73l-8 4.44a2 2 0 0 1-2 0l-8-4.44A2 2 0 0 1 3 17V7" />
      <path d="m3.3 7.3 8.7 4.7 8.7-4.7" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  presentation: (
    <>
      <path d="M3 4h18" />
      <path d="M4 4v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4" />
      <path d="M12 13 9 9l3-4 3 4Z" />
      <path d="M8 20h8" />
      <path d="M12 17v3" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V4h12v5" />
      <rect x="6" y="14" width="12" height="6" rx="1" />
      <path d="M6 14H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1" />
      <path d="M10 18h4" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 3h16v19l-4-2-4 2-4-2-4 2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </>
  ),
  refreshCw: (
    <>
      <path d="M21 2v6h-6" />
      <path d="M3 22v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L21 8" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L3 16" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-.5 1.5-1.5 4-1.5 4s2.5-1 4-1.5L17 9a4.24 4.24 0 0 0 1.12-4.13l-.54-1.8-1.8-.54A4.24 4.24 0 0 0 11.65 3Z" />
      <path d="m15 9-6 6" />
      <path d="M9 9c-1.5.5-4 1.5-4 1.5s1-2.5 1.5-4L10 3.5" />
      <path d="m12 18 2 2" />
      <path d="m13.5 14.5 2 2" />
      <path d="M4.5 16.5 3 15" />
    </>
  ),
  satellite: (
    <>
      <path d="m13 7 5 5" />
      <path d="m8 12 5 5" />
      <path d="m17 7 2.8-2.8a1.9 1.9 0 1 1 2.7 2.7L19.7 9.7" />
      <path d="m7 17-2.8 2.8a1.9 1.9 0 1 1-2.7-2.7L4.3 14.3" />
      <path d="m21 2-1.5 1.5" />
      <path d="m3 22 1.5-1.5" />
      <path d="M8 12a4 4 0 1 0 5 5" />
    </>
  ),
  scroll: (
    <>
      <path d="M19 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10" />
      <path d="M19 17a2 2 0 0 0 2-2V7" />
      <path d="M13 9h4" />
      <path d="M13 13h4" />
      <path d="M9 7h0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  settings: (
    <>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.4 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  smartphone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="m17.657 6.343-1.414 1.414" />
      <path d="M22 12h-2" />
      <path d="m17.657 17.657-1.414-1.414" />
      <path d="M12 22v-2" />
      <path d="m6.343 17.657 1.414-1.414" />
      <path d="M2 12h2" />
      <path d="m6.343 6.343 1.414 1.414" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0-2 2 2 2 0 0 0 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  trendingUp: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
}

interface LucideIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

const LucideIcon = ({ name, size = 24, className, strokeWidth = 1.75, ...props }: LucideIconProps): JSX.Element => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {ICONS[name]}
  </svg>
)

export { LucideIcon }
