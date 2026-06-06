import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext({ toast: () => {} })

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = ++_id
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  const ICONS = {
    success : '✅',
    error   : '❌',
    info    : 'ℹ️',
    warning : '⚠️',
  }
  const COLORS = {
    success : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300',
    error   : 'bg-red-500/12 border-red-500/25 text-red-300',
    info    : 'bg-brand-500/12 border-brand-500/25 text-brand-300',
    warning : 'bg-amber-500/12 border-amber-500/25 text-amber-300',
  }

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium
              shadow-2xl backdrop-blur-md pointer-events-auto animate-fade-up max-w-xs
              ${COLORS[t.type] || COLORS.info}`}>
            <span className="text-base flex-shrink-0">{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 text-base leading-none ml-1">×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
