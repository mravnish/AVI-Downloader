import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getAudioInfo, getPlaylistAudioInfo, buildAudioDownloadUrl } from '../utils/api'

/* ── Icons ── */
const MusicIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-7.5 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/>
  </svg>
)
const DlIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)
const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
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
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
  </svg>
)
const PlayIcon = () => (
  <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const QUALITIES = [
  { value: '320', label: '320 kbps — Best' },
  { value: '192', label: '192 kbps — High' },
  { value: '128', label: '128 kbps — Standard' },
]

function fmtDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60), s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function isPlaylistUrl(url) {
  return /[?&]list=/.test(url) || /playlist/i.test(url)
}

function extractVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0]
    return u.searchParams.get('v') || null
  } catch { return null }
}

/* ── Single track card ── */
function TrackCard({ track, index, quality, isDark }) {
  const [dlState,  setDlState]  = useState('idle')
  const [thumbErr, setThumbErr] = useState(false)

  const handleDownload = () => {
    if (dlState === 'downloading') return
    setDlState('downloading')
    const url = buildAudioDownloadUrl(track.videoId, track.title, quality)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `${track.title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDlState('done'), 3500)
    setTimeout(() => setDlState('idle'), 8000)
  }

  const surface = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'

  return (
    <div className={`rounded-2xl border overflow-hidden card-lift group select-none animate-fade-up ${surface}`}
      style={{ borderImage: dlState === 'done' ? 'linear-gradient(135deg,#14b897,#0d9488) 1' : undefined,
               borderColor: dlState === 'done' ? '#14b897' : undefined }}>

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-700">
        {!thumbErr && track.thumbnail ? (
          <img src={track.thumbnail} alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setThumbErr(true)}/>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-surface-700' : 'bg-gray-100'}`}>
            <div className="text-4xl opacity-30">🎵</div>
          </div>
        )}

        {/* Play overlay → opens YouTube */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/25">
          <a href={`https://youtube.com/watch?v=${track.videoId}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
            <PlayIcon/>
          </a>
        </div>

        {/* Duration */}
        {track.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
            <ClockIcon/>{fmtDuration(track.duration)}
          </div>
        )}

        {/* Track number */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold">
          {track.index || index + 1}
        </div>

        {/* MP3 badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-500/80 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider">
          MP3
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <p className={`text-[12.5px] font-semibold leading-snug line-clamp-2 mb-1 ${isDark ? 'text-white/90' : 'text-gray-900'}`}
          title={track.title}>
          {track.title}
        </p>
        {track.channel && (
          <p className={`text-[11px] mb-3 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{track.channel}</p>
        )}

        {/* Download button */}
        <button onClick={handleDownload} disabled={dlState === 'downloading'}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11.5px] font-semibold
            transition-all duration-200 active:scale-95
            ${dlState === 'done'
              ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
              : dlState === 'downloading'
                ? isDark ? 'bg-purple-500/10 text-purple-500/50 cursor-wait' : 'bg-purple-50 text-purple-400 cursor-wait'
                : isDark ? 'bg-purple-500/12 text-purple-300 hover:bg-purple-500/22 hover:text-purple-200' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}>
          {dlState === 'done'
            ? <><CheckIcon/>Downloaded!</>
            : dlState === 'downloading'
              ? <><SpinIcon/>Preparing MP3…</>
              : <><DlIcon/>Download MP3</>
          }
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════ */
export default function AudioSection({ triggerUrl, onReady }) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [tracks,   setTracks]   = useState([])
  const [meta,     setMeta]     = useState(null)   // { title, count, isPlaylist }
  const [quality,  setQuality]  = useState('320')
  const [selected, setSelected] = useState(new Set())
  const [dlAll,    setDlAll]    = useState('idle')  // idle | downloading | done
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    if (!triggerUrl) return
    fetchAudioInfo(triggerUrl)
  }, [triggerUrl])

  async function fetchAudioInfo(url) {
    setLoading(true)
    setError(null)
    setTracks([])
    setMeta(null)
    setSelected(new Set())

    try {
      if (isPlaylistUrl(url)) {
        // Playlist mode
        const data = await getPlaylistAudioInfo(url)
        if (!data.success) throw new Error(data.error || 'Failed to fetch playlist')
        setTracks(data.tracks || [])
        setMeta({ title: data.title, count: data.count, isPlaylist: true })
        // Select all by default
        setSelected(new Set((data.tracks || []).map(t => t.videoId)))
      } else {
        // Single video mode
        const vid = extractVideoId(url)
        if (!vid) throw new Error('Could not extract video ID. Please check the URL.')
        const data = await getAudioInfo(vid)
        if (!data.success) throw new Error(data.error || 'Failed to fetch video info')
        const track = { videoId: data.videoId, title: data.title, channel: data.channel, thumbnail: data.thumbnail, duration: data.duration, index: 1 }
        setTracks([track])
        setMeta({ title: data.title, count: 1, isPlaylist: false })
        setSelected(new Set([data.videoId]))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      onReady?.()
    }
  }

  const toggleSelect = (vid) => {
    setSelected(s => {
      const n = new Set(s)
      n.has(vid) ? n.delete(vid) : n.add(vid)
      return n
    })
  }

  const selectAll   = () => setSelected(new Set(tracks.map(t => t.videoId)))
  const deselectAll = () => setSelected(new Set())

  // Download all selected one by one
  const handleDownloadAll = () => {
    const toDownload = tracks.filter(t => selected.has(t.videoId))
    if (!toDownload.length) return
    setDlAll('downloading')
    toDownload.forEach((track, i) => {
      setTimeout(() => {
        const url = buildAudioDownloadUrl(track.videoId, track.title, quality)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `${track.title}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        if (i === toDownload.length - 1) {
          setTimeout(() => setDlAll('done'), 2000)
          setTimeout(() => setDlAll('idle'), 6000)
        }
      }, i * 800) // stagger 800ms apart so browser doesn't block
    })
  }

  const filteredTracks = tracks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.channel || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!triggerUrl && !loading && !tracks.length && !error) return null

  const surface   = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  const textMain  = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-500'

  return (
    <section id="audio-section" className={`py-16 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className={`rounded-2xl border p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${surface}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            <MusicIcon/>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-display font-bold text-lg ${textMain}`}>
              {meta?.isPlaylist ? 'Playlist MP3 Download' : 'Single Audio Download'}
            </h2>
            <p className={`text-sm mt-0.5 ${textMuted}`}>
              {meta ? `${meta.title} · ${meta.count} track${meta.count !== 1 ? 's' : ''}` : loading ? 'Fetching audio info…' : 'Paste a YouTube URL above'}
            </p>
          </div>
          {tracks.length > 0 && (
            <span className={`text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
              {tracks.length} track{tracks.length !== 1 ? 's' : ''}
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

        {/* Controls toolbar (playlist mode) */}
        {tracks.length > 1 && !loading && (
          <div className={`rounded-2xl border p-3.5 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center ${surface}`}>
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracks…"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${isDark ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-purple-500/40' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}/>
            </div>

            {/* Select All / Deselect */}
            <div className="flex items-center gap-2">
              <button onClick={selectAll}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${isDark ? 'border-white/8 text-white/55 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                Select All
              </button>
              <button onClick={deselectAll}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${isDark ? 'border-white/8 text-white/55 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                Deselect All
              </button>
            </div>

            {/* Quality */}
            <select value={quality} onChange={e => setQuality(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer focus:outline-none transition-all ${isDark ? 'bg-surface-700 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
              {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>

            {/* Download selected */}
            <button onClick={handleDownloadAll} disabled={!selected.size || dlAll === 'downloading'}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap
                ${dlAll === 'done'
                  ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  : 'bg-purple-500 text-white hover:bg-purple-400 shadow-md shadow-purple-500/30 disabled:opacity-40'
                }`}>
              {dlAll === 'done'
                ? <><CheckIcon/>All Downloaded!</>
                : dlAll === 'downloading'
                  ? <><SpinIcon/>Downloading…</>
                  : <><DlIcon/>Download MP3 ({selected.size})</>
              }
            </button>
          </div>
        )}

        {/* Single track quality selector */}
        {tracks.length === 1 && !loading && (
          <div className="flex items-center gap-3 mb-5">
            <label className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Quality</label>
            <select value={quality} onChange={e => setQuality(e.target.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer focus:outline-none transition-all ${isDark ? 'bg-surface-700 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
              {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="video-grid animate-fade-in">
            {[1,2,3,4].map(i => (
              <div key={i} className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/5 bg-surface-800' : 'border-gray-200 bg-white shadow-sm'}`}>
                <div className="aspect-video shimmer"/>
                <div className="p-3.5 space-y-2.5">
                  <div className="shimmer h-3.5 rounded w-full"/>
                  <div className="shimmer h-3 rounded w-3/4"/>
                  <div className="shimmer h-8 rounded-xl w-full"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Track grid */}
        {!loading && filteredTracks.length > 0 && (
          <div className="video-grid">
            {filteredTracks.map((track, i) => (
              <div key={track.videoId} className="relative">
                {/* Checkbox for playlist */}
                {tracks.length > 1 && (
                  <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                    <input type="checkbox" checked={selected.has(track.videoId)}
                      onChange={() => toggleSelect(track.videoId)}
                      className="custom-cb"/>
                  </div>
                )}
                <div className={`transition-opacity duration-150 ${tracks.length > 1 && !selected.has(track.videoId) ? 'opacity-50' : 'opacity-100'}`}>
                  <TrackCard track={track} index={i} quality={quality} isDark={isDark}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty search */}
        {!loading && tracks.length > 0 && filteredTracks.length === 0 && (
          <div className={`py-16 text-center ${textMuted} text-sm`}>No tracks found for "{search}"</div>
        )}

        {/* Empty state */}
        {!loading && !tracks.length && !error && (
          <div className={`py-24 text-center ${isDark ? 'text-white/18' : 'text-gray-300'}`}>
            <div className="text-5xl mb-4 opacity-40">🎵</div>
            <p className="text-sm font-medium">Paste a YouTube video or playlist URL above to download as MP3</p>
          </div>
        )}
      </div>
    </section>
  )
}
