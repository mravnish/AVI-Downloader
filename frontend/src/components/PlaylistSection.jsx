import { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { fetchPlaylist, buildDownloadUrl } from '../utils/api'
import VideoCard from './VideoCard'
import { SkeletonHeader, SkeletonGrid } from './SkeletonCard'
import DownloadProgress from './DownloadProgress'

const QUALITIES = ['360p', '480p', '720p', '1080p', '2K', '4K']

/* ── icons ── */
const RefreshIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
const SearchIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/></svg>
const DlAllIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
const AlertIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
const SpinIcon = () => <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/></svg>

export default function PlaylistSection({ triggerUrl, onReady }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [url,        setUrl]        = useState('')
  const [loading,    setLoading]    = useState(false)
  const [playlist,   setPlaylist]   = useState(null)
  const [error,      setError]      = useState('')
  const [selected,   setSelected]   = useState(new Set())
  const [quality,    setQuality]    = useState('720p')
  const [search,     setSearch]     = useState('')
  const [downloading, setDownloading] = useState(false)
  const [dlProgress,  setDlProgress]  = useState({ current: 0, total: 0 })
  const cancelRef = useRef(false)

  /* Sync URL from hero form */
  useEffect(() => {
    if (triggerUrl) {
      setUrl(triggerUrl)
      doFetch(triggerUrl)
    }
  }, [triggerUrl])

  const doFetch = useCallback(async (target) => {
    const u = (target || url).trim()
    if (!u) return
    setLoading(true)
    setError('')
    setPlaylist(null)
    setSelected(new Set())
    setSearch('')
    try {
      const data = await fetchPlaylist(u)
      setPlaylist(data.playlist)
      onReady?.()
    } catch (err) {
      setError(err.message || 'Failed to fetch playlist.')
    } finally {
      setLoading(false)
    }
  }, [url, onReady])

  /* Filtered list */
  const filtered = playlist?.videos?.filter(v =>
    !search || v.title.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const toggleVideo = (id) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const selectAll   = () => setSelected(new Set(filtered.map(v => v.id)))
  const deselectAll = () => setSelected(new Set())

  const selectedVideos = playlist?.videos?.filter(v => selected.has(v.id)) ?? []

  /* Bulk download with stagger */
  const handleBulkDownload = async () => {
    if (!selectedVideos.length || downloading) return
    cancelRef.current = false
    setDownloading(true)
    setDlProgress({ current: 0, total: selectedVideos.length })

    for (let i = 0; i < selectedVideos.length; i++) {
      if (cancelRef.current) break
      const v   = selectedVideos[i]
      const url = buildDownloadUrl(v.id, quality, v.title)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${v.title}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDlProgress({ current: i + 1, total: selectedVideos.length })
      // Stagger requests so browser doesn't block
      if (i < selectedVideos.length - 1) await sleep(900)
    }

    setTimeout(() => { setDownloading(false); setDlProgress({ current: 0, total: 0 }) }, 1600)
  }

  const cancelDownload = () => {
    cancelRef.current = true
    setDownloading(false)
    setDlProgress({ current: 0, total: 0 })
  }

  const surface  = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  const textMain = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-500'

  return (
    <section id="playlist-section" className={`py-16 px-4 min-h-[60vh] ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── URL bar ── */}
        <div className={`rounded-2xl border p-4 mb-7 ${surface}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doFetch()}
              placeholder="https://youtube.com/playlist?list=..."
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-mono border focus:outline-none transition-all
                ${isDark
                  ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15'
                }`}
            />
            <button
              onClick={() => doFetch()}
              disabled={loading || !url.trim()}
              className="btn-primary"
            >
              {loading
                ? <><SpinIcon/>Fetching…</>
                : <><RefreshIcon/>Fetch Playlist</>
              }
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 animate-fade-in">
            <AlertIcon/>
            <div className="flex-1 text-sm">{error}</div>
            <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        )}

        {/* ── Skeletons ── */}
        {loading && (
          <div className="animate-fade-in">
            <SkeletonHeader/>
            <SkeletonGrid count={8}/>
          </div>
        )}

        {/* ── Loaded ── */}
        {playlist && !loading && (
          <div className="animate-fade-in">

            {/* Playlist header */}
            <div className={`rounded-2xl border p-4 mb-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${surface}`}>
              {playlist.thumbnail && (
                <img src={playlist.thumbnail} alt={playlist.title}
                  className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-surface-700"
                  onError={e => { e.target.style.display = 'none' }}/>
              )}
              <div className="flex-1 min-w-0">
                <h2 className={`font-display font-bold text-lg truncate ${textMain}`}>{playlist.title}</h2>
                <p className={`text-sm mt-0.5 ${textMuted}`}>
                  by {playlist.author} · {playlist.videos.length} videos loaded
                  {playlist.engine && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/6 text-white/35' : 'bg-gray-100 text-gray-400'}`}>{playlist.engine}</span>}
                </p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
                {playlist.videos.length} ready
              </span>
            </div>

            {/* Toolbar */}
            <div className={`rounded-2xl border p-3.5 mb-5 flex flex-wrap gap-2 items-center ${surface}`}>
              {/* Search */}
              <div className="relative flex-1 min-w-[140px]">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`}><SearchIcon/></span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search videos…"
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none transition-all
                    ${isDark
                      ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/25 focus:border-brand-500/50'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400'
                    }`}
                />
              </div>

              <button onClick={selectAll}   className="btn-ghost text-xs py-2">Select All</button>
              <button onClick={deselectAll} className="btn-ghost text-xs py-2">Deselect All</button>

              {/* Quality */}
              <select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                className={`px-3 py-2 rounded-xl text-sm border cursor-pointer focus:outline-none transition-all
                  ${isDark
                    ? 'bg-surface-700 border-white/8 text-white focus:border-brand-500/50'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-brand-400 shadow-sm'
                  }`}
              >
                {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
              </select>

              {/* Bulk download */}
              <button
                onClick={handleBulkDownload}
                disabled={!selected.size || downloading}
                className="btn-primary"
              >
                {downloading
                  ? <><SpinIcon/>Downloading…</>
                  : <><DlAllIcon/>Download ({selected.size})</>
                }
              </button>
            </div>

            {/* Selection count */}
            {selected.size > 0 && !downloading && (
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl mb-5 text-sm ${isDark ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-brand-50 border border-brand-200'}`}>
                <span className={isDark ? 'text-brand-300' : 'text-brand-700'}>
                  <strong>{selected.size}</strong> video{selected.size !== 1 ? 's' : ''} selected
                </span>
                <button onClick={deselectAll} className={`text-xs hover:underline ${isDark ? 'text-brand-400/70 hover:text-brand-300' : 'text-brand-600'}`}>
                  Clear
                </button>
              </div>
            )}

            {/* Progress bar */}
            {downloading && (
              <div className="mb-5">
                <DownloadProgress
                  current={dlProgress.current}
                  total={dlProgress.total}
                  quality={quality}
                  onCancel={cancelDownload}
                />
              </div>
            )}

            {/* Video grid */}
            {filtered.length > 0 ? (
              <div className="video-grid">
                {filtered.map((video, idx) => (
                  <div key={video.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(idx * 30, 360)}ms` }}>
                    <VideoCard
                      video={video}
                      selected={selected.has(video.id)}
                      onToggle={() => toggleVideo(video.id)}
                      quality={quality}
                      index={idx + 1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-20 text-center ${textMuted}`}>
                <svg className="w-14 h-14 mx-auto mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
                </svg>
                <p className="text-sm">No videos match your search.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!playlist && !loading && !error && (
          <div className={`py-24 text-center ${isDark ? 'text-white/18' : 'text-gray-300'}`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75z"/>
            </svg>
            <p className="text-base font-medium">Paste a YouTube playlist URL above to get started</p>
          </div>
        )}
      </div>
    </section>
  )
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
