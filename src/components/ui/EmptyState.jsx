import * as icons from 'lucide-react'

export function EmptyState({ icon = 'Inbox', title, message }) {
  const Icon = icons[icon] || icons.Inbox

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
        <Icon size={28} className="text-accent" />
      </div>
      <h3 className="font-display text-base font-semibold text-text mb-1">{title}</h3>
      {message && <p className="text-sm text-text-muted max-w-xs">{message}</p>}
    </div>
  )
}
