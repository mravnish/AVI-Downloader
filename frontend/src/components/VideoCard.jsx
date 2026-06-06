import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { buildDownloadUrl } from '../utils/api'

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

const SpinIcon = () => (
  <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)

export default function VideoCard({ video, selected, onToggle, quality, index }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [imgOk, setImgOk]       = useState(true)
  const [dlState, setDlState]   = useState('idle') // idle | downloading | done | error

  const triggerDownload = (e) => {
    e.stopPropagation()
    if (dlState === 'downloading') return
    setDlState('downloading')

    const url = buildDownloadUrl(video.id, quality, video.title)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `${video.title}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // After 3 s switch to "done" to give feedback
    setTimeout(() => setDlState('done'), 3000)
    setTimeout(() => setDlState('idle'), 7000)
  }

  const cardBorder = selected
    ? 'border-brand-500/55 shadow-lg shadow-brand-500/10'
    : isDark
      ? 'border-white/6 hover:border-white/14'
      : 'border-gray-200 hover:border-brand-300 shadow-sm'

  const cardBg = isDark
    ? selected ? 'bg-surface-800' : 'bg-surface-800'
    : selected ? 'bg-brand-50/60' : 'bg-white'

  return (
    <div
      onClick={onToggle}
      className={`relative rounded-2xl overflow-hidden cursor-pointer card-lift border
        transition-all duration-200 group select-none
        ${cardBorder} ${cardBg}`}
    >
      {/* Selection tint */}
      {selected && (
        <div className="pointer-events-none absolute inset-0 bg-brand-500/[0.04] rounded-2xl z-10"/>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-700">
        {imgOk ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgOk(false)}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-surface-700' : 'bg-gray-100'}`}>
            <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/>
            </svg>
          </div>
        )}

        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/25">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <PlayIcon/>
          </div>
        </div>

        {/* Duration */}
        {video.duration && video.duration !== 'N/A' && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
            <ClockIcon/>{video.duration}
          </div>
        )}

        {/* Index */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white/65 text-[10px] font-mono">
          #{video.index}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex gap-2.5 items-start mb-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            className="custom-cb mt-0.5"
            checked={selected}
            onChange={onToggle}
            onClick={e => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <p className={`text-[12.5px] font-semibold leading-snug line-clamp-2 ${isDark ? 'text-white/90' : 'text-gray-900'}`}
              title={video.title}>
              {video.title}
            </p>
            <p className={`text-[11px] mt-1 truncate ${isDark ? 'text-white/32' : 'text-gray-400'}`}>
              {video.author}
            </p>
          </div>
        </div>

        {/* Download button */}
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
            ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>Downloaded</>
            : dlState === 'downloading'
              ? <><SpinIcon/>Starting…</>
              : <><DlIcon/>Download {quality}</>
          }
        </button>
      </div>
    </div>
  )
}
