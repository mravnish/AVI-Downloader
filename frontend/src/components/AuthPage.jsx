import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/* ── Icons ── */
const EyeIcon = ({ open }) => open
  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
  </svg>
)

/* ── Shared helpers ── */
function ErrBox({ msg }) {
  if (!msg) return null
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
      {msg}
    </div>
  )
}

function Label({ children, isDark }) {
  return <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>{children}</label>
}

function inpCls(isDark) {
  return `w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-200 ${
    isDark
      ? 'bg-surface-700 border-white/8 text-white placeholder:text-white/22 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 shadow-sm'
  }`
}

function PageWrap({ children, isDark }) {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 pt-20 pb-12 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,151,0.09) 0%, transparent 70%)' }}/>
      </div>
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-7">
          <a href="#home" className="inline-flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill="url(#aLg)"/>
              <path d="M10 21.5L16 10.5L22 21.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.4 18.5h7.2" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
              <defs><linearGradient id="aLg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#14b897"/><stop offset="1" stopColor="#0d6e5c"/></linearGradient></defs>
            </svg>
            <span className="font-display font-bold text-xl text-gradient">AVI Downloader</span>
          </a>
        </div>
        {children}
        <div className="text-center mt-5">
          <a href="#home" className={`text-xs transition-colors ${isDark ? 'text-white/28 hover:text-white/55' : 'text-gray-400 hover:text-gray-600'}`}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   REGISTER  —  Step 1: form  |  Step 2: OTP
══════════════════════════════════════ */
function RegisterForm({ onSwitchToLogin }) {
  const { theme }                       = useTheme()
  const { sendOtp, verifyOtp, resendOtp, loading } = useAuth()
  const { toast }                       = useToast()
  const isDark                          = theme === 'dark'
  const inp                             = inpCls(isDark)

  const [step,      setStep]     = useState(1)
  const [showPass,  setShowPass] = useState(false)
  const [error,     setError]    = useState(null)
  const [otpVal,    setOtpVal]   = useState('')
  const [resendCD,  setResendCD] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  /* ── Step 1: validate → hit backend send-otp ── */
  const handleSend = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 6)        return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm)  return setError('Passwords do not match.')
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Enter a valid email address.')

    const res = await sendOtp({ name: form.name, email: form.email, password: form.password })
    if (!res.success) return setError(res.error)

    setStep(2)
    startResendTimer()
    toast({ message: `OTP sent to ${form.email} — check your inbox!`, type: 'info' })
  }

  /* ── Step 2: verify OTP via backend ── */
  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    if (otpVal.length !== 6) return setError('Enter the 6-digit OTP from your email.')

    const res = await verifyOtp({ email: form.email, otp: otpVal })
    if (!res.success) return setError(res.error)

    toast({ message: `Welcome, ${res.user.name}! Account created 🎉`, type: 'success' })
    window.location.hash = '#profile'
  }

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCD > 0) return
    setError(null)
    setOtpVal('')
    const res = await resendOtp({ email: form.email })
    if (!res.success) return setError(res.error)
    toast({ message: 'New OTP sent to your email!', type: 'info' })
    startResendTimer()
  }

  const startResendTimer = () => {
    setResendCD(60)
    const t = setInterval(() => setResendCD(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
  }

  return (
    <PageWrap isDark={isDark}>
      <div className={`rounded-2xl border p-7 ${isDark ? 'bg-surface-800 border-white/7' : 'bg-white border-gray-200 shadow-md'}`}>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-brand-500' : step > s ? 'w-4 bg-brand-500/50' : 'w-4 bg-white/10'}`}/>
          ))}
        </div>

        <h1 className={`font-display font-extrabold text-2xl mb-1 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h1>
        <p className={`text-sm text-center mb-6 ${isDark ? 'text-white/38' : 'text-gray-500'}`}>
          {step === 1
            ? 'Fill in your details to get started'
            : `We sent a 6-digit OTP to ${form.email}`}
        </p>

        <ErrBox msg={error}/>

        {/* ── Step 1: Registration form ── */}
        {step === 1 && (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label isDark={isDark}>Full Name</Label>
              <input required value={form.name} onChange={set('name')} placeholder="Your full name" className={inp}/>
            </div>
            <div>
              <Label isDark={isDark}>Email Address</Label>
              <input required type="email" value={form.email} onChange={set('email')} placeholder="you@gmail.com" className={inp}/>
            </div>
            <div>
              <Label isDark={isDark}>Password</Label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min. 6 characters" className={`${inp} pr-11`}/>
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
                  <EyeIcon open={showPass}/>
                </button>
              </div>
            </div>
            <div>
              <Label isDark={isDark}>Confirm Password</Label>
              <input required type="password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" className={inp}/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1">
              {loading ? <><SpinIcon/>Sending OTP…</> : 'Send OTP to Email →'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-5">

            {/* Email sent confirmation */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-brand-500/8 border-brand-500/20' : 'bg-brand-50 border-brand-200'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-brand-500/20 text-brand-300' : 'bg-brand-100 text-brand-600'}`}>
                <MailIcon/>
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-gray-900'}`}>OTP sent to your email</p>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{form.email} · valid for 10 minutes</p>
              </div>
            </div>

            {/* OTP input */}
            <div>
              <Label isDark={isDark}>Enter 6-Digit OTP</Label>
              <input
                required
                maxLength={6}
                value={otpVal}
                onChange={e => setOtpVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className={`${inp} text-center text-3xl font-mono tracking-[0.6em] py-4`}
              />
            </div>

            <button type="submit" disabled={loading || otpVal.length !== 6} className="btn-primary w-full justify-center py-3">
              {loading ? <><SpinIcon/>Verifying…</> : 'Verify & Create Account ✓'}
            </button>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => { setStep(1); setError(null); setOtpVal('') }}
                className={`text-xs transition-colors ${isDark ? 'text-white/35 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
                ← Edit details
              </button>
              <button type="button" onClick={handleResend} disabled={resendCD > 0 || loading}
                className={`text-xs font-medium transition-colors ${resendCD > 0 ? isDark ? 'text-white/25' : 'text-gray-300' : 'text-brand-400 hover:text-brand-300'}`}>
                {resendCD > 0 ? `Resend in ${resendCD}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <p className={`text-center text-xs mt-5 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className={`font-semibold ${isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-500'}`}>
            Sign In
          </button>
        </p>
      </div>
    </PageWrap>
  )
}

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
function LoginForm({ onSwitchToRegister }) {
  const { theme }         = useTheme()
  const { login, loading } = useAuth()
  const { toast }         = useToast()
  const isDark            = theme === 'dark'
  const inp               = inpCls(isDark)

  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.email.trim())  return setError('Please enter your email address.')
    if (!form.password)      return setError('Please enter your password.')

    const res = await login({ email: form.email, password: form.password })
    if (!res.success) return setError(res.error)

    toast({ message: `Welcome back, ${res.user.name}! 👋`, type: 'success' })
    window.location.hash = '#profile'
  }

  return (
    <PageWrap isDark={isDark}>
      <div className={`rounded-2xl border p-7 ${isDark ? 'bg-surface-800 border-white/7' : 'bg-white border-gray-200 shadow-md'}`}>
        <h1 className={`font-display font-extrabold text-2xl mb-1 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome Back
        </h1>
        <p className={`text-sm text-center mb-6 ${isDark ? 'text-white/38' : 'text-gray-500'}`}>
          Sign in to your AVI Downloader account
        </p>

        <ErrBox msg={error}/>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label isDark={isDark}>Email Address</Label>
            <input required type="email" value={form.email} onChange={set('email')}
              placeholder="you@gmail.com" className={inp}/>
          </div>
          <div>
            <Label isDark={isDark}>Password</Label>
            <div className="relative">
              <input required type={showPass ? 'text' : 'password'} value={form.password}
                onChange={set('password')} placeholder="Your password" className={`${inp} pr-11`}/>
              <button type="button" onClick={() => setShowPass(s => !s)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
                <EyeIcon open={showPass}/>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1">
            {loading ? <><SpinIcon/>Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className={`text-center text-xs mt-5 ${isDark ? 'text-white/28' : 'text-gray-400'}`}>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className={`font-semibold ${isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-500'}`}>
            Register
          </button>
        </p>
      </div>
    </PageWrap>
  )
}

/* ══════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════ */
export function ProfilePage() {
  const { theme }                    = useTheme()
  const { user, token, logout, updateProfile } = useAuth()
  const { toast }                    = useToast()
  const isDark                       = theme === 'dark'
  const [editing, setEditing]        = useState(false)
  const [saving,  setSaving]         = useState(false)
  const [name,    setName]           = useState(user?.name || '')

  // If no token at all → redirect to auth
  // If token exists but user not yet loaded → show spinner (brief cache restore)
  if (!token) { window.location.hash = '#auth'; return null }
  if (!user) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <svg className="w-8 h-8 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const res = await updateProfile({ name: name.trim() })
    setSaving(false)
    if (res.success) { setEditing(false); toast({ message: 'Profile updated!', type: 'success' }) }
  }

  const handleLogout = () => {
    logout()
    toast({ message: 'Signed out. See you soon!', type: 'info' })
    window.location.hash = '#home'
  }

  const joinDate = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A'
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const surface   = isDark ? 'bg-surface-800 border-white/6' : 'bg-white border-gray-200 shadow-sm'
  const textMain  = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-500'
  const inp       = inpCls(isDark)

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 ${isDark ? 'bg-surface-950' : 'bg-slate-50'}`}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,151,0.07) 0%, transparent 70%)' }}/>
      </div>
      <div className="relative max-w-2xl mx-auto">

        <a href="#home" className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${isDark ? 'text-white/35 hover:text-brand-400' : 'text-gray-400 hover:text-brand-600'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
          Back to Home
        </a>

        {/* Profile hero */}
        <div className={`rounded-2xl border p-6 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-5 ${surface}`}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-display font-extrabold flex-shrink-0 shadow-lg shadow-brand-500/25">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className={`font-display font-extrabold text-2xl ${textMain}`}>{user.name}</h1>
            <p className={`text-sm mt-0.5 ${textMuted}`}>{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${isDark ? 'bg-brand-500/12 border-brand-500/25 text-brand-300' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
                {user.role === 'admin' ? '⭐ Admin' : '👤 Member'}
              </span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/8 text-white/40' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                Joined {joinDate}
              </span>
            </div>
          </div>
          <button onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${isDark ? 'border-red-500/25 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Downloads',    val: user.downloads || 0,                       icon: '⬇️' },
            { label: 'Member Since', val: new Date(user.joinedAt).getFullYear(),     icon: '📅' },
            { label: 'Account Type', val: user.role === 'admin' ? 'Admin' : 'Free', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${surface}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-extrabold text-xl text-gradient">{s.val}</div>
              <div className={`text-[11px] mt-0.5 ${textMuted}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Account details */}
        <div className={`rounded-2xl border p-6 ${surface}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`font-display font-bold text-lg ${textMain}`}>Account Details</h2>
            {!editing && (
              <button onClick={() => { setEditing(true); setName(user.name) }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white/8 text-white/50 hover:border-brand-500/40 hover:text-brand-300' : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-700'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z"/></svg>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${textMuted}`}>Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={inp}/>
              </div>
              <div className={`rounded-xl border px-4 py-3 ${isDark ? 'bg-surface-700/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-xs ${textMuted}`}><span className="font-semibold">Email:</span> {user.email} <span className="text-brand-400 ml-1">(cannot be changed)</span></p>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary py-2.5 px-5 flex-1 justify-center">
                  {saving ? <><SpinIcon/>Saving…</> : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className={`py-2.5 px-5 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-white/8 text-white/50 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Full Name',    val: user.name  },
                { label: 'Email',        val: user.email },
                { label: 'Member Since', val: joinDate   },
                { label: 'Role',         val: user.role === 'admin' ? 'Admin ⭐' : 'Member' },
              ].map(row => (
                <div key={row.label} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>{row.label}</span>
                  <span className={`text-sm font-medium ${textMain}`}>{row.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════ */
export default function AuthPage() {
  const [mode, setMode] = useState('login')
  return mode === 'login'
    ? <LoginForm     onSwitchToRegister={() => setMode('register')} />
    : <RegisterForm  onSwitchToLogin={()    => setMode('login')}    />
}
