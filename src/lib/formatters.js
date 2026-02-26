export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function getAvailabilityColor(available, capacity) {
  if (capacity === 0) return 'full'
  const ratio = available / capacity
  if (ratio > 0.3) return 'available'
  if (ratio > 0) return 'few-left'
  return 'full'
}

export function getAvailabilityLabel(available, capacity) {
  if (capacity === 0) return 'Sin servicio'
  if (available === 0) return 'Completo'
  return `${available} disponibles`
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}
