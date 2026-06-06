import { useState, useRef, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PlaylistSection from './components/PlaylistSection'
import SingleVideoSection from './components/SingleVideoSection'
import SocialSection from './components/SocialSection'
import AudioSection from './components/AudioSection'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import AuthPage, { ProfilePage } from './components/AuthPage'
import AdminDashboard from './components/AdminDashboard'
import SupportWidget from './components/SupportWidget'
import {
  DocumentationPage,
  FAQPage,
  ContactPage,
  BugReportPage,
  PrivacyPage,
  TermsPage,
  OpenSourcePage,
} from './components/Pages'

/* Hash → page component map */
const PAGE_MAP = {
  'documentation' : DocumentationPage,
  'faq'           : FAQPage,
  'contact'       : ContactPage,
  'bug-report'    : BugReportPage,
  'privacy'       : PrivacyPage,
  'terms'         : TermsPage,
  'open-source'   : OpenSourcePage,
  'auth'          : AuthPage,
  'profile'       : ProfilePage,
  'admin'         : AdminDashboard,
}

function getHash() {
  return window.location.hash.replace('#', '') || 'home'
}

function AppContent() {
  const [hash,        setHash]        = useState(getHash)
  const [mode,        setMode]        = useState('playlist')
  const [triggerUrl,  setTriggerUrl]  = useState(null)
  const [singleUrl,   setSingleUrl]   = useState(null)
  const [socialUrl,   setSocialUrl]   = useState(null)
  const [audioUrl,    setAudioUrl]    = useState(null)
  const [heroLoading, setHeroLoading] = useState(false)

  const playlistRef = useRef(null)
  const singleRef   = useRef(null)
  const socialRef   = useRef(null)
  const audioRef    = useRef(null)

  useEffect(() => {
    const onHash = () => {
      const h = getHash()
      setHash(h)
      if (PAGE_MAP[h]) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleFetch = (url) => {
    setHeroLoading(true)
    setTriggerUrl(url)
    setSingleUrl(null); setSocialUrl(null); setAudioUrl(null)
    setTimeout(() => playlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handleSingleFetch = (url) => {
    setHeroLoading(true)
    setSingleUrl(url)
    setTriggerUrl(null); setSocialUrl(null); setAudioUrl(null)
    setTimeout(() => singleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handleSocialFetch = (url) => {
    setHeroLoading(true)
    setSocialUrl(url)
    setTriggerUrl(null); setSingleUrl(null); setAudioUrl(null)
    setTimeout(() => socialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handleAudioFetch = (url) => {
    setHeroLoading(true)
    setAudioUrl(url)
    setTriggerUrl(null); setSingleUrl(null); setSocialUrl(null)
    setTimeout(() => audioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handleReady      = () => setHeroLoading(false)
  const handleModeChange = (m) => { setMode(m); setTriggerUrl(null); setSingleUrl(null); setSocialUrl(null); setAudioUrl(null) }

  /* ── Inner page ── */
  const PageComponent = PAGE_MAP[hash]
  if (PageComponent) {
    /* Auth + Profile — no extra footer wrap needed, they handle their own layout */
    if (hash === 'auth' || hash === 'profile' || hash === 'admin') {
      return (
        <div className="min-h-screen">
          <Navbar mode={mode} onModeChange={handleModeChange} />
          <PageComponent />
        </div>
      )
    }
    return (
      <div className="min-h-screen">
        <Navbar mode={mode} onModeChange={handleModeChange} />
        <PageComponent />
        <Footer />
      </div>
    )
  }

  /* ── Main app ── */
  return (
    <div className="min-h-screen">
      <Navbar mode={mode} onModeChange={handleModeChange} />
      <Hero
        onFetch={handleFetch}
        onSingleFetch={handleSingleFetch}
        onSocialFetch={handleSocialFetch}
        onAudioFetch={handleAudioFetch}
        loading={heroLoading}
        mode={mode}
        onModeChange={handleModeChange}
      />
      <div ref={playlistRef}>
        <PlaylistSection triggerUrl={triggerUrl} onReady={handleReady} />
      </div>
      <div ref={singleRef}>
        <SingleVideoSection triggerUrl={singleUrl} onReady={handleReady} />
      </div>
      <div ref={socialRef}>
        <SocialSection triggerUrl={socialUrl} onReady={handleReady} />
      </div>
      <div ref={audioRef}>
        <AudioSection triggerUrl={audioUrl} onReady={handleReady} />
      </div>
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <SupportWidget />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
