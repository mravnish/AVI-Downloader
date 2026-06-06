import { useTheme } from '../context/ThemeContext'

const STEPS = [
  { n: '01', title: 'Paste Playlist URL',  desc: 'Copy a YouTube playlist link and paste it into the input field.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg> },
  { n: '02', title: 'Fetch Videos',        desc: 'Click Fetch Playlist and all videos load with thumbnails and metadata.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg> },
  { n: '03', title: 'Select & Configure',  desc: 'Choose which videos to download and pick your preferred quality.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/></svg> },
  { n: '04', title: 'Download & Enjoy',    desc: 'Hit download and watch real-time progress. Your videos are ready.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg> },
]

export default function HowItWorks() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section id="how-it-works" className={`py-24 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ background: 'rgba(20,184,151,0.07)', borderColor: 'rgba(20,184,151,0.22)' }}>
            <span className="text-sm font-semibold text-brand-400">Simple process</span>
          </div>
          <h2 className={`font-display font-extrabold text-4xl sm:text-5xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How it <span className="text-gradient">works</span>
          </h2>
          <p className={`text-lg max-w-md mx-auto ${isDark ? 'text-white/42' : 'text-gray-500'}`}>
            Four simple steps from URL to downloaded videos.
          </p>
        </div>

        <div className="relative">
          {/* Connector */}
          <div className="hidden lg:block absolute top-11 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(20,184,151,0.28),rgba(20,184,151,0.28),transparent)' }}/>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex flex-col items-center text-center group">
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-brand-500/15
                  ${isDark
                    ? 'bg-surface-800 border-brand-500/25 text-brand-400'
                    : 'bg-white border-brand-200 text-brand-600 shadow-sm'
                  }`}>
                  {s.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-[11px]">{i + 1}</span>
                  </div>
                </div>
                <div className="font-mono text-xs text-brand-500/55 mb-1.5">{s.n}</div>
                <h3 className={`font-display font-bold text-[17px] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/38' : 'text-gray-500'}`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
