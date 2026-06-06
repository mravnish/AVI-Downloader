import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getSocialInfo, buildSocialDownloadUrl } from '../utils/api'

/* ── Platform config — icons as inline SVG or emoji ── */
const PLATFORMS = [
  {
    key    : 'facebook',
    name   : 'Facebook',
    color  : '#1877F2',
    dark   : '#145DBF',
    hint   : 'Paste a Facebook video or reel URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key    : 'instagram',
    name   : 'Instagram',
    color  : '#E1306C',
    dark   : '#C13584',
    hint   : 'Paste an Instagram reel, post or story URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    key    : 'twitter',
    name   : 'Twitter / X',
    color  : '#000000',
    dark   : '#111111',
    hint   : 'Paste a Twitter / X video tweet URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    key    : 'tiktok',
    name   : 'TikTok',
    color  : '#010101',
    dark   : '#010101',
    hint   : 'Paste a TikTok video URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
  },
  {
    key    : 'snapchat',
    name   : 'Snapchat',
    color  : '#FFFC00',
    dark   : '#F5E800',
    hint   : 'Paste a Snapchat spotlight or story URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.166.006C9.338-.116 6.286 1.264 4.6 3.989c-.76 1.24-.973 2.636-.974 3.99-.002.968.037 1.928-.055 2.79-.041.378-.148.568-.406.693-.188.09-.382.093-.578.093-.26 0-.51-.04-.77-.04-.26 0-.538.038-.738.228-.164.158-.233.38-.233.586 0 .51.323.885.763 1.11.547.28 1.22.39 1.795.538.185.047.385.09.55.17.148.073.268.18.33.383.08.263.003.522-.078.748l-.035.093c-.525 1.35-1.328 2.195-2.63 2.783-.196.09-.394.158-.394.404 0 .296.31.444.55.518.73.22 1.47.345 2.22.517.154.036.33.093.444.213.075.08.1.176.12.276.067.356.122.716.31.993.182.268.486.38.796.38.253 0 .504-.066.745-.127.33-.084.646-.183.99-.183.335 0 .598.104.878.246.543.274 1.09.637 1.857.637s1.307-.36 1.857-.637c.277-.14.54-.246.872-.246.344 0 .66.1.99.183.24.062.49.127.743.127.38 0 .68-.14.852-.413.17-.27.232-.618.296-.965.024-.13.052-.238.128-.318.113-.12.29-.177.443-.213.75-.172 1.49-.296 2.22-.517.24-.074.55-.222.55-.518 0-.244-.197-.313-.393-.403-1.3-.588-2.104-1.43-2.63-2.78l-.036-.095c-.08-.226-.157-.486-.078-.75.063-.2.184-.31.332-.382.165-.08.364-.122.548-.17.575-.146 1.248-.257 1.796-.536.44-.224.762-.6.762-1.11 0-.207-.07-.43-.233-.587-.2-.19-.478-.227-.74-.227-.26 0-.51.038-.768.038-.197 0-.39-.003-.58-.094-.255-.124-.363-.313-.406-.69-.09-.863-.052-1.822-.054-2.79-.002-1.34-.21-2.72-.958-3.966C17.73 1.276 14.982-.116 12.166.006z"/>
      </svg>
    ),
  },
  {
    key    : 'reddit',
    name   : 'Reddit',
    color  : '#FF4500',
    dark   : '#E03D00',
    hint   : 'Paste a Reddit video post URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    ),
  },
  {
    key    : 'vimeo',
    name   : 'Vimeo',
    color  : '#1AB7EA',
    dark   : '#0E99C8',
    hint   : 'Paste a Vimeo video URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.48 4.807l-.001.004z"/>
      </svg>
    ),
  },
  {
    key    : 'dailymotion',
    name   : 'Dailymotion',
    color  : '#0066DC',
    dark   : '#0055B8',
    hint   : 'Paste a Dailymotion video URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.005 0C5.374 0 0 5.374 0 12.005 0 18.63 5.374 24 12.005 24 18.63 24 24 18.63 24 12.005 24 5.374 18.63 0 12.005 0zm4.333 14.927a5.028 5.028 0 0 1-4.333 2.489 5.028 5.028 0 0 1-5.028-5.028 5.028 5.028 0 0 1 5.028-5.028c1.15 0 2.21.39 3.058 1.037V6.53h1.81v8.08a5.01 5.01 0 0 1-.535.317zm-4.333-5.864a3.226 3.226 0 1 0 0 6.452 3.226 3.226 0 0 0 0-6.452z"/>
      </svg>
    ),
  },
  {
    key    : 'twitch',
    name   : 'Twitch',
    color  : '#9146FF',
    dark   : '#7B2FBE',
    hint   : 'Paste a Twitch clip or VOD URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
    ),
  },
  {
    key    : 'pinterest',
    name   : 'Pinterest',
    color  : '#E60023',
    dark   : '#C0001C',
    hint   : 'Paste a Pinterest video pin URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
  },
  {
    key    : 'linkedin',
    name   : 'LinkedIn',
    color  : '#0A66C2',
    dark   : '#0854A0',
    hint   : 'Paste a LinkedIn video post URL',
    icon   : (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
]

/* ── Icons ── */
const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
  </svg>
)
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)
const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
)
const AlertIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
  </svg>
)

function fmtDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60), s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ══════════════════════════════════════
   VIDEO RESULT CARD
══════════════════════════════════════ */
function SocialVideoCard({ info, isDark }) {
  const [quality,  setQuality]  = useState(info.formats?.[0]?.quality || 'best')
  const [dlState,  setDlState]  = useState('idle')
  const [thumbErr, setThumbErr] = useState(false)

  const platform = PLATFORMS.find(p => p.key === info.platformKey) || PLATFORMS[0]

  const handleDownload = () => {
    if (dlState === 'downloading') return
    setDlState('downloading')
    const url = buildSocialDownloadUrl(info.url, quality, info.title, info.platformKey)
    const a   = document.createElement('a')
    a.href     = url
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDlState('done'), 3500)
    setTimeout(() => setDlState('idle'), 7000)
  }

  const surface = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'

  return (
    <div className={`rounded-2xl border overflow-hidden card-lift animate-fade-up ${surface}`} style={{ borderColor: `${platform.color}30` }}>

      {/* Platform header stripe */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${platform.color}, ${platform.dark})` }}/>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface-700 overflow-hidden">
        {!thumbErr && info.thumbnail ? (
          <img src={info.thumbnail} alt={info.title}
            className="w-full h-full object-cover"
            onError={() => setThumbErr(true)}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${platform.color}15` }}>
            <div className="text-5xl opacity-40" style={{ color: platform.color }}>{platform.icon}</div>
          </div>
        )}
        {/* Duration */}
        {info.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
            <ClockIcon/>{fmtDuration(info.duration)}
          </div>
        )}
        {/* Platform badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold backdrop-blur-sm"
          style={{ background: platform.color }}>
          <span className="w-3.5 h-3.5">{platform.icon}</span>
          {platform.name}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <p className={`text-[13px] font-semibold leading-snug line-clamp-2 mb-1 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
          {info.title}
        </p>
        {info.uploader && (
          <p className={`text-xs mb-3 font-medium`} style={{ color: platform.color }}>
            @{info.uploader}
          </p>
        )}

        {/* Quality select */}
        <div className="mb-3">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>Quality</p>
          <select value={quality} onChange={e => { setQuality(e.target.value); setDlState('idle') }}
            className={`w-full px-3 py-2 rounded-xl text-sm font-semibold border cursor-pointer focus:outline-none transition-all ${
              isDark ? 'bg-surface-700 border-white/8 text-white focus:border-brand-500/50' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
            }`}>
            {(info.formats || [{ quality: 'best', label: 'Best Quality' }]).map(f => (
              <option key={f.quality} value={f.quality}>{f.label || f.quality}</option>
            ))}
          </select>
        </div>

        {/* Download button */}
        <button onClick={handleDownload} disabled={dlState === 'downloading'}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
            dlState === 'done'
              ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
              : dlState === 'downloading'
                ? isDark ? 'opacity-50 cursor-wait text-white/50' : 'opacity-50 cursor-wait text-gray-400'
                : 'text-white'
          }`}
          style={dlState === 'idle' ? { background: platform.color } : {}}>
          {dlState === 'done'
            ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>Downloaded!</>
            : dlState === 'downloading'
              ? <><SpinIcon/>Preparing…</>
              : <><DownloadIcon/>Download {quality}</>
          }
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════ */
export default function SocialSection({ triggerUrl, onReady }) {
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'

  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [videoInfo,  setVideoInfo]  = useState(null)
  const [activePlat, setActivePlat] = useState(null)  // selected platform tile

  useEffect(() => {
    if (!triggerUrl) return
    fetchInfo(triggerUrl)
  }, [triggerUrl])

  async function fetchInfo(url) {
    setLoading(true)
    setError(null)
    setVideoInfo(null)
    try {
      const data = await getSocialInfo(url)
      if (!data.success) throw new Error(data.error || 'Failed to fetch video info')
      setVideoInfo({ ...data, url })
      // Auto-detect platform for highlighting
      const detected = PLATFORMS.find(p => new RegExp(p.key, 'i').test(data.platformKey))
      if (detected) setActivePlat(detected.key)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      onReady?.()
    }
  }

  if (!triggerUrl && !loading && !videoInfo && !error) return null

  const surface   = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  const textMain  = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-500'

  return (
    <section id="social-section" className={`py-16 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className={`rounded-2xl border p-4 mb-7 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${surface}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-brand-500/15 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-display font-bold text-lg ${textMain}`}>Social Media Downloader</h2>
            <p className={`text-sm mt-0.5 ${textMuted}`}>
              {videoInfo
                ? `${videoInfo.platform} · ready to download`
                : loading ? 'Fetching video info…'
                : 'Paste any social media video URL above'}
            </p>
          </div>
          {videoInfo && (
            <span className={`text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
              1 video ready
            </span>
          )}
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 animate-fade-in">
            <AlertIcon/>
            <div className="flex-1 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="video-grid animate-fade-in">
            <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/5 bg-surface-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className="h-1 shimmer w-full"/>
              <div className="aspect-video shimmer"/>
              <div className="p-4 space-y-3">
                <div className="shimmer h-4 rounded w-full"/>
                <div className="shimmer h-4 rounded w-3/4"/>
                <div className="shimmer h-9 rounded-xl w-full"/>
                <div className="shimmer h-10 rounded-xl w-full"/>
              </div>
            </div>
          </div>
        )}

        {/* Video card */}
        {videoInfo && !loading && (
          <div className="video-grid">
            <SocialVideoCard info={videoInfo} isDark={isDark}/>
          </div>
        )}

        {/* Empty */}
        {!videoInfo && !loading && !error && (
          <div className={`py-20 text-center ${isDark ? 'text-white/18' : 'text-gray-300'}`}>
            <svg className="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/>
            </svg>
            <p className="text-sm font-medium">Paste a social media URL above to get started</p>
          </div>
        )}
      </div>
    </section>
  )
}
