import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function DialogShell({ title, onClose, children, wide = false }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(26, 26, 46, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`bg-color-bg-card rounded-2xl shadow-xl w-full animate-fade-in-up overflow-hidden ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-color-border">
          <h2 className="font-display text-lg font-semibold text-color-text">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-color-text-muted hover:text-color-text hover:bg-color-bg-card-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
