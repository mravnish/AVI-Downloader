import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── Shared page shell ── */
function PageShell({ title, subtitle, icon, children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,151,0.07) 0%, transparent 70%)' }}/>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Back button */}
        <a href="#home"
          className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${isDark ? 'text-white/35 hover:text-brand-400' : 'text-gray-400 hover:text-brand-600'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
          </svg>
          Back to Home
        </a>

        {/* Hero header */}
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-400 mb-5 text-2xl">
            {icon}
          </div>
          <h1 className={`font-display font-extrabold text-4xl mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          <p className={`text-lg ${isDark ? 'text-white/45' : 'text-gray-500'}`}>{subtitle}</p>
        </div>

        {/* Divider */}
        <div className={`border-t mb-10 ${isDark ? 'border-white/6' : 'border-gray-200'}`}/>

        {children}
      </div>
    </div>
  )
}

/* ── Shared section heading ── */
function SectionH({ children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return <h2 className={`font-display font-bold text-xl mt-10 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{children}</h2>
}

/* ── Shared paragraph ── */
function P({ children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-white/55' : 'text-gray-600'}`}>{children}</p>
}

/* ── Card wrapper ── */
function Card({ children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className={`rounded-2xl border p-6 mb-4 ${isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'}`}>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════
   DOCUMENTATION
══════════════════════════════════════ */
export function DocumentationPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const codeClass = `block w-full rounded-xl px-4 py-3 text-xs font-mono mt-2 mb-4 overflow-x-auto ${isDark ? 'bg-surface-900 text-brand-300 border border-white/6' : 'bg-gray-900 text-green-400 border border-gray-700'}`

  return (
    <PageShell
      title="Documentation"
      subtitle="Everything you need to know about using AVI Downloader."
      icon="📖"
    >
      <SectionH>Getting Started</SectionH>
      <P>AVI Downloader lets you download YouTube videos and playlists in any quality — no account, no login, completely free.</P>

      <Card>
        <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Playlist Download</p>
        <P>Paste a YouTube playlist URL (e.g. <code className="text-brand-400 font-mono text-xs">https://youtube.com/playlist?list=...</code>) into the input field, click <strong>Fetch Playlist</strong>, select your videos, choose a quality, and hit Download.</P>
        <p className={`font-semibold text-sm mb-1 mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. Single Video Download</p>
        <P>Switch to <strong>Single Video</strong> mode in the navbar or hero tabs. Paste any YouTube watch URL (e.g. <code className="text-brand-400 font-mono text-xs">https://youtube.com/watch?v=...</code>), click <strong>Get Video</strong>, pick your quality, and download.</P>
      </Card>

      <SectionH>Supported Quality Levels</SectionH>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {['360p','480p','720p','1080p','2K','4K'].map(q => (
          <div key={q} className={`rounded-xl border px-4 py-3 text-center ${isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'}`}>
            <span className="font-display font-bold text-lg text-gradient">{q}</span>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
              {q==='360p'?'SD Basic':q==='480p'?'SD Standard':q==='720p'?'HD Ready':q==='1080p'?'Full HD':q==='2K'?'QHD':'Ultra HD'}
            </p>
          </div>
        ))}
      </div>

      <SectionH>API Endpoints</SectionH>
      <P>The backend exposes these REST endpoints:</P>
      <Card>
        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>POST /api/playlist/fetch</p>
        <P>Fetches all videos from a YouTube playlist URL. Body: <code className="text-brand-400 font-mono text-xs">{"{ url: string }"}</code></P>
        <code className={codeClass}>{'{ "url": "https://youtube.com/playlist?list=..." }'}</code>
        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>GET /api/download/info</p>
        <P>Fetches video metadata and available formats. Params: <code className="text-brand-400 font-mono text-xs">?videoId=xxxx</code></P>
        <p className={`font-semibold text-sm mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>GET /api/download/video</p>
        <P>Streams the video file. Params: <code className="text-brand-400 font-mono text-xs">?videoId=xxxx&quality=720p&title=...</code></P>
      </Card>

      <SectionH>Self-Hosting</SectionH>
      <P>Clone the repository and run:</P>
      <code className={codeClass}>
        {`git clone https://github.com/your-repo/avi-downloader\ncd avi-downloader\nnpm install\nnpm run dev`}
      </code>
      <P>Make sure <strong>yt-dlp</strong> and <strong>ffmpeg</strong> are installed and available in your PATH.</P>
    </PageShell>
  )
}

/* ══════════════════════════════════════
   FAQ
══════════════════════════════════════ */
const FAQS = [
  { q: 'Is AVI Downloader free to use?',               a: 'Yes, completely free. No account, no subscription, no hidden charges. It\'s open source and always will be.' },
  { q: 'What video qualities are supported?',          a: 'We support 360p, 480p, 720p, 1080p, 2K, and 4K UHD — depending on what the source video offers on YouTube.' },
  { q: 'Can I download private or age-restricted videos?', a: 'No. AVI Downloader can only access publicly available YouTube content. Private and age-restricted videos require authentication that we don\'t support.' },
  { q: 'How many videos can I download at once?',      a: 'There is no hard limit. You can select and bulk-download an entire playlist. Downloads are staggered to avoid browser blocking.' },
  { q: 'What formats are the videos saved in?',        a: 'Videos are downloaded as MP4 files using yt-dlp\'s best mux format for the selected quality.' },
  { q: 'Why is my thumbnail not showing?',             a: 'Thumbnails are loaded directly from YouTube\'s CDN. If blocked, the card falls back gracefully. Try refreshing the page.' },
  { q: 'Does it work on mobile?',                      a: 'The UI is fully responsive. However, bulk downloads work best on desktop browsers due to how they handle multiple file downloads.' },
  { q: 'Is my data stored or logged?',                 a: 'No. We do not store URLs, video IDs, or any personal data. All requests are processed server-side and discarded immediately after streaming.' },
  { q: 'Why does my download say "Starting…" for a while?', a: 'yt-dlp fetches and muxes the stream on the fly. For high-quality (1080p+) videos this can take a few seconds before the file starts downloading.' },
  { q: 'Can I use this commercially?',                 a: 'AVI Downloader is released under the MIT License. You can use, modify, and distribute it freely, including for commercial purposes.' },
]

export function FAQPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(null)

  return (
    <PageShell title="FAQ" subtitle="Frequently asked questions about AVI Downloader." icon="💬">
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <div key={i}
            className={`rounded-2xl border overflow-hidden transition-all duration-200 ${isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'}`}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className={`text-sm font-semibold ${isDark ? 'text-white/85' : 'text-gray-900'}`}>{item.q}</span>
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-brand-400 ${open === i ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>
            {open === i && (
              <div className={`px-5 pb-4 text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  )
}

/* ══════════════════════════════════════
   CONTACT
══════════════════════════════════════ */
export function ContactPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const inputCls = `w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-200 ${
    isDark
      ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 shadow-sm'
  }`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/submissions/contact', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(form),
      })
      // Safely parse JSON — handle empty or non-JSON responses
      let data = {}
      try { data = await res.json() } catch { data = { success: false, error: `Server error (${res.status}). Please try again.` } }
      if (!data.success) throw new Error(data.error || 'Submission failed. Please try again.')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const CHANNELS = [
    { icon: '🐛', title: 'Bug Reports',     desc: 'Found a bug? Open an issue on GitHub.',               link: 'https://github.com/mravnish', label: 'Open Issue' },
    { icon: '💡', title: 'Feature Request', desc: 'Have an idea? Start a GitHub discussion.',             link: 'https://github.com/mravnish', label: 'Discuss'    },
    { icon: '📧', title: 'Email',           desc: 'Need help? Reach our support team directly.: avikumar7630@gmail.com',          link: 'https://mail.google.com/mail/?view=cm&fs=1&to=avikumar7630@gmail.com&su=AVI%20Downloader%20Support&body=Hello%20AVI%20Team,%0A%0AI%20need%20assistance%20with:%0A%0A', label: 'Send Email' },
  ]

  return (
    <PageShell title="Contact" subtitle="Get in touch with the AVI Downloader team." icon="✉️">

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {CHANNELS.map(c => (
          <Card key={c.title}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.title}</p>
            <p className={`text-xs mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{c.desc}</p>
            <a href={c.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              {c.label} →
            </a>
          </Card>
        ))}
      </div>

      <SectionH>Send a Message</SectionH>
      {sent ? (
        <div className="rounded-2xl border p-8 text-center bg-brand-500/8 border-brand-500/25">
          <div className="text-4xl mb-3">✅</div>
          <p className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Message Sent!</p>
          <p className={`text-sm ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Thanks for reaching out. We'll get back to you within 48 hours.</p>
          <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }) }}
            className="mt-5 btn-ghost text-xs">Send Another</button>
        </div>
      ) : (
        <Card>
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" className={inputCls}/>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@email.com" className={inputCls}/>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Subject</label>
              <input required value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="What's this about?" className={inputCls}/>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Tell us more…" className={`${inputCls} resize-none`}/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </Card>
      )}
    </PageShell>
  )
}

/* ══════════════════════════════════════
   BUG REPORT
══════════════════════════════════════ */
export function BugReportPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [form, setForm] = useState({ name:'', email:'', title:'', type:'bug', steps:'', expected:'', actual:'', version:'' })

  const inputCls = `w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-200 ${
    isDark
      ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 shadow-sm'
  }`
  const selectCls = `w-full px-4 py-3 rounded-xl text-sm border cursor-pointer focus:outline-none transition-all ${
    isDark ? 'bg-surface-700 border-white/8 text-white focus:border-brand-500/50' : 'bg-white border-gray-200 text-gray-900 focus:border-brand-400 shadow-sm'
  }`

  const TYPES = ['bug','ui-issue','performance','feature-request','other']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/submissions/bug', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(form),
      })
      let data = {}
      try { data = await res.json() } catch { data = { success: false, error: `Server error (${res.status}). Please try again.` } }
      if (!data.success) throw new Error(data.error || 'Submission failed. Please try again.')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Bug Report" subtitle="Help us improve by reporting issues you find." icon="🐛">

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20 text-amber-400 mb-8">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
        <p className="text-sm">For faster resolution, you can also <a href="https://github.com/mravnish" target="_blank" rel="noopener noreferrer" className="underline font-semibold">open a GitHub issue</a> directly with screenshots and logs.</p>
      </div>

      {sent ? (
        <div className="rounded-2xl border p-8 text-center bg-brand-500/8 border-brand-500/25">
          <div className="text-4xl mb-3">🎉</div>
          <p className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Bug Report Submitted!</p>
          <p className={`text-sm ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Thank you for helping make AVI Downloader better. We'll investigate and update you.</p>
          <button onClick={() => { setSent(false); setForm({ name:'', email:'', title:'', type:'bug', steps:'', expected:'', actual:'', version:'' }) }}
            className="mt-5 btn-ghost text-xs">Report Another</button>
        </div>
      ) : (
        <Card>
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Your Name</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Optional" className={inputCls}/>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Your Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Optional — for follow-up" className={inputCls}/>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Issue Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Short description of the issue" className={inputCls}/>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Issue Type</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={selectCls}>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>App Version / Browser</label>
                <input value={form.version} onChange={e => setForm(f => ({...f, version: e.target.value}))} placeholder="e.g. Chrome 124, Firefox 126" className={inputCls}/>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Steps to Reproduce</label>
              <textarea required rows={4} value={form.steps} onChange={e => setForm(f => ({...f, steps: e.target.value}))} placeholder="1. Go to...\n2. Click...\n3. See error" className={`${inputCls} resize-none`}/>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Expected Behaviour</label>
                <textarea rows={3} value={form.expected} onChange={e => setForm(f => ({...f, expected: e.target.value}))} placeholder="What should happen?" className={`${inputCls} resize-none`}/>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Actual Behaviour</label>
                <textarea rows={3} value={form.actual} onChange={e => setForm(f => ({...f, actual: e.target.value}))} placeholder="What actually happens?" className={`${inputCls} resize-none`}/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Submitting…' : 'Submit Bug Report'}
            </button>
          </form>
        </Card>
      )}
    </PageShell>
  )
}

/* ══════════════════════════════════════
   PRIVACY POLICY
══════════════════════════════════════ */
export function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Last updated: May 2026" icon="🔒">
      <SectionH>Overview</SectionH>
      <P>AVI Downloader is a free, open-source tool. We take your privacy seriously. This policy explains what data (if any) is collected when you use this application.</P>

      <SectionH>Data We Do Not Collect</SectionH>
      <Card>
        {['Personal information (name, email, phone)','Account credentials or login data','YouTube URLs or video IDs you submit','Download history or preferences','IP addresses or location data','Cookies or tracking identifiers'].map(item => (
          <div key={item} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
            <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
            <span className="text-sm" style={{ color: 'inherit' }}>{item}</span>
          </div>
        ))}
      </Card>

      <SectionH>How the App Works</SectionH>
      <P>When you submit a YouTube URL, it is sent to our backend server solely to fetch video metadata and stream the file back to your browser. The URL is never stored, logged, or shared. Once the stream is complete, no trace of the request remains on our servers.</P>

      <SectionH>Third-Party Services</SectionH>
      <P>AVI Downloader uses <strong>yt-dlp</strong> under the hood to interact with YouTube. Your requests go through our server before reaching YouTube's CDN. We do not share your data with any analytics or advertising services.</P>

      <SectionH>Self-Hosted Instances</SectionH>
      <P>If you run your own instance of AVI Downloader, this privacy policy applies only to the official hosted version. Your own deployment's privacy practices depend entirely on your configuration.</P>

      <SectionH>Changes to This Policy</SectionH>
      <P>We may update this policy occasionally. Changes will be reflected with an updated date at the top of this page. Continued use of the app constitutes acceptance of the updated policy.</P>

      <SectionH>Contact</SectionH>
      <P>Questions about privacy? <a href="#contact" className="text-brand-400 hover:text-brand-300 transition-colors">Contact us</a> or open an issue on GitHub.</P>
    </PageShell>
  )
}

/* ══════════════════════════════════════
   TERMS OF SERVICE
══════════════════════════════════════ */
export function TermsPage() {
  return (
    <PageShell title="Terms of Service" subtitle="Last updated: May 2026" icon="📋">
      <SectionH>Acceptance of Terms</SectionH>
      <P>By using AVI Downloader, you agree to these terms. If you do not agree, please do not use this application.</P>

      <SectionH>Permitted Use</SectionH>
      <P>AVI Downloader is intended for downloading YouTube content that you have the right to download — including your own videos, Creative Commons licensed content, or content where the creator has given explicit permission for download.</P>

      <SectionH>Prohibited Use</SectionH>
      <Card>
        {[
          'Downloading copyrighted content without permission from the rights holder',
          'Using the tool for commercial redistribution of downloaded content',
          'Attempting to bypass YouTube\'s rate limiting or DRM systems',
          'Using the tool in any way that violates YouTube\'s Terms of Service',
          'Automating bulk downloads in a way that burdens the service infrastructure',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </Card>

      <SectionH>Disclaimer of Warranty</SectionH>
      <P>AVI Downloader is provided "as is" without warranty of any kind. We make no guarantees about uptime, download success rates, or video quality availability. YouTube may change its platform at any time in ways that affect functionality.</P>

      <SectionH>Limitation of Liability</SectionH>
      <P>The authors and contributors of AVI Downloader shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this software.</P>

      <SectionH>Open Source License</SectionH>
      <P>AVI Downloader is released under the MIT License. You are free to use, copy, modify, and distribute this software in accordance with the license terms. See the <a href="#open-source" className="text-brand-400 hover:text-brand-300 transition-colors">Open Source</a> page for full license text.</P>

      <SectionH>Changes to Terms</SectionH>
      <P>We reserve the right to modify these terms at any time. Your continued use of the application after changes are posted constitutes acceptance of the revised terms.</P>
    </PageShell>
  )
}

/* ══════════════════════════════════════
   OPEN SOURCE
══════════════════════════════════════ */
const DEPS = [
  { name: 'React',        version: '18.x', license: 'MIT',   desc: 'UI framework'              },
  { name: 'Vite',         version: '5.x',  license: 'MIT',   desc: 'Build tool & dev server'   },
  { name: 'Tailwind CSS', version: '3.x',  license: 'MIT',   desc: 'Utility-first CSS'         },
  { name: 'Axios',        version: '1.x',  license: 'MIT',   desc: 'HTTP client'               },
  { name: 'yt-dlp',       version: 'latest',license: 'Unlicense', desc: 'YouTube download engine' },
  { name: 'Node.js',      version: '20+',  license: 'MIT',   desc: 'Backend runtime'           },
  { name: 'Express',      version: '4.x',  license: 'MIT',   desc: 'HTTP server framework'     },
]

export function OpenSourcePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <PageShell title="Open Source" subtitle="AVI Downloader is free and open source software." icon="⚡">

      {/* MIT License card */}
      <div className="rounded-2xl border p-6 mb-8 bg-brand-500/8 border-brand-500/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📜</span>
          <p className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>MIT License</p>
        </div>
        <pre className={`text-xs leading-relaxed font-mono whitespace-pre-wrap ${isDark ? 'text-white/45' : 'text-gray-500'}`}>{`Copyright (c) 2026 Mr. Avnish — AVI Downloader

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`}</pre>
      </div>

      <SectionH>Source Code</SectionH>
      <P>The full source code is available on GitHub. Contributions, forks, and pull requests are welcome.</P>
      <a href="https://github.com/mravnish" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 btn-primary mb-8">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
        View on GitHub
      </a>

      <SectionH>Dependencies</SectionH>
      <P>AVI Downloader is built on these open source projects:</P>
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/6' : 'border-gray-200 shadow-sm'}`}>
        {DEPS.map((d, i) => (
          <div key={d.name} className={`flex items-center justify-between px-5 py-3.5 ${i < DEPS.length-1 ? isDark ? 'border-b border-white/5' : 'border-b border-gray-100' : ''} ${isDark ? 'bg-surface-800' : 'bg-white'}`}>
            <div>
              <span className={`font-semibold text-sm ${isDark ? 'text-white/85' : 'text-gray-900'}`}>{d.name}</span>
              <span className={`ml-2 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{d.version}</span>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{d.desc}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isDark ? 'bg-brand-500/12 border-brand-500/25 text-brand-300' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
              {d.license}
            </span>
          </div>
        ))}
      </div>

      <SectionH>Contributing</SectionH>
      <P>We welcome contributions of all kinds — bug fixes, features, documentation, translations. Please read the CONTRIBUTING.md on GitHub before submitting a pull request.</P>
    </PageShell>
  )
}
