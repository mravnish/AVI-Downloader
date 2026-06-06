import { useTheme } from '../context/ThemeContext'

/* ── Social Icons ── */
const GHIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>

const LinkedInIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>

const InstagramIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>

const YouTubeIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>

const TwitterIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>

const SOCIAL_LINKS = [
  { icon: <GHIcon/>,        href: 'https://github.com/mravnish',                      label: 'GitHub',    color: isDark => isDark ? 'hover:text-white hover:bg-white/8'           : 'hover:text-gray-900 hover:bg-gray-100'    },
  { icon: <LinkedInIcon/>,  href: 'https://www.linkedin.com/in/avnish-kumar-9118bb255/',                 label: 'LinkedIn',  color: isDark => isDark ? 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10'  : 'hover:text-[#0A66C2] hover:bg-blue-50'   },
  { icon: <InstagramIcon/>, href: 'https://www.instagram.com/coding_ascii_01',                   label: 'Instagram', color: isDark => isDark ? 'hover:text-[#E1306C] hover:bg-[#E1306C]/10'  : 'hover:text-[#E1306C] hover:bg-pink-50'   },
  { icon: <YouTubeIcon/>,   href: 'https://www.youtube.com/@coding_ascii_01',                    label: 'YouTube',   color: isDark => isDark ? 'hover:text-[#FF0000] hover:bg-[#FF0000]/10'  : 'hover:text-[#FF0000] hover:bg-red-50'    },
  { icon: <TwitterIcon/>,   href: 'https://x.com/VshAvnish',                           label: 'Twitter/X', color: isDark => isDark ? 'hover:text-white hover:bg-white/8'           : 'hover:text-gray-900 hover:bg-gray-100'   },
]

const COLS = [
  {
    cat: 'Product',
    links: [
      { label: 'Home',         href: '#home'         },
      { label: 'Features',     href: '#features'     },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Download',     href: '#home'         },
    ],
  },
  {
    cat: 'Support',
    links: [
      { label: 'Documentation', href: '#documentation'              },
      { label: 'FAQ',           href: '#faq'                        },
      { label: 'Contact',       href: '#contact'                    },
      { label: 'Bug Report',    href: '#bug-report', highlight: true },
    ],
  },
  {
    cat: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '#privacy'     },
      { label: 'Terms of Service', href: '#terms'       },
      { label: 'Open Source',      href: '#open-source' },
    ],
  },
]

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <footer className={`border-t ${isDark ? 'bg-surface-950 border-white/5' : 'bg-white border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
      src="/favicon.png"
      alt="CDA01 Logo"
      className="w-10 h-10 rounded-full object-cover"
    />

              {/* <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="9" fill="url(#fLogo)"/>
                <path d="M10 21.5L16 10.5L22 21.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.4 18.5h7.2" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
                <defs><linearGradient id="fLogo" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#14b897"/><stop offset="1" stopColor="#0d6e5c"/></linearGradient></defs>
              </svg> */}
              <span className="font-display font-bold text-[15px] text-gradient">AVI Downloader</span>
            </div>
            <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-white/38' : 'text-gray-400'}`}>
              The easiest way to download YouTube videos, playlists and social media content. Free, open source, no account needed.
            </p>

            {/* GitHub link */}
            <a href="https://github.com/mravnish" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors mb-5">
              <GHIcon/>View on GitHub
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-1.5 mt-4">
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isDark ? 'text-white/30 bg-white/4 border border-white/6' : 'text-gray-400 bg-gray-50 border border-gray-200'}
                    ${s.color(isDark)} hover:scale-110 active:scale-95`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(({ cat, links }) => (
            <div key={cat}>
              <h4 className={`font-display font-semibold text-sm mb-4 ${isDark ? 'text-white/65' : 'text-gray-700'}`}>{cat}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href}
                      className={`text-sm transition-colors duration-150 ${
                        l.highlight
                          ? 'text-brand-400 hover:text-brand-300 font-medium'
                          : isDark
                            ? 'text-white/32 hover:text-brand-400'
                            : 'text-gray-400 hover:text-brand-600'
                      }`}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <p className={`text-xs ${isDark ? 'text-white/22' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} AVI Downloader by <span className="text-brand-400 font-medium">Mr. Avnish</span>. All rights reserved.
          </p>

          {/* Bottom social row */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                title={s.label}
                className={`transition-colors duration-150 text-xs ${isDark ? 'text-white/22 hover:text-brand-400' : 'text-gray-400 hover:text-brand-600'}`}>
                {s.label}
              </a>
            ))}
          </div>

          <p className={`text-xs ${isDark ? 'text-white/22' : 'text-gray-400'}`}>
            Built with React + Node.js + yt-dlp · MIT License
          </p>
        </div>
      </div>
    </footer>
  )
}
