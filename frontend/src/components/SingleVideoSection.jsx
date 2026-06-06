import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getVideoInfo, buildDownloadUrl } from '../utils/api'

/* ── Icons (matching VideoCard exactly) ── */
const DlIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)
const PlayIcon = () => (
  <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)
const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
)
const EyeIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
  </svg>
)
const SpinIcon = () => (
  <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)
const AlertIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
  </svg>
)
const VideoListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/>
  </svg>
)

const QUALITIES = ['360p', '480p', '720p', '1080p', '2K', '4K']

function extractVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0]
    return u.searchParams.get('v') || null
  } catch { return null }
}

/* YouTube provides these thumbnail URLs — try best quality first, fall back */
function ytThumb(videoId, quality = 'maxresdefault') {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}

function fmtDuration(sec) {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = String(sec % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

function fmtNum(n) {
  if (!n) return ''
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

/* ── The actual video card — mirrors VideoCard.jsx structure exactly ── */
function SingleVideoCard({ info, quality, onQualityChange }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  // Fallback chain: maxresdefault → hqdefault → mqdefault → sddefault
  const THUMB_SIZES = ['maxresdefault', 'hqdefault', 'mqdefault', 'sddefault']
  const [thumbIdx, setThumbIdx] = useState(0)
  const [dlState,  setDlState]  = useState('idle') // idle | downloading | done

  // Use API-supplied thumbnail if present, otherwise build from videoId
  const thumbSrc  = info.thumbnail || ytThumb(info.videoId, THUMB_SIZES[thumbIdx])
  const thumbFailed = thumbIdx >= THUMB_SIZES.length

  const onThumbError = () => setThumbIdx(i => i + 1)

  const triggerDownload = (e) => {
    e?.stopPropagation()
    if (dlState === 'downloading') return
    setDlState('downloading')
    const url = buildDownloadUrl(info.videoId, quality, info.title)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `${info.title}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDlState('done'), 3000)
    setTimeout(() => setDlState('idle'), 7000)
  }

  // Always show as "selected" — brand border like a selected playlist card
  const cardBorder = isDark
    ? 'border-brand-500/55 shadow-lg shadow-brand-500/10'
    : 'border-brand-300 shadow-md shadow-brand-500/8'

  const cardBg = isDark ? 'bg-surface-800' : 'bg-brand-50/40'

  // Quality list: prefer API formats, fall back to QUALITIES
  const qualList = info.formats?.length
    ? info.formats.map(f => f.quality || f.label).filter(Boolean)
    : QUALITIES

  return (
    <div className={`relative rounded-2xl overflow-hidden border card-lift transition-all duration-200 group select-none ${cardBorder} ${cardBg}`}>

      {/* Brand tint overlay — always active */}
      <div className="pointer-events-none absolute inset-0 bg-brand-500/[0.04] rounded-2xl z-10"/>

      {/* ── Thumbnail — tries API-supplied, then YouTube CDN fallbacks ── */}
      <div className="relative aspect-video overflow-hidden bg-surface-700">
        {!thumbFailed ? (
          <img
            key={thumbSrc}
            src={thumbSrc}
            alt={info.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={onThumbError}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-surface-700' : 'bg-gray-100'}`}>
            <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/>
            </svg>
          </div>
        )}

        {/* Hover play overlay — links to YouTube */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/25">
          <a
            href={`https://youtube.com/watch?v=${info.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
          >
            <PlayIcon/>
          </a>
        </div>

        {/* Duration badge */}
        {info.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
            <ClockIcon/>{fmtDuration(info.duration)}
          </div>
        )}

        {/* "Single" label top-left — matches #index style from VideoCard */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-brand-500/80 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase">
          Single
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-3.5">

        {/* Title + meta — same layout as VideoCard body */}
        <div className="flex gap-2.5 items-start mb-3">

          {/* Brand checkmark dot instead of checkbox — always "selected" */}
          <div className="mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded-[5px] bg-brand-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-[12.5px] font-semibold leading-snug line-clamp-2 ${isDark ? 'text-white/90' : 'text-gray-900'}`}
              title={info.title}
            >
              {info.title}
            </p>
            <div className={`flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] ${isDark ? 'text-white/32' : 'text-gray-400'}`}>
              {info.channel && <span className="truncate">{info.channel}</span>}
              {info.views && (
                <span className="flex items-center gap-1">
                  <EyeIcon/>{fmtNum(info.views)} views
                </span>
              )}
              {info.engine && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isDark ? 'bg-white/6 text-white/25' : 'bg-gray-100 text-gray-400'}`}>
                  {info.engine}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Quality selector — same styled <select> as PlaylistSection toolbar ── */}
        <div className="mb-3 flex items-center gap-2.5">
          <p className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>
            Quality
          </p>
          <select
            value={quality}
            onChange={e => { onQualityChange(e.target.value); setDlState('idle') }}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border cursor-pointer focus:outline-none transition-all
              ${isDark
                ? 'bg-surface-700 border-white/8 text-white focus:border-brand-500/50'
                : 'bg-white border-gray-200 text-gray-900 focus:border-brand-400 shadow-sm'
              }`}
          >
            {qualList.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        {/* ── Download button — exactly matches VideoCard's download button ── */}
        <button
          onClick={triggerDownload}
          disabled={dlState === 'downloading'}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11.5px] font-semibold
            transition-all duration-200 active:scale-95
            ${dlState === 'done'
              ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
              : dlState === 'downloading'
                ? isDark ? 'bg-brand-500/10 text-brand-500/50 cursor-wait' : 'bg-brand-50 text-brand-400 cursor-wait'
                : isDark ? 'bg-brand-500/12 text-brand-400 hover:bg-brand-500/22 hover:text-brand-300' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
        >
          {dlState === 'done'
            ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>Downloaded!</>
            : dlState === 'downloading'
              ? <><SpinIcon/>Starting…</>
              : <><DlIcon/>Download {quality}</>
          }
        </button>
      </div>
    </div>
  )
}

/* ── Section shell — mirrors PlaylistSection layout ── */
export default function SingleVideoSection({ triggerUrl, onReady }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [videoInfo, setVideoInfo] = useState(null)
  const [quality,   setQuality]   = useState('720p')

  useEffect(() => {
    if (!triggerUrl) return
    const vid = extractVideoId(triggerUrl)
    if (!vid) {
      setError('Could not find a video ID in that URL. Make sure it is a valid YouTube watch link.')
      setVideoInfo(null)
      onReady?.()
      return
    }
    fetchInfo(vid)
  }, [triggerUrl])

  async function fetchInfo(videoId) {
    setLoading(true)
    setError(null)
    setVideoInfo(null)
    try {
      const data = await getVideoInfo(videoId)
      if (!data.success) throw new Error(data.error || 'Failed to load video info')
      setVideoInfo({ ...data, videoId })
      // Auto-select best quality from API formats
      const formats = data.formats || []
      if (formats.length) setQuality(formats[0].quality || formats[0].label || '720p')
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
    <section id="single-section" className={`py-16 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header bar — matches PlaylistSection header style */}
        <div className={`rounded-2xl border p-4 mb-7 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${surface}`}>
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400 flex-shrink-0">
            <VideoListIcon/>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-display font-bold text-lg ${textMain}`}>Single Video Download</h2>
            <p className={`text-sm mt-0.5 ${textMuted}`}>
              {videoInfo
                ? `${videoInfo.channel || 'YouTube'} · 1 video ready`
                : loading
                  ? 'Fetching video info…'
                  : 'Paste a YouTube video link above to get started'}
            </p>
          </div>
          {videoInfo && (
            <span className={`text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
              1 ready
            </span>
          )}
        </div>

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 animate-fade-in">
            <AlertIcon/>
            <div className="flex-1 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        )}

        {/* ── Loading — one skeleton card matching SkeletonCard exactly ── */}
        {loading && (
          <div className="video-grid animate-fade-in">
            <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/5 bg-surface-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className="aspect-video shimmer"/>
              <div className="p-3.5 space-y-2.5">
                <div className="flex gap-3">
                  <div className="shimmer w-5 h-5 rounded-md flex-shrink-0 mt-0.5"/>
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-3.5 rounded w-full"/>
                    <div className="shimmer h-3.5 rounded w-4/5"/>
                    <div className="shimmer h-3 rounded w-1/3"/>
                  </div>
                </div>
                {/* Quality skeleton pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer h-7 rounded-lg w-12"/>)}
                </div>
                <div className="shimmer h-8 rounded-xl w-full"/>
              </div>
            </div>
          </div>
        )}

        {/* ── Loaded card — sits in the same video-grid as playlist cards ── */}
        {videoInfo && !loading && (
          <div className="video-grid animate-fade-in">
            <div className="animate-fade-up">
              <SingleVideoCard
                info={videoInfo}
                quality={quality}
                onQualityChange={setQuality}
              />
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!videoInfo && !loading && !error && (
          <div className={`py-24 text-center ${isDark ? 'text-white/18' : 'text-gray-300'}`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/>
            </svg>
            <p className="text-base font-medium">Paste a YouTube video URL above to get started</p>
          </div>
        )}

      </div>
    </section>
  )
}
