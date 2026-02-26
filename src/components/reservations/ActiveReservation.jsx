import { useState, useEffect } from 'react'
import {
  Timer, MapPin, Umbrella, Crown, Check, X, AlertTriangle, Loader2,
} from 'lucide-react'
import { useReservationStore } from '../../store/reservationStore'
import { useSubscriptionStore } from '../../store/subscriptionStore'
import { useUserStore } from '../../store/userStore'
import { useUIStore } from '../../store/uiStore'
import { TIERS } from '../../lib/constants'

const TYPE_ICON = {
  basic: Umbrella,
  premium: Crown,
}

const TYPE_COLORS = {
  basic: {
    bg: 'bg-color-accent-soft/50',
    text: 'text-color-tier-basic',
    btn: 'bg-color-accent hover:bg-color-accent-hover',
    shadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
  },
  premium: {
    bg: 'bg-color-sun-soft/50',
    text: 'text-color-tier-premium',
    btn: 'bg-color-sun hover:bg-color-sun-hover',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
}

function useCountdown(expiresAt) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const diff = new Date(expiresAt).getTime() - now
  const isExpired = diff <= 0
  const totalSeconds = isExpired ? 0 : Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`

  // Urgencia
  let urgency = 'normal'   // > 5 min
  if (minutes < 2) urgency = 'critical'
  else if (minutes < 5) urgency = 'warning'

  return { formatted, minutes, seconds, totalSeconds, isExpired, urgency }
}

export function ActiveReservation() {
  const { activeReservation, claim, cancel, loading, fetchActiveReservation } = useReservationStore()
  const { activeSubscription } = useSubscriptionStore()
  const { user } = useUserStore()
  const { addToast } = useUIStore()

  const [action, setAction] = useState(null) // 'claim' | 'cancel'

  // Fetch active reservation on mount when user is logged in
  useEffect(() => {
    if (user) fetchActiveReservation(user.id)
  }, [user, fetchActiveReservation])

  const reservation = activeReservation
  const countdown = useCountdown(reservation?.expiresAt || new Date().toISOString())

  // Si expiro, limpiar
  useEffect(() => {
    if (reservation && countdown.isExpired) {
      addToast({ variant: 'warning', message: 'Tu reserva expiró.' })
      useReservationStore.getState().clearReservation()
    }
  }, [countdown.isExpired, reservation, addToast])

  if (!reservation) return null

  // Use stationName from backend enrichment
  const stationName = reservation.stationName || 'Estación'
  const Icon = TYPE_ICON[reservation.type] || Umbrella
  const colors = TYPE_COLORS[reservation.type] || TYPE_COLORS.basic
  const tierName = TIERS[reservation.type]?.name || reservation.type

  // Colores de urgencia para el countdown
  const urgencyStyles = {
    normal: 'text-color-accent',
    warning: 'text-color-warning',
    critical: 'text-color-error animate-pulse',
  }

  const urgencyBorder = {
    normal: 'border-color-border',
    warning: 'border-color-warning/50',
    critical: 'border-color-error/50',
  }

  const urgencyBg = {
    normal: '',
    warning: 'bg-color-warning-soft/20',
    critical: 'bg-color-error-soft/20',
  }

  const handleClaim = async () => {
    if (!activeSubscription) {
      addToast({ variant: 'error', message: 'Necesitás una suscripción activa para reclamar.' })
      return
    }
    setAction('claim')
    try {
      await claim(reservation.id, activeSubscription.id)
      addToast({ variant: 'success', message: 'Equipamiento retirado. Mostrá el QR en la estación.' })
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    } finally {
      setAction(null)
    }
  }

  const handleCancel = async () => {
    setAction('cancel')
    try {
      await cancel(reservation.id)
      addToast({ variant: 'info', message: 'Reserva cancelada.' })
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[1500] w-[calc(100%-2rem)] max-w-sm animate-fade-in-up">
      <div
        className={`rounded-2xl border ${urgencyBorder[countdown.urgency]} bg-color-bg-card shadow-xl overflow-hidden ${urgencyBg[countdown.urgency]}`}
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      >
        {/* Barra de progreso superior */}
        <div className="h-1 bg-color-bg-card-hover relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-1000 ease-linear"
            style={{
              width: `${Math.max(0, (countdown.totalSeconds / (30 * 60)) * 100)}%`,
              background: countdown.urgency === 'critical'
                ? 'var(--color-error)'
                : countdown.urgency === 'warning'
                ? 'var(--color-warning)'
                : 'var(--color-accent)',
            }}
          />
        </div>

        <div className="p-4 space-y-3">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                <Icon size={18} className={colors.text} />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-color-text">
                  Reserva {tierName}
                </div>
                <div className="flex items-center gap-1 text-xs text-color-text-muted">
                  <MapPin size={11} />
                  {stationName}
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${urgencyStyles[countdown.urgency]}`}>
              <Timer size={16} />
              {countdown.formatted}
            </div>
          </div>

          {/* Alerta de urgencia */}
          {countdown.urgency === 'warning' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-color-warning-soft/60 text-xs text-color-warning">
              <AlertTriangle size={13} className="shrink-0" />
              <span>Quedan menos de 5 minutos. Acercate a la estación.</span>
            </div>
          )}
          {countdown.urgency === 'critical' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-color-error-soft/60 text-xs text-color-error">
              <AlertTriangle size={13} className="shrink-0" />
              <span>Tu reserva está por expirar.</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={handleClaim}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${colors.btn}`}
              style={{ boxShadow: colors.shadow }}
            >
              {action === 'claim' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Reclamá
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-color-border text-color-text-muted font-semibold text-sm hover:bg-color-bg-card-hover hover:text-color-text transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {action === 'cancel' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <X size={15} />
              )}
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
