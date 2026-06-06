import { useTheme } from '../context/ThemeContext'

const FEATURES = [
  { icon: '📋', title: 'Full Playlist Support',  desc: 'Fetch entire playlists of any size instantly — no video count limit.', color: 'from-brand-500/18 to-brand-600/5'  },
  { icon: '✅', title: 'Selective Download',      desc: 'Pick individual videos, select all, or search for specific ones.',     color: 'from-sky-500/18 to-sky-600/5'    },
  { icon: '🎬', title: 'Multiple Qualities',      desc: 'From 360p up to 4K UHD. Pick the resolution that suits your needs.',  color: 'from-violet-500/18 to-violet-600/5'},
  { icon: '⚡', title: 'Lightning Fast',          desc: 'yt-dlp backend with direct stream piping for maximum speed.',          color: 'from-amber-500/18 to-amber-600/5' },
  { icon: '📊', title: 'Live Progress Tracking',  desc: 'Real-time progress bar and per-video step indicators as you download.',color: 'from-rose-500/18 to-rose-600/5'   },
  { icon: '🌙', title: 'Dark & Light Mode',       desc: 'Beautiful in both themes. Toggle with one click from the navbar.',    color: 'from-teal-500/18 to-teal-600/5'  },
]

export default function Features() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section id="features" className={`py-24 px-4 ${isDark ? 'bg-surface-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ background: 'rgba(20,184,151,0.07)', borderColor: 'rgba(20,184,151,0.22)' }}>
            <span className="text-sm font-semibold text-brand-400">Everything you need</span>
          </div>
          <h2 className={`font-display font-extrabold text-4xl sm:text-5xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Packed with <span className="text-gradient">powerful features</span>
          </h2>
          <p className={`text-lg max-w-lg mx-auto ${isDark ? 'text-white/42' : 'text-gray-500'}`}>
            Everything you need to download YouTube playlists quickly and effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className={`rounded-2xl p-6 border transition-all duration-300 group hover:-translate-y-1 ${
                isDark
                  ? 'bg-surface-800 border-white/6 hover:border-brand-500/22 hover:shadow-xl hover:shadow-black/20'
                  : 'bg-gray-50 border-gray-200 hover:border-brand-200 hover:shadow-md'
              }`}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 text-2xl transition-transform duration-300 group-hover:scale-110`}>
                {f.icon}
              </div>
              <h3 className={`font-display font-bold text-[17px] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/42' : 'text-gray-500'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
