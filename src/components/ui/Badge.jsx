const VARIANTS = {
  default:  'bg-color-bg-card-hover text-color-text-muted',
  accent:   'bg-color-accent-soft text-color-accent',
  success:  'bg-color-success-soft text-color-success',
  warning:  'bg-color-warning-soft text-color-warning',
  error:    'bg-color-error-soft text-color-error',
  sun:      'bg-color-sun-soft text-color-sun',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${VARIANTS[variant] || VARIANTS.default} ${className}`}>
      {children}
    </span>
  )
}
