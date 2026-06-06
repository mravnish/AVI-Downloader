import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── WhatsApp number (hidden from DOM, built at runtime) ── */
const WA_NUM = ['91', '99999', '01703'].join('')
const WA_URL = `https://wa.me/${WA_NUM}?text=Hi%20AVI%20Support%2C%20I%20need%20help%20with%20the%20downloader.`

/* ── Bot replies pool ── */
const BOT_REPLIES = [
  "Hi! 👋 I'm AVI Support. How can I help you today?",
  "Thanks for reaching out! Could you describe your issue in more detail?",
  "I understand. Let me check that for you right away! 🔍",
  "Great question! AVI Downloader supports YouTube, Instagram, Facebook, TikTok, Twitter and 1000+ more platforms.",
  "For download issues, make sure yt-dlp and ffmpeg are installed and in your PATH.",
  "If you're still stuck, you can also reach us on WhatsApp for faster support! 💬",
  "Is there anything else I can help you with? 😊",
]

function getReply(index) {
  return BOT_REPLIES[index % BOT_REPLIES.length]
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const INITIAL_MSG = {
  id   : 1,
  from : 'bot',
  text : "👋 Hello! Welcome to **AVI Downloader Support**.\n\nI'm here to help you with downloads, setup, or any issues. How can I assist you today?",
  time : now(),
}

/* ══════════════════════════════════════
   SUPPORT WIDGET
══════════════════════════════════════ */
export default function SupportWidget() {
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'

  const [chatOpen,   setChatOpen]   = useState(false)
  const [messages,   setMessages]   = useState([INITIAL_MSG])
  const [input,      setInput]      = useState('')
  const [typing,     setTyping]     = useState(false)
  const [unread,     setUnread]     = useState(0)
  const [showEmoji,  setShowEmoji]  = useState(false)
  const [replyIdx,   setReplyIdx]   = useState(0)
  const [waHover,    setWaHover]    = useState(false)
  const [chatHover,  setChatHover]  = useState(false)
  const [waTooltip,  setWaTooltip]  = useState(false)
  const [chatTooltip,setChatTooltip]= useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const msgIdRef   = useRef(2)

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  /* Focus input when chat opens */
  useEffect(() => {
    if (chatOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [chatOpen])

  /* Send message */
  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg = { id: msgIdRef.current++, from: 'user', text, time: now() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setShowEmoji(false)

    /* Bot typing */
    setTyping(true)
    const delay = 1000 + Math.random() * 1000
    setTimeout(() => {
      setTyping(false)
      const botMsg = {
        id   : msgIdRef.current++,
        from : 'bot',
        text : getReply(replyIdx),
        time : now(),
      }
      setMessages(m => [...m, botMsg])
      setReplyIdx(r => r + 1)
      if (!chatOpen) setUnread(u => u + 1)
    }, delay)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const addEmoji = (emoji) => {
    setInput(v => v + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const EMOJIS = ['😊','👍','🙏','❓','⚡','🎬','📥','🔥','✅','💬','🤔','😅']

  /* ── Render bold in messages ── */
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\n)/)
    return parts.map((part, i) => {
      if (part === '\n') return <br key={i}/>
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2, -2)}</strong>
      return part
    })
  }

  /* ── Shared glass surface ── */
  const glass = isDark
    ? 'bg-[rgba(13,19,26,0.92)] border-white/8'
    : 'bg-white/95 border-gray-200'

  return (
    <>
      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        @keyframes sw-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes sw-pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.7); opacity: 0;  }
        }
        @keyframes sw-slide-up {
          from { opacity:0; transform: translateY(24px) scale(.96); }
          to   { opacity:1; transform: translateY(0)    scale(1);   }
        }
        @keyframes sw-dot {
          0%,80%,100% { transform: scale(0); }
          40%         { transform: scale(1); }
        }
        .sw-float       { animation: sw-float 3.2s ease-in-out infinite; }
        .sw-float-delay { animation: sw-float 3.2s ease-in-out infinite; animation-delay: 1.6s; }
        .sw-pulse-ring::before {
          content:''; position:absolute; inset:-4px; border-radius:50%;
          border:2px solid currentColor; opacity:.5;
          animation: sw-pulse-ring 1.8s ease-out infinite;
        }
        .sw-popup { animation: sw-slide-up .28s cubic-bezier(.16,1,.3,1) both; }
        .sw-dot   { animation: sw-dot 1.4s ease-in-out infinite; display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; }
        .sw-dot:nth-child(2) { animation-delay:.16s; }
        .sw-dot:nth-child(3) { animation-delay:.32s; }
        .sw-msgs::-webkit-scrollbar { width:4px; }
        .sw-msgs::-webkit-scrollbar-track { background:transparent; }
        .sw-msgs::-webkit-scrollbar-thumb { background:rgba(20,184,151,.3); border-radius:4px; }
      `}</style>

      {/* ══ WIDGET CONTAINER — fixed bottom-right ══ */}
      <div style={{ position:'fixed', bottom:'28px', right:'24px', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px' }}>

        {/* ── Chat popup ── */}
        {chatOpen && (
          <div className={`sw-popup backdrop-blur-2xl border rounded-3xl shadow-2xl overflow-hidden ${glass}`}
            style={{ width:'340px', maxWidth:'calc(100vw - 32px)', boxShadow: isDark
              ? '0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(20,184,151,.1)'
              : '0 32px 80px rgba(0,0,0,.15), 0 0 0 1px rgba(20,184,151,.12)' }}>

            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#0d6e5c,#14b897)', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  {/* Avatar */}
                  <div style={{ position:'relative', width:'44px', height:'44px', flexShrink:0 }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', border:'2px solid rgba(255,255,255,.25)' }}>
                      🎬
                    </div>
                    {/* Online dot */}
                    <div style={{ position:'absolute', bottom:'-1px', right:'-1px', width:'12px', height:'12px', borderRadius:'50%', background:'#22c55e', border:'2px solid #0d9488' }}/>
                  </div>
                  <div>
                    <p style={{ color:'#fff', fontWeight:700, fontSize:'15px', margin:0, lineHeight:1.2 }}>AVI Support</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'3px' }}>
                      <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4ade80' }}/>
                      <span style={{ color:'rgba(255,255,255,.8)', fontSize:'11px' }}>Online · Typically replies instantly</span>
                    </div>
                  </div>
                </div>
                {/* Close */}
                <button onClick={() => setChatOpen(false)}
                  style={{ background:'rgba(255,255,255,.15)', border:'none', borderRadius:'10px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:'18px', lineHeight:1, transition:'background .15s' }}
                  onMouseEnter={e => e.target.style.background='rgba(255,255,255,.25)'}
                  onMouseLeave={e => e.target.style.background='rgba(255,255,255,.15)'}>
                  ×
                </button>
              </div>

              {/* Tagline */}
              <div style={{ marginTop:'12px', background:'rgba(0,0,0,.15)', borderRadius:'12px', padding:'9px 12px' }}>
                <p style={{ color:'rgba(255,255,255,.9)', fontSize:'12px', margin:0, lineHeight:1.5 }}>
                  💡 <strong>AVI Support Team</strong> typically replies instantly. Ask anything about downloads, setup, or issues!
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="sw-msgs" style={{ height:'280px', overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', background: isDark ? 'rgba(7,11,15,.6)' : 'rgba(248,250,252,.8)' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'82%', padding:'10px 14px', borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: msg.from === 'user'
                      ? 'linear-gradient(135deg,#14b897,#0d9488)'
                      : isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)',
                    color: msg.from === 'user' ? '#fff' : isDark ? 'rgba(255,255,255,.88)' : '#1a1a1a',
                    fontSize:'13px', lineHeight:'1.55',
                    boxShadow: msg.from === 'user' ? '0 4px 16px rgba(20,184,151,.3)' : 'none',
                  }}>
                    {renderText(msg.text)}
                  </div>
                  <span style={{ fontSize:'10px', color: isDark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.3)', marginTop:'4px', paddingInline:'4px' }}>
                    {msg.from === 'bot' ? '🤖 AVI Bot · ' : ''}{msg.time}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display:'flex', alignItems:'flex-start', gap:'8px' }}>
                  <div style={{ padding:'10px 16px', borderRadius:'4px 18px 18px 18px', background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)', display:'flex', gap:'4px', alignItems:'center' }}>
                    <span className="sw-dot" style={{ color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)' }}/>
                    <span className="sw-dot" style={{ color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)' }}/>
                    <span className="sw-dot" style={{ color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)' }}/>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div style={{ padding:'10px 14px', borderTop: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(0,0,0,.06)', display:'flex', flexWrap:'wrap', gap:'6px', background: isDark ? 'rgba(7,11,15,.8)' : 'rgba(248,250,252,.9)' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => addEmoji(e)}
                    style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', padding:'2px', borderRadius:'8px', transition:'transform .15s' }}
                    onMouseEnter={ev => ev.target.style.transform='scale(1.3)'}
                    onMouseLeave={ev => ev.target.style.transform='scale(1)'}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding:'12px 14px', borderTop: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(0,0,0,.07)', background: isDark ? 'rgba(7,11,15,.9)' : '#fff', display:'flex', alignItems:'center', gap:'8px' }}>
              {/* Emoji toggle */}
              <button onClick={() => setShowEmoji(s => !s)}
                style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', padding:'4px', borderRadius:'8px', lineHeight:1, opacity: showEmoji ? 1 : .5, transition:'opacity .15s' }}>
                😊
              </button>

              {/* Input */}
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Type a message…"
                style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:'13px', color: isDark ? 'rgba(255,255,255,.85)' : '#1a1a1a' }}/>

              {/* Send */}
              <button onClick={sendMessage} disabled={!input.trim()}
                style={{ width:'34px', height:'34px', borderRadius:'50%', border:'none', cursor: input.trim() ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s',
                  background: input.trim() ? 'linear-gradient(135deg,#14b897,#0d9488)' : isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)',
                  boxShadow: input.trim() ? '0 4px 14px rgba(20,184,151,.4)' : 'none',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : isDark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>

            {/* Footer note */}
            <div style={{ padding:'8px 14px 12px', textAlign:'center', background: isDark ? 'rgba(7,11,15,.9)' : '#fff' }}>
              <span style={{ fontSize:'10px', color: isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.3)' }}>
                Powered by AVI Downloader Support · <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ color:'#14b897', textDecoration:'none' }}>WhatsApp us</a>
              </span>
            </div>
          </div>
        )}

        {/* ── Action buttons row ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>

          {/* WhatsApp button */}
          <div style={{ position:'relative' }}>
            {/* Tooltip */}
            {waTooltip && (
              <div style={{ position:'absolute', bottom:'calc(100% + 10px)', right:0, background: isDark ? 'rgba(13,19,26,.95)' : '#1a1a1a', color:'#fff', fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', whiteSpace:'nowrap', pointerEvents:'none', boxShadow:'0 4px 16px rgba(0,0,0,.3)' }}>
                WhatsApp Support
                <div style={{ position:'absolute', top:'100%', right:'16px', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`5px solid ${isDark ? 'rgba(13,19,26,.95)' : '#1a1a1a'}` }}/>
              </div>
            )}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              className="sw-float sw-pulse-ring"
              onMouseEnter={() => { setWaHover(true); setWaTooltip(true) }}
              onMouseLeave={() => { setWaHover(false); setWaTooltip(false) }}
              style={{
                position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                width:'52px', height:'52px', borderRadius:'50%', textDecoration:'none',
                background:'linear-gradient(135deg,#25D366,#128C7E)',
                boxShadow: waHover
                  ? '0 8px 32px rgba(37,211,102,.6), 0 0 0 4px rgba(37,211,102,.15)'
                  : '0 6px 24px rgba(37,211,102,.4)',
                transform: waHover ? 'scale(1.12)' : 'scale(1)',
                transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
                color:'rgba(37,211,102,.6)',
              }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.554 4.103 1.522 5.828L.057 23.25a.75.75 0 0 0 .914.914l5.422-1.465A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.708 9.708 0 0 1-4.95-1.35l-.354-.211-3.656.988.987-3.655-.212-.356A9.706 9.706 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
            </a>
          </div>

          {/* Live Chat button */}
          <div style={{ position:'relative' }}>
            {/* Unread badge */}
            {unread > 0 && !chatOpen && (
              <div style={{ position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', color:'#fff', fontSize:'10px', fontWeight:800, width:'18px', height:'18px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, border:'2px solid', borderColor: isDark ? '#070b0f' : '#f8fafc', boxShadow:'0 2px 8px rgba(239,68,68,.5)' }}>
                {unread}
              </div>
            )}
            {/* Tooltip */}
            {chatTooltip && (
              <div style={{ position:'absolute', bottom:'calc(100% + 10px)', right:0, background: isDark ? 'rgba(13,19,26,.95)' : '#1a1a1a', color:'#fff', fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', whiteSpace:'nowrap', pointerEvents:'none', boxShadow:'0 4px 16px rgba(0,0,0,.3)' }}>
                Live Chat Support
                <div style={{ position:'absolute', top:'100%', right:'16px', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`5px solid ${isDark ? 'rgba(13,19,26,.95)' : '#1a1a1a'}` }}/>
              </div>
            )}
            <button
              onClick={() => setChatOpen(o => !o)}
              className="sw-float-delay"
              onMouseEnter={() => { setChatHover(true); setChatTooltip(true) }}
              onMouseLeave={() => { setChatHover(false); setChatTooltip(false) }}
              style={{
                position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                width:'52px', height:'52px', borderRadius:'50%', border:'none', cursor:'pointer',
                background: chatOpen
                  ? 'linear-gradient(135deg,#0d6e5c,#14b897)'
                  : 'linear-gradient(135deg,#14b897,#0d9488)',
                boxShadow: chatHover || chatOpen
                  ? '0 8px 32px rgba(20,184,151,.6), 0 0 0 4px rgba(20,184,151,.15)'
                  : '0 6px 24px rgba(20,184,151,.35)',
                transform: chatHover ? 'scale(1.12)' : 'scale(1)',
                transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, background .2s',
              }}>
              {chatOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <circle cx="9" cy="10" r="1" fill="white"/>
                  <circle cx="12" cy="10" r="1" fill="white"/>
                  <circle cx="15" cy="10" r="1" fill="white"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
