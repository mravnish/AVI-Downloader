import { useTheme } from '../context/ThemeContext'

export default function DownloadProgress({ current, total, quality, onCancel }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pct    = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={`rounded-2xl border p-5 animate-fade-in ${
      isDark ? 'bg-surface-800 border-brand-500/20' : 'bg-white border-brand-200 shadow-sm'
    }`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/14 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Downloading in {quality}
            </p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {current} of {total} video{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-brand-400 text-sm">{pct}%</span>
          {onCancel && (
            <button onClick={onCancel}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
                isDark ? 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20' : 'border-gray-200 text-gray-400 hover:text-gray-600'
              }`}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className={`h-2.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/8' : 'bg-gray-100'}`}>
        <div
          className="h-full rounded-full progress-fill relative overflow-hidden"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0d9279,#14b897,#2dd4b0)' }}
        >
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', animation: 'shimmer 1.8s infinite', backgroundSize: '200% 100%' }}/>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < current ? '#14b897' : i === current ? 'rgba(20,184,151,0.3)' : isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}/>
        ))}
      </div>
    </div>
  )
}
