import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'border-l-color-success',
  warning: 'border-l-color-warning',
  error: 'border-l-color-error',
  info: 'border-l-color-accent',
}

const ICON_COLORS = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-accent',
}

export function Toast({ toast }) {
  const removeToast = useUIStore((s) => s.removeToast)
  const [exiting, setExiting] = useState(false)
  const Icon = ICONS[toast.variant] || ICONS.info

  useEffect(() => {
    if (toast.duration > 0) {
      const t = setTimeout(() => setExiting(true), toast.duration - 300)
      return () => clearTimeout(t)
    }
  }, [toast.duration])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 bg-bg-card rounded-xl border-l-4 ${STYLES[toast.variant] || STYLES.info} shadow-lg ${
        exiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
      style={{ minWidth: 280, maxWidth: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_COLORS[toast.variant] || ICON_COLORS.info}`} />
      <p className="text-sm text-text flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-0.5 shrink-0 text-text-dim hover:text-text transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
