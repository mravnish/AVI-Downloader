import { useTheme } from '../context/ThemeContext'

export function SkeletonCard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
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
        <div className="shimmer h-8 rounded-xl w-full"/>
      </div>
    </div>
  )
}

export function SkeletonHeader() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-2xl border p-4 mb-5 flex gap-4 items-center ${isDark ? 'border-white/5 bg-surface-800' : 'border-gray-200 bg-white shadow-sm'}`}>
      <div className="shimmer w-20 h-14 rounded-xl flex-shrink-0"/>
      <div className="flex-1 space-y-2">
        <div className="shimmer h-4 rounded w-3/5"/>
        <div className="shimmer h-3 rounded w-2/5"/>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="video-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i}/>)}
    </div>
  )
}
