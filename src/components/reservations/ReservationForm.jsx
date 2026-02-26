import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Umbrella, Crown, ChevronRight, AlertCircle, Loader2,
  Timer, Clock, Check, MapPin,
} from 'lucide-react'
import { DialogShell } from '../ui/DialogShell'
import { useUserStore } from '../../store/userStore'
import { useSubscriptionStore } from '../../store/subscriptionStore'
import { useReservationStore } from '../../store/reservationStore'
import { useStationStore } from '../../store/stationStore'
import { useUIStore } from '../../store/uiStore'
import { TIERS, RESERVATION_TTL_MINUTES } from '../../lib/constants'

const TYPE_CONFIG = {
  basic: {
    icon: Umbrella,
    colorClass: 'text-color-tier-basic',
    bgClass: 'bg-color-accent-soft/50',
    borderActive: 'border-color-accent',
    btnClass: 'bg-color-accent hover:bg-color-accent-hover',
    shadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
  },
  premium: {
    icon: Crown,
    colorClass: 'text-color-tier-premium',
    bgClass: 'bg-color-sun-soft/50',
    borderActive: 'border-color-sun',
    btnClass: 'bg-color-sun hover:bg-color-sun-hover',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
}

function CountdownSuccess({ expiresAt }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('Expirada')
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setRemaining(`${mins}:${String(secs).padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return (
    <div className="flex items-center gap-2 text-sm font-mono font-bold text-color-accent">
      <Timer size={16} />
      <span>{remaining}</span>
    </div>
  )
}

export function ReservationForm({ stationId, stationName, onClose }) {
  const { user } = useUserStore()
  const { activeSubscription, fetchActiveSubscription } = useSubscriptionStore()
  const { reserve, loading } = useReservationStore()
  const { selectedStation } = useStationStore()
  const { addToast } = useUIStore()

  useEffect(() => {
    if (user && !activeSubscription) fetchActiveSubscription(user.id)
  }, [user, activeSubscription, fetchActiveSubscription])

  const [selectedType, setSelectedType] = useState(null)
  const [completedReservation, setCompletedReservation] = useState(null)

  const station = selectedStation

  // Reserva completada: mostrar confirmacion con countdown
  if (completedReservation) {
    const cfg = TYPE_CONFIG[completedReservation.type]
    const Icon = cfg.icon

    return (
      <DialogShell title="Reserva confirmada" onClose={onClose}>
        <div className="flex flex-col items-center py-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-color-success-soft flex items-center justify-center">
            <Check size={32} className="text-color-success" />
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-color-text mb-1">
              Tu lugar esta reservado
            </h3>
            <p className="text-sm text-color-text-muted max-w-xs">
              Tenes {RESERVATION_TTL_MINUTES} minutos para acercarte a la estacion y reclamar tu equipamiento.
            </p>
          </div>

          {/* Detalle de la reserva */}
          <div className="w-full p-4 rounded-2xl border border-color-border bg-color-bg-card space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cfg.bgClass} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={cfg.colorClass} />
              </div>
              <div className="text-left flex-1">
                <div className="font-display text-sm font-bold text-color-text">
                  {TIERS[completedReservation.type]?.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-color-text-muted">
                  <MapPin size={12} />
                  {stationName}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-color-border">
              <span className="text-xs text-color-text-muted">Tiempo restante</span>
              <CountdownSuccess expiresAt={completedReservation.expiresAt} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-colors"
          >
            Entendido
          </button>
        </div>
      </DialogShell>
    )
  }

  // Sin usuario logueado
  if (!user) {
    return (
      <DialogShell title="Reservar equipamiento" onClose={onClose}>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-color-error-soft flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-color-error" />
          </div>
          <h3 className="font-display text-base font-semibold text-color-text mb-1">
            Inicio de sesion requerido
          </h3>
          <p className="text-sm text-color-text-muted max-w-xs">
            Inicia sesion para poder reservar equipamiento
          </p>
        </div>
      </DialogShell>
    )
  }

  // Sin suscripcion activa
  if (!activeSubscription) {
    return (
      <DialogShell title="Reservar equipamiento" onClose={onClose}>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-color-warning-soft flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-color-warning" />
          </div>
          <h3 className="font-display text-base font-semibold text-color-text mb-1">
            Necesitas una suscripcion
          </h3>
          <p className="text-sm text-color-text-muted max-w-xs mb-4">
            Para reservar equipamiento necesitas un plan activo. Elegi tu plan desde la seccion Planes.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-colors"
          >
            Entendido
          </button>
        </div>
      </DialogShell>
    )
  }

  const basicAvailable = station?.available?.basic ?? 0
  const premiumAvailable = station?.available?.premium ?? 0

  // Determinar si el tier de la suscripcion permite reservar cada tipo
  const subTier = activeSubscription.tier // 'basic' | 'premium'
  const canReservePremium = subTier === 'premium'

  const handleReserve = async () => {
    if (!selectedType) return
    try {
      const reservation = await reserve({
        userId: user.id,
        stationId,
        type: selectedType,
      })
      addToast({ variant: 'success', message: 'Reserva confirmada. Tenes 30 min para reclamarla.' })
      setCompletedReservation(reservation)
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    }
  }

  return (
    <DialogShell title={`Reservar en ${stationName}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Info */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-color-accent-soft/40 text-xs text-color-accent">
          <Clock size={14} className="shrink-0" />
          <span>
            La reserva dura <strong>{RESERVATION_TTL_MINUTES} minutos</strong>. Acercate a la estacion para retirar.
          </span>
        </div>

        {/* Instruccion */}
        <p className="text-sm text-color-text-muted">
          Elegi el tipo de equipamiento que queres reservar:
        </p>

        {/* Opciones de tipo */}
        <div className="space-y-3">
          {Object.entries(TIERS).map(([key, tier]) => {
            const cfg = TYPE_CONFIG[key]
            const Icon = cfg.icon
            const available = key === 'basic' ? basicAvailable : premiumAvailable
            const isDisabled = available === 0 || (key === 'premium' && !canReservePremium)
            const isSelected = selectedType === key
            const needsUpgrade = key === 'premium' && !canReservePremium

            return (
              <button
                key={key}
                onClick={() => !isDisabled && setSelectedType(key)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? `${cfg.bgClass} ${cfg.borderActive}`
                    : isDisabled
                    ? 'bg-color-bg-card-hover border-color-border opacity-50 cursor-not-allowed'
                    : 'bg-color-bg-card border-color-border hover:border-color-border-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bgClass} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={cfg.colorClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-display text-sm font-bold text-color-text">
                        {tier.name}
                      </span>
                      {needsUpgrade ? (
                        <span className="text-xs font-medium text-color-sun">
                          Requiere plan Premium
                        </span>
                      ) : (
                        <span className={`text-xs font-medium ${
                          available > 0 ? 'text-color-success' : 'text-color-error'
                        }`}>
                          {available > 0 ? `${available} disponibles` : 'Sin stock'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-color-text-muted">{tier.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info de suscripcion activa */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-color-success-soft/60 text-xs text-color-success">
          <span className="font-medium">
            Plan activo: {TIERS[activeSubscription.tier]?.name}
          </span>
        </div>

        {/* Boton de confirmar */}
        <button
          onClick={handleReserve}
          disabled={!selectedType || loading}
          className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedType ? TYPE_CONFIG[selectedType].btnClass : 'bg-color-accent hover:bg-color-accent-hover'
          }`}
          style={{ boxShadow: selectedType ? TYPE_CONFIG[selectedType].shadow : undefined }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Timer size={16} />
              Confirma reserva ({RESERVATION_TTL_MINUTES} min)
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </DialogShell>
  )
}
