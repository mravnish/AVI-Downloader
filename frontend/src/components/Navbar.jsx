import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

/* ── Icons ── */
const SunIcon  = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"/></svg>
const MoonIcon = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z"/></svg>
const MenuIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
const XIcon    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
const GHIcon   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>

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

const ChevronIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
  </svg>
)

const NAV_LINKS = [
  { label: 'Home',         href: '#home'        },
  { label: 'Features',     href: '#features'    },
  { label: 'How It Works', href: '#how-it-works' },
]

export default function Navbar({ mode, onModeChange }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [scrolled,      setScrolled]      = useState(false)
  const [open,          setOpen]          = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = () => setDropdownOpen(false)
    window.addEventListener('click', handler, { once: true })
    return () => window.removeEventListener('click', handler)
  }, [dropdownOpen])

  const navBg = scrolled
    ? isDark
      ? 'bg-surface-900/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/30'
      : 'bg-white/95 backdrop-blur-2xl border-b border-gray-200 shadow-md'
    : 'bg-transparent'

  const linkCls = isDark
    ? 'text-white/55 hover:text-white hover:bg-white/6'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'

  const modeLabel = mode === 'playlist' ? 'Playlist Download' : mode === 'single' ? 'Single Video' : mode === 'audio' ? 'MP3 Audio' : 'Social Media'
  const ModeIcon  = mode === 'playlist' ? PlaylistIcon : mode === 'single' ? SingleIcon : mode === 'audio'
    ? () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-7.5 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/></svg>
    : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/></svg>

  const handleModeSelect = (m) => {
    onModeChange(m)
    setDropdownOpen(false)
    setOpen(false)
    setTimeout(() => {
      const sectionId = m === 'playlist' ? 'playlist-section' : m === 'single' ? 'single-section' : 'social-section'
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group select-none">
            <LogoMark />
            <span className="font-display font-bold text-[17px] tracking-tight text-gradient">
              AVI Downloader
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${linkCls}`}>
                {l.label}
              </a>
            ))}

            {/* ── Download Mode Dropdown ── */}
            <div className="relative ml-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  isDark
                    ? 'bg-brand-500/12 border-brand-500/30 text-brand-300 hover:bg-brand-500/22 hover:text-brand-200'
                    : 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100'
                }`}
              >
                <ModeIcon />
                {modeLabel}
                <span className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                  <ChevronIcon />
                </span>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden animate-fade-in ${
                  isDark ? 'bg-surface-800 border-white/8 shadow-black/40' : 'bg-white border-gray-200 shadow-gray-200/60'
                }`}>
                  {/* Header label */}
                  <div className={`px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    Choose Mode
                  </div>

                  {/* Playlist option */}
                  <button
                    onClick={() => handleModeSelect('playlist')}
                    className={`w-full flex items-start gap-3 px-4 py-3 transition-all duration-150 ${
                      mode === 'playlist'
                        ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700'
                        : isDark ? 'text-white/75 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mode === 'playlist'
                        ? 'bg-brand-500/25 text-brand-400'
                        : isDark ? 'bg-white/6 text-white/40' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <PlaylistIcon />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold leading-tight">Playlist Download</div>
                      <div className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                        Fetch & download entire playlists
                      </div>
                    </div>
                    {mode === 'playlist' && (
                      <svg className="w-4 h-4 ml-auto mt-1 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                      </svg>
                    )}
                  </button>

                  {/* Divider */}
                  <div className={`mx-4 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>

                  {/* Single Video option */}
                  <button
                    onClick={() => handleModeSelect('single')}
                    className={`w-full flex items-start gap-3 px-4 py-3 mb-1 transition-all duration-150 ${
                      mode === 'single'
                        ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700'
                        : isDark ? 'text-white/75 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mode === 'single' ? 'bg-brand-500/25 text-brand-400' : isDark ? 'bg-white/6 text-white/40' : 'bg-gray-100 text-gray-500'
                    }`}><SingleIcon /></div>
                    <div className="text-left">
                      <div className="text-sm font-semibold leading-tight">Single Video</div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>Download any YouTube video link</div>
                    </div>
                    {mode === 'single' && <svg className="w-4 h-4 ml-auto mt-1 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}
                  </button>

                  {/* Divider */}
                  <div className={`mx-4 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>

                  {/* Social Media option */}
                  <button
                    onClick={() => handleModeSelect('social')}
                    className={`w-full flex items-start gap-3 px-4 py-3 mb-1 transition-all duration-150 ${
                      mode === 'social'
                        ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700'
                        : isDark ? 'text-white/75 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mode === 'social' ? 'bg-brand-500/25 text-brand-400' : isDark ? 'bg-white/6 text-white/40' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/></svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold leading-tight">Social Media</div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>FB · Instagram · TikTok · Twitter & more</div>
                    </div>
                    {mode === 'social' && <svg className="w-4 h-4 ml-auto mt-1 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}
                  </button>

                  {/* Divider */}
                  <div className={`mx-4 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>

                  {/* MP3 Audio option */}
                  <button
                    onClick={() => handleModeSelect('audio')}
                    className={`w-full flex items-start gap-3 px-4 py-3 mb-1 transition-all duration-150 ${
                      mode === 'audio'
                        ? isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700'
                        : isDark ? 'text-white/75 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mode === 'audio' ? 'bg-purple-500/25 text-purple-400' : isDark ? 'bg-white/6 text-white/40' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-7.5 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/></svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold leading-tight">MP3 Audio</div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>Download video or playlist as MP3</div>
                    </div>
                    {mode === 'audio' && <svg className="w-4 h-4 ml-auto mt-1 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}
                  </button>
                </div>
              )}
            </div>

            <a href="https://github.com/mravnish" target="_blank" rel="noopener noreferrer"
              className={`ml-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${linkCls}`}>
              <GHIcon /> GitHub
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className={`p-2.5 rounded-xl transition-all duration-150 ${isDark ? 'text-white/45 hover:text-white hover:bg-white/7' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth — desktop */}
            {user ? (
              <div className="relative hidden md:block" onClick={e => e.stopPropagation()}>
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all ${isDark ? 'hover:bg-white/7' : 'hover:bg-gray-100'}`}>
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/75' : 'text-gray-700'}`}>{user.name}</span>
                  <ChevronIcon />
                </button>
                {userMenuOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border shadow-2xl overflow-hidden animate-fade-in ${isDark ? 'bg-surface-800 border-white/8' : 'bg-white border-gray-200'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-white/6' : 'border-gray-100'}`}>
                      <p className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-gray-900'}`}>{user.name}</p>
                      <p className={`text-[10px] truncate ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{user.email}</p>
                    </div>
                    <a href="#profile" onClick={() => setUserMenuOpen(false)}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${isDark ? 'text-white/65 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                      My Profile
                    </a>
                    {user.role === 'admin' && (
                      <a href="#admin" onClick={() => setUserMenuOpen(false)}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"/></svg>
                        Admin Dashboard
                      </a>
                    )}
                    <div className={`mx-3 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>
                    <button onClick={() => { logout(); setUserMenuOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="#auth" className="hidden md:flex btn-primary py-2 px-4 text-xs">
                Sign In
              </a>
            )}

            <button onClick={() => setOpen(o => !o)}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-150 ${isDark ? 'text-white/55 hover:bg-white/7' : 'text-gray-600 hover:bg-gray-100'}`}>
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-[28rem]' : 'max-h-0'}`}>
        <div className={`border-t px-4 py-3 space-y-1 ${isDark ? 'bg-surface-900 border-white/5' : 'bg-white border-gray-100'}`}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
              {l.label}
            </a>
          ))}

          {/* Mobile mode separator */}
          <div className={`mx-1 my-2 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>
          <p className={`px-4 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/28' : 'text-gray-400'}`}>Download Mode</p>

          <button onClick={() => handleModeSelect('playlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'playlist' ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700' : linkCls}`}>
            <PlaylistIcon/>Playlist Download
            {mode === 'playlist' && <span className="ml-auto text-brand-400">✓</span>}
          </button>

          <button onClick={() => handleModeSelect('single')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'single' ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700' : linkCls}`}>
            <SingleIcon/>Single Video
            {mode === 'single' && <span className="ml-auto text-brand-400">✓</span>}
          </button>

          <button onClick={() => handleModeSelect('social')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'social' ? isDark ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700' : linkCls}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253"/></svg>
            Social Media
            {mode === 'social' && <span className="ml-auto text-brand-400">✓</span>}
          </button>

          <button onClick={() => handleModeSelect('audio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'audio' ? isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700' : linkCls}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-7.5 6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/></svg>
            MP3 Audio
            {mode === 'audio' && <span className="ml-auto text-purple-400">✓</span>}
          </button>

          <a href="https://github.com/mravnish" target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${linkCls}`}>
            <GHIcon /> GitHub
          </a>

          {/* Mobile auth */}
          <div className={`mx-1 my-2 border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>
          {user ? (
            <>
              <div className={`flex items-center gap-3 px-4 py-2`}>
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white/85' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-[11px] ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{user.email}</p>
                </div>
              </div>
              <a href="#profile" onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-white/65 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                My Profile
              </a>
              {user.role === 'admin' && (
                <a href="#admin" onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"/></svg>
                  Admin Dashboard
                </a>
              )}
              <button onClick={() => { logout(); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} transition-all`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
                Sign Out
              </button>
            </>
          ) : (
            <a href="#auth" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 mx-4 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white">
              Sign In / Register
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}

function LogoMark() {
  return (
    <img
      src="/favicon.png"
      alt="CDA01 Logo"
      className="w-10 h-10 rounded-full object-cover"
    />

    // <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    //   <rect width="32" height="32" rx="9" fill="url(#lg1)"/>
    //   <path d="M10 21.5L16 10.5L22 21.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    //   <path d="M12.4 18.5h7.2" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
    //   <circle cx="24.5" cy="21.5" r="2.2" fill="rgba(255,255,255,0.65)"/>
    //   <defs>
    //     <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32">
    //       <stop offset="0%" stopColor="#14b897"/>
    //       <stop offset="100%" stopColor="#0d6e5c"/>
    //     </linearGradient>
    //   </defs>
    // </svg>
  )
}
