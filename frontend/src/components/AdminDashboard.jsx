import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const API = '/api/admin'

/* ── API helper ── */
async function adminFetch(path, token, options = {}) {
  const res  = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  })
  return res.json()
}

/* ── Icons ── */
const Icons = {
  Users    : () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z"/></svg>,
  Download : () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>,
  Playlist : () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75z"/></svg>,
  Video    : () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"/></svg>,
  Star     : () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"/></svg>,
  Trash    : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>,
  Shield   : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
  Refresh  : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>,
  Clock    : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>,
  Home     : () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>,
  Spin     : () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Lock     : () => <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"/></svg>,
}

/* ── Stat card ── */
function StatCard({ icon, label, value, sub, color, isDark }) {
  const colors = {
    green : isDark ? 'bg-brand-500/12 border-brand-500/25 text-brand-400'  : 'bg-brand-50 border-brand-200 text-brand-700',
    blue  : isDark ? 'bg-blue-500/12 border-blue-500/25 text-blue-400'    : 'bg-blue-50 border-blue-200 text-blue-700',
    purple: isDark ? 'bg-purple-500/12 border-purple-500/25 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700',
    amber : isDark ? 'bg-amber-500/12 border-amber-500/25 text-amber-400'  : 'bg-amber-50 border-amber-200 text-amber-700',
  }
  const surface = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  return (
    <div className={`rounded-2xl border p-5 ${surface}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colors[color] || colors.green}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-display font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-white/55' : 'text-gray-600'}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

/* ── Mini bar chart (pure SVG, no library needed) ── */
function BarChart({ data, isDark }) {
  const max = Math.max(...data.map(d => d.total), 1)
  const W   = 480
  const H   = 120
  const barW = Math.floor((W - data.length * 4) / data.length)

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const x       = i * (barW + 4)
        const totalH  = Math.max((d.total   / max) * H, 2)
        const playH   = Math.max((d.playlist/ max) * H, 0)
        const singleH = Math.max((d.single  / max) * H, 0)

        return (
          <g key={d.date}>
            {/* Background bar */}
            <rect x={x} y={0} width={barW} height={H} rx="4"
              fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}/>
            {/* Playlist portion */}
            {playH > 0 && (
              <rect x={x} y={H - totalH} width={barW} height={playH} rx="4"
                fill="rgba(20,184,151,0.5)"/>
            )}
            {/* Single portion */}
            {singleH > 0 && (
              <rect x={x} y={H - singleH} width={barW} height={singleH} rx="4"
                fill="rgba(20,184,151,0.9)"/>
            )}
            {/* Total bar glow */}
            <rect x={x} y={H - totalH} width={barW} height={Math.min(totalH, 3)} rx="2"
              fill="#14b897" opacity="0.9"/>
            {/* Date label */}
            <text x={x + barW / 2} y={H + 16} textAnchor="middle"
              fontSize="9" fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'}>
              {d.label}
            </text>
            {/* Count on top */}
            {d.total > 0 && (
              <text x={x + barW / 2} y={H - totalH - 4} textAnchor="middle"
                fontSize="9" fontWeight="bold" fill={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}>
                {d.total}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Donut chart ── */
function DonutChart({ playlist, single, isDark }) {
  const total = playlist + single || 1
  const pPct  = (playlist / total) * 100
  const sPct  = (single   / total) * 100
  const r     = 40
  const circ  = 2 * Math.PI * r
  const pDash = (pPct / 100) * circ
  const sDash = (sPct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 100" className="w-28 h-28">
        {/* Background */}
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="14"
          stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}/>
        {/* Playlist arc */}
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="14"
          stroke="rgba(20,184,151,0.4)"
          strokeDasharray={`${pDash} ${circ - pDash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"/>
        {/* Single arc */}
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="14"
          stroke="#14b897"
          strokeDasharray={`${sDash} ${circ - sDash}`}
          strokeDashoffset={circ / 4 - pDash}
          strokeLinecap="round"/>
        <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="800"
          fill={isDark ? 'white' : '#0d1117'}>{total}</text>
        <text x="50" y="58" textAnchor="middle" fontSize="7"
          fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}>total</text>
      </svg>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500/40"/>
          <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Playlist ({playlist})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500"/>
          <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Single ({single})</span>
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function AdminDashboard() {
  const { theme }       = useTheme()
  const { user, token } = useAuth()
  const { toast }       = useToast()
  const isDark          = theme === 'dark'

  const [tab,          setTab]          = useState('overview')  // overview | users | submissions
  const [stats,        setStats]        = useState(null)
  const [users,        setUsers]        = useState([])
  const [submissions,  setSubmissions]  = useState([])
  const [subCounts,    setSubCounts]    = useState(null)
  const [subFilter,    setSubFilter]    = useState('all')
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingSubs,  setLoadingSubs]  = useState(false)
  const [search,       setSearch]       = useState('')
  const [confirmDel,   setConfirmDel]   = useState(null)
  const [lastRefresh,  setLastRefresh]  = useState(null)

  const surface   = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  const textMain  = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-500'

  /* ── Not logged in / not admin ── */
  if (!token) { window.location.hash = '#auth'; return null }
  if (!user) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <svg className="w-8 h-8 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )
  if (user.role !== 'admin') {
    return (
      <div className={`min-h-screen pt-24 flex flex-col items-center justify-center px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
        <div className={`text-white/10 mb-6`}><Icons.Lock/></div>
        <h1 className={`font-display font-extrabold text-3xl mb-2 ${textMain}`}>Access Denied</h1>
        <p className={`text-sm mb-6 ${textMuted}`}>This page is only accessible to admins.</p>
        <a href="#home" className="btn-primary px-6 py-3">Go to Home</a>
      </div>
    )
  }

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await adminFetch('/stats', token)
      if (res.success) { setStats(res.stats); setLastRefresh(new Date()) }
      else toast({ message: res.error, type: 'error' })
    } catch { toast({ message: 'Failed to load stats', type: 'error' }) }
    finally { setLoadingStats(false) }
  }, [token])

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const res = await adminFetch('/users', token)
      if (res.success) setUsers(res.users)
      else toast({ message: res.error, type: 'error' })
    } catch { toast({ message: 'Failed to load users', type: 'error' }) }
    finally { setLoadingUsers(false) }
  }, [token])

  /* ── Fetch submissions ── */
  const fetchSubmissions = useCallback(async () => {
    setLoadingSubs(true)
    try {
      const res = await fetch('/api/submissions', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { setSubmissions(data.submissions); setSubCounts(data.counts) }
      else toast({ message: data.error, type: 'error' })
    } catch { toast({ message: 'Failed to load submissions', type: 'error' }) }
    finally { setLoadingSubs(false) }
  }, [token])

  /* Load on mount and on tab change */
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { if (tab === 'users') fetchUsers() }, [tab, fetchUsers])
  useEffect(() => { if (tab === 'submissions') fetchSubmissions() }, [tab, fetchSubmissions])

  /* ── Delete user ── */
  const handleDelete = async (id) => {
    const res = await adminFetch(`/users/${id}`, token, { method: 'DELETE' })
    if (res.success) {
      setUsers(u => u.filter(x => x.id !== id))
      toast({ message: 'User deleted.', type: 'success' })
      fetchStats()
    } else toast({ message: res.error, type: 'error' })
    setConfirmDel(null)
  }

  /* ── Toggle role ── */
  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const res = await adminFetch(`/users/${id}/role`, token, {
      method: 'PATCH',
      body  : JSON.stringify({ role: newRole }),
    })
    if (res.success) {
      setUsers(u => u.map(x => x.id === id ? { ...x, role: newRole } : x))
      toast({ message: `Role changed to ${newRole}`, type: 'success' })
    } else toast({ message: res.error, type: 'error' })
  }

  /* ── Submission: update status ── */
  const handleSubStatus = async (id, status) => {
    const res = await fetch(`/api/submissions/${id}/status`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body   : JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setSubmissions(s => s.map(x => x.id === id ? { ...x, status } : x))
      setSubCounts(c => c ? ({ ...c, new: status === 'new' ? c.new + 1 : c.new - (data.submission?.status === 'new' ? 1 : 0), resolved: status === 'resolved' ? c.resolved + 1 : c.resolved }) : c)
      toast({ message: `Marked as ${status}`, type: 'success' })
    } else toast({ message: data.error, type: 'error' })
  }

  /* ── Submission: delete ── */
  const handleSubDelete = async (id) => {
    const res = await fetch(`/api/submissions/${id}`, {
      method : 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (data.success) {
      setSubmissions(s => s.filter(x => x.id !== id))
      toast({ message: 'Submission deleted.', type: 'success' })
    } else toast({ message: data.error, type: 'error' })
    setConfirmDel(null)
  }

  /* ── Filtered users ── */
  const filteredUsers = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const fmtUptime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
    return h ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className={`min-h-screen pt-20 pb-16 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,151,0.06) 0%, transparent 70%)' }}/>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pt-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a href="#home" className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark ? 'text-white/35 hover:text-brand-400' : 'text-gray-400 hover:text-brand-600'}`}>
                <Icons.Home/> Home
              </a>
              <span className={isDark ? 'text-white/15' : 'text-gray-300'}>/</span>
              <span className={`text-xs font-medium ${isDark ? 'text-brand-400' : 'text-brand-600'}`}>Admin Dashboard</span>
            </div>
            <h1 className={`font-display font-extrabold text-3xl ${textMain}`}>Dashboard</h1>
            <p className={`text-sm mt-0.5 ${textMuted}`}>
              Welcome back, {user.name} · {lastRefresh && `Updated ${lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchStats(); if (tab === 'users') fetchUsers() }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-white/8 text-white/55 hover:bg-white/5 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <Icons.Refresh/> Refresh
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={`inline-flex rounded-xl p-1 mb-7 border ${isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'}`}>
          {[
            { key: 'overview',     label: 'Overview',     icon: <Icons.Download/> },
            { key: 'users',        label: `Users${stats ? ` (${stats.totalUsers})` : ''}`, icon: <Icons.Users/> },
            { key: 'submissions',  label: `Submissions${subCounts?.new ? ` · ${subCounts.new} new` : subCounts ? ` (${subCounts.total})` : ''}`, icon: <Icons.Star/> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : isDark ? 'text-white/45 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {tab === 'overview' && (
          <>
            {loadingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`rounded-2xl border p-5 ${surface}`}>
                    <div className="shimmer h-11 w-11 rounded-xl mb-4"/>
                    <div className="shimmer h-8 w-20 rounded mb-1"/>
                    <div className="shimmer h-4 w-28 rounded"/>
                  </div>
                ))}
              </div>
            ) : stats && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={<Icons.Users/>}    color="green"  isDark={isDark}
                    label="Total Users"     value={stats.totalUsers}
                    sub={`+${stats.newUsersLast7} this week`}/>
                  <StatCard icon={<Icons.Download/>} color="blue"   isDark={isDark}
                    label="Total Downloads" value={stats.totalDownloads}
                    sub="All time"/>
                  <StatCard icon={<Icons.Playlist/>} color="purple" isDark={isDark}
                    label="Playlist DLs"   value={stats.playlistDownloads}
                    sub="Bulk downloads"/>
                  <StatCard icon={<Icons.Video/>}    color="amber"  isDark={isDark}
                    label="Single DLs"     value={stats.singleDownloads}
                    sub="Individual videos"/>
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-3 gap-5 mb-5">

                  {/* Bar chart — last 7 days */}
                  <div className={`lg:col-span-2 rounded-2xl border p-6 ${surface}`}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className={`font-display font-bold text-base ${textMain}`}>Downloads — Last 7 Days</h3>
                        <p className={`text-xs mt-0.5 ${textMuted}`}>Playlist vs Single video</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-500/40"/>
                          <span className={textMuted}>Playlist</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-500"/>
                          <span className={textMuted}>Single</span>
                        </span>
                      </div>
                    </div>
                    {stats.last7Days.every(d => d.total === 0) ? (
                      <div className={`text-center py-10 ${textMuted} text-sm`}>No downloads yet this week</div>
                    ) : (
                      <BarChart data={stats.last7Days} isDark={isDark}/>
                    )}
                  </div>

                  {/* Donut — type split */}
                  <div className={`rounded-2xl border p-6 flex flex-col ${surface}`}>
                    <h3 className={`font-display font-bold text-base mb-1 ${textMain}`}>Download Split</h3>
                    <p className={`text-xs mb-5 ${textMuted}`}>Playlist vs Single</p>
                    <div className="flex-1 flex items-center justify-center">
                      <DonutChart playlist={stats.playlistDownloads} single={stats.singleDownloads} isDark={isDark}/>
                    </div>
                  </div>
                </div>

                {/* Bottom info cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* Top user */}
                  <div className={`rounded-2xl border p-5 ${surface}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                        <Icons.Star/>
                      </div>
                      <h3 className={`font-semibold text-sm ${textMain}`}>Top Downloader</h3>
                    </div>
                    {stats.topUser ? (
                      <>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                            {stats.topUser.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${textMain}`}>{stats.topUser.name}</p>
                            <p className={`text-xs ${textMuted}`}>{stats.topUser.email}</p>
                          </div>
                        </div>
                        <p className={`text-xs mt-2 ${textMuted}`}>
                          <span className="text-brand-400 font-bold text-base">{stats.topUser.downloads}</span> downloads total
                        </p>
                      </>
                    ) : (
                      <p className={`text-sm ${textMuted}`}>No downloads yet</p>
                    )}
                  </div>

                  {/* New users this week */}
                  <div className={`rounded-2xl border p-5 ${surface}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-brand-500/15 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                        <Icons.Users/>
                      </div>
                      <h3 className={`font-semibold text-sm ${textMain}`}>New Users This Week</h3>
                    </div>
                    <p className={`text-4xl font-display font-extrabold text-gradient`}>{stats.newUsersLast7}</p>
                    <p className={`text-xs mt-1 ${textMuted}`}>out of {stats.totalUsers} total</p>
                  </div>

                  {/* Server uptime */}
                  <div className={`rounded-2xl border p-5 ${surface}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600'}`}>
                        <Icons.Clock/>
                      </div>
                      <h3 className={`font-semibold text-sm ${textMain}`}>Server Uptime</h3>
                    </div>
                    <p className={`text-4xl font-display font-extrabold text-gradient`}>{fmtUptime(stats.serverUptime)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                      <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Backend online</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══════════════ USERS TAB ══════════════ */}
        {tab === 'users' && (
          <>
            {/* Search bar */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/40'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 shadow-sm'
                  }`}/>
              </div>
              <button onClick={fetchUsers}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-white/8 text-white/55 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <Icons.Refresh/> Refresh
              </button>
            </div>

            {loadingUsers ? (
              <div className={`rounded-2xl border p-8 text-center ${surface}`}>
                <div className="flex justify-center mb-3"><Icons.Spin/></div>
                <p className={textMuted}>Loading users…</p>
              </div>
            ) : (
              <div className={`rounded-2xl border overflow-hidden ${surface}`}>
                {/* Table header */}
                <div className={`grid grid-cols-12 gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider border-b ${isDark ? 'text-white/28 border-white/5 bg-surface-700/40' : 'text-gray-400 border-gray-100 bg-gray-50'}`}>
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">User</div>
                  <div className="col-span-2 hidden sm:block">Joined</div>
                  <div className="col-span-2">Downloads</div>
                  <div className="col-span-1">Role</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className={`py-16 text-center ${textMuted} text-sm`}>No users found.</div>
                ) : (
                  filteredUsers.map((u, i) => (
                    <div key={u.id} className={`grid grid-cols-12 gap-3 px-5 py-4 items-center border-b last:border-0 transition-colors ${isDark ? 'border-white/4 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-gray-50/50'}`}>

                      {/* # */}
                      <div className={`col-span-1 text-xs font-mono ${textMuted}`}>{i + 1}</div>

                      {/* User */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${u.role === 'admin' ? 'bg-amber-500' : 'bg-brand-500'}`}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${textMain}`}>
                            {u.name}
                            {u.id === user.id && <span className="ml-1 text-[10px] text-brand-400">(you)</span>}
                          </p>
                          <p className={`text-xs truncate ${textMuted}`}>{u.email}</p>
                        </div>
                      </div>

                      {/* Joined */}
                      <div className={`col-span-2 hidden sm:block text-xs ${textMuted}`}>
                        {new Date(u.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>

                      {/* Downloads */}
                      <div className="col-span-2">
                        <span className={`text-sm font-bold ${(u.downloads || 0) > 0 ? 'text-brand-400' : textMuted}`}>
                          {u.downloads || 0}
                        </span>
                      </div>

                      {/* Role badge */}
                      <div className="col-span-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
                            : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-gray-100 border-gray-200 text-gray-500'
                        }`}>
                          {u.role === 'admin' ? '⭐ Admin' : 'User'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {u.id !== user.id && (
                          <>
                            {/* Toggle role */}
                            <button
                              onClick={() => handleRoleToggle(u.id, u.role)}
                              title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                              className={`p-1.5 rounded-lg transition-all ${
                                u.role === 'admin'
                                  ? isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'
                                  : isDark ? 'text-white/30 hover:bg-white/5 hover:text-white/60' : 'text-gray-400 hover:bg-gray-100'
                              }`}>
                              <Icons.Shield/>
                            </button>

                            {/* Delete */}
                            {confirmDel === u.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(u.id)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">
                                  Yes
                                </button>
                                <button onClick={() => setConfirmDel(null)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${isDark ? 'bg-white/8 text-white/60 hover:bg-white/12' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                  No
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDel(u.id)}
                                className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/25 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-300 hover:bg-red-50 hover:text-red-500'}`}>
                                <Icons.Trash/>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {filteredUsers.length > 0 && (
              <p className={`text-xs mt-3 text-center ${textMuted}`}>
                Showing {filteredUsers.length} of {users.length} users
              </p>
            )}
          </>
        )}

        {/* ══════════════ SUBMISSIONS TAB ══════════════ */}
        {tab === 'submissions' && (
          <>
            {/* Filter pills + counts */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {[
                { key: 'all',      label: `All (${subCounts?.total || 0})` },
                { key: 'new',      label: `🔴 New (${subCounts?.new || 0})` },
                { key: 'contact',  label: `📬 Contact (${subCounts?.contact || 0})` },
                { key: 'bug',      label: `🐛 Bugs (${subCounts?.bug || 0})` },
                { key: 'resolved', label: `✅ Resolved (${subCounts?.resolved || 0})` },
              ].map(f => (
                <button key={f.key} onClick={() => setSubFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    subFilter === f.key
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : isDark ? 'border-white/8 text-white/50 hover:border-brand-500/40 hover:text-brand-300' : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-700'
                  }`}>
                  {f.label}
                </button>
              ))}
              <button onClick={fetchSubmissions}
                className={`ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${isDark ? 'border-white/8 text-white/40 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                <Icons.Refresh/> Refresh
              </button>
            </div>

            {loadingSubs ? (
              <div className={`rounded-2xl border p-10 text-center ${surface}`}>
                <div className="flex justify-center mb-3"><Icons.Spin/></div>
                <p className={textMuted}>Loading submissions…</p>
              </div>
            ) : (() => {
              const filtered = submissions.filter(s => {
                if (subFilter === 'all')      return true
                if (subFilter === 'new')      return s.status === 'new'
                if (subFilter === 'resolved') return s.status === 'resolved'
                if (subFilter === 'contact')  return s.type === 'contact'
                if (subFilter === 'bug')      return s.type === 'bug'
                return true
              })

              if (filtered.length === 0) return (
                <div className={`py-20 text-center rounded-2xl border ${surface}`}>
                  <div className="text-4xl mb-3">📭</div>
                  <p className={`${textMuted} text-sm`}>No submissions found.</p>
                </div>
              )

              return (
                <div className="space-y-4">
                  {filtered.map(s => {
                    const isBug = s.type === 'bug'
                    const statusColors = {
                      new      : isDark ? 'bg-red-500/15 border-red-500/30 text-red-300'     : 'bg-red-50 border-red-200 text-red-700',
                      read     : isDark ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'  : 'bg-blue-50 border-blue-200 text-blue-700',
                      resolved : isDark ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-green-50 border-green-200 text-green-700',
                    }
                    return (
                      <div key={s.id} className={`rounded-2xl border p-5 transition-all ${surface} ${s.status === 'new' ? isDark ? 'border-brand-500/30' : 'border-brand-300' : ''}`}>
                        {/* Header row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl">{isBug ? '🐛' : '📬'}</span>
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${textMain}`}>
                                {isBug ? s.title : s.subject}
                              </p>
                              <p className={`text-xs mt-0.5 ${textMuted}`}>
                                {s.name || 'Anonymous'} {s.email ? `· ${s.email}` : ''} ·{' '}
                                {new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Type badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isBug ? isDark ? 'bg-amber-500/15 border-amber-500/25 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700' : isDark ? 'bg-brand-500/15 border-brand-500/25 text-brand-300' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
                              {isBug ? `🐛 ${s.bugType || 'Bug'}` : '📬 Contact'}
                            </span>
                            {/* Status badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[s.status] || statusColors.new}`}>
                              {s.status}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className={`text-sm leading-relaxed rounded-xl p-3 mb-3 ${isDark ? 'bg-white/4 text-white/65' : 'bg-gray-50 text-gray-700'}`}>
                          {isBug ? (
                            <>
                              <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${textMuted}`}>Steps to Reproduce</p>
                              <p className="whitespace-pre-wrap text-xs">{s.steps}</p>
                              {s.actual && <><p className={`text-[10px] font-bold uppercase tracking-wide mt-2 mb-1 ${textMuted}`}>Actual Behaviour</p><p className="text-xs">{s.actual}</p></>}
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap text-xs">{s.message}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {s.status !== 'read' && s.status !== 'resolved' && (
                            <button onClick={() => handleSubStatus(s.id, 'read')}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                              Mark Read
                            </button>
                          )}
                          {s.status !== 'resolved' && (
                            <button onClick={() => handleSubStatus(s.id, 'resolved')}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                              ✓ Resolve
                            </button>
                          )}
                          {s.status === 'resolved' && (
                            <button onClick={() => handleSubStatus(s.id, 'new')}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white/10 text-white/35 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                              Reopen
                            </button>
                          )}
                          {s.email && (
                            <a href={`mailto:${s.email}?subject=Re: ${encodeURIComponent(isBug ? s.title : s.subject)}`}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-brand-500/30 text-brand-400 hover:bg-brand-500/10' : 'border-brand-200 text-brand-600 hover:bg-brand-50'}`}>
                              📧 Reply
                            </a>
                          )}
                          <div className="ml-auto">
                            {confirmDel === s.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleSubDelete(s.id)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">Yes, Delete</button>
                                <button onClick={() => setConfirmDel(null)} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-white/8 text-white/60' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDel(s.id)}
                                className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-300 hover:bg-red-50 hover:text-red-500'}`}>
                                <Icons.Trash/>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
