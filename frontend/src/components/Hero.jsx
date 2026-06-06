import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const LinkIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
  </svg>
)

const FetchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)

const PlaylistIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75z"/>
  </svg>
)

const SingleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/>
  </svg>
)

const SocialIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/>
  </svg>
)

const AudioIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-7.5 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/>
  </svg>
)

const STATS = [
  { val: 'Unlimited', lbl: 'Videos per playlist' },
  { val: '4K UHD',    lbl: 'Max quality'         },
  { val: 'Free',      lbl: 'Always & forever'    },
]

export default function Hero({ onFetch, onSingleFetch, onSocialFetch, onAudioFetch, loading, mode, onModeChange }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [url, setUrl] = useState('')

  const submit = (e) => {
    e?.preventDefault()
    if (!url.trim() || loading) return
    if (mode === 'playlist')     onFetch(url.trim())
    else if (mode === 'single')  onSingleFetch(url.trim())
    else if (mode === 'social')  onSocialFetch(url.trim())
    else                         onAudioFetch(url.trim())
  }

  const handleTabChange = (m) => { onModeChange(m); setUrl('') }

  const isPlaylist = mode === 'playlist'
  const isSingle   = mode === 'single'
  const isSocial   = mode === 'social'
  const isAudio    = mode === 'audio'

  const placeholder = isPlaylist ? 'https://youtube.com/playlist?list=...'
    : isSingle  ? 'https://youtube.com/watch?v=...'
    : isSocial  ? 'https://instagram.com/reel/... or facebook.com/... or tiktok.com/...'
    : 'https://youtube.com/watch?v=... or playlist?list=... (downloads as MP3)'

  const btnLabel = isPlaylist ? <><FetchIcon/>Fetch Playlist</>
    : isSingle  ? <><DownloadIcon/>Get Video</>
    : isSocial  ? <><DownloadIcon/>Download Video</>
    : <><DownloadIcon/>Get MP3</>

  const loadLabel = isPlaylist ? 'Fetching…' : 'Loading…'

  return (
    <section id="home" className={`relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>

      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,151,0.10) 0%, transparent 70%)' }}/>
        <div className="absolute -bottom-20 right-0 w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(20,184,151,0.07) 0%, transparent 70%)' }}/>
      </div>

      {/* Grid lines */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px),linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}/>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 animate-fade-up"
          style={{ background: 'rgba(20,184,151,0.08)', borderColor: 'rgba(20,184,151,0.25)' }}>
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"/>
          <span className={`text-xs font-semibold tracking-wide ${isDark ? 'text-brand-300' : 'text-brand-700'}`}>
            Free · Open Source · No Login Required
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] tracking-tight mb-5 animate-fade-up"
          style={{ animationDelay: '60ms' }}>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>Download YouTube</span>
          <br/>
          <span className="text-gradient">Videos Instantly</span>
        </h1>

        {/* Sub */}
        <p className={`text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up ${isDark ? 'text-white/48' : 'text-gray-500'}`}
          style={{ animationDelay: '120ms' }}>
          {isPlaylist ? 'Paste any YouTube playlist URL, pick your quality, select videos, and download them all in seconds.'
            : isSingle  ? 'Paste any YouTube video URL and download it instantly in your preferred quality.'
            : isSocial  ? 'Paste any Facebook, Instagram, Twitter, TikTok, Snapchat or other social media video URL.'
            : 'Paste any YouTube video or playlist URL — download as MP3 audio instantly.'}
        </p>

        {/* ── Mode Tabs ── */}
        <div className="flex justify-center mb-7 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className={`inline-flex rounded-2xl p-1 border flex-wrap justify-center gap-0.5 ${isDark ? 'bg-surface-800/80 border-white/8' : 'bg-white border-gray-200 shadow-sm'}`}>
            <button onClick={() => handleTabChange('playlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isPlaylist ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}>
              <PlaylistIcon/>Playlist
            </button>
            <button onClick={() => handleTabChange('single')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isSingle ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}>
              <SingleIcon/>Single Video
            </button>
            <button onClick={() => handleTabChange('social')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isSocial ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}>
              <SocialIcon/>Social Media
            </button>
            <button onClick={() => handleTabChange('audio')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isAudio ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}>
              <AudioIcon/>MP3 Audio
            </button>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto animate-fade-up"
          style={{ animationDelay: '180ms' }}>
          <div className="relative flex-1">
            <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>
              <LinkIcon/>
            </span>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={placeholder}
              className={`w-full pl-10 pr-4 py-3.5 rounded-xl text-sm border font-mono
                focus:outline-none transition-all duration-200
                ${isDark
                  ? 'bg-surface-800 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 shadow-sm'
                }`}
            />
          </div>
          <button type="submit" disabled={!url.trim() || loading} className="btn-primary py-3.5 px-7">
            {loading ? <><SpinIcon/>{loadLabel}</> : btnLabel}
          </button>
        </form>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-14 mt-14 animate-fade-up"
          style={{ animationDelay: '260ms' }}>
          {STATS.map(s => (
            <div key={s.lbl} className="text-center">
              <div className="font-display font-extrabold text-2xl text-gradient">{s.val}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-white/38' : 'text-gray-400'}`}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator — animated chevrons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 animate-fade-up"
        style={{ animationDelay: '400ms' }}>
        <svg className={`w-5 h-5 animate-bounce ${isDark ? 'text-white/20' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
        </svg>
        <svg className={`w-5 h-5 animate-bounce ${isDark ? 'text-brand-500/40' : 'text-brand-400/60'}`} style={{ animationDelay: '150ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
        </svg>
      </div>
    </section>
  )
}
