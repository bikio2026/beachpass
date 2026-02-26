export function AvailabilityBar({ available, total, type = 'basic' }) {
  const ratio = total > 0 ? available / total : 0
  const color =
    ratio > 0.3 ? 'var(--color-available)' : ratio > 0 ? 'var(--color-few-left)' : 'var(--color-full)'

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 h-2 rounded-full bg-color-bg-input overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-color-text tabular-nums shrink-0">
        {available}
        <span className="text-color-text-dim font-normal">/{total}</span>
      </span>
    </div>
  )
}
