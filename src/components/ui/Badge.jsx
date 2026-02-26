const VARIANTS = {
  default:  'bg-bg-card-hover text-text-muted',
  accent:   'bg-accent-soft text-accent',
  success:  'bg-success-soft text-success',
  warning:  'bg-warning-soft text-warning',
  error:    'bg-error-soft text-error',
  sun:      'bg-sun-soft text-sun',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${VARIANTS[variant] || VARIANTS.default} ${className}`}>
      {children}
    </span>
  )
}
