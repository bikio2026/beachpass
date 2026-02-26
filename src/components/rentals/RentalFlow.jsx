import { useState, useEffect } from 'react'
import { Umbrella, Crown, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { DialogShell } from '../ui/DialogShell'
import { QRDisplay } from './QRDisplay'
import { useUserStore } from '../../store/userStore'
import { useSubscriptionStore } from '../../store/subscriptionStore'
import { useRentalStore } from '../../store/rentalStore'
import { useStationStore } from '../../store/stationStore'
import { useUIStore } from '../../store/uiStore'
import { TIERS } from '../../lib/constants'

const TYPE_CONFIG = {
  basic: {
    icon: Umbrella,
    colorClass: 'text-tier-basic',
    bgClass: 'bg-accent-soft/50',
    borderActive: 'border-accent',
    btnClass: 'bg-accent hover:bg-accent-hover',
    shadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
  },
  premium: {
    icon: Crown,
    colorClass: 'text-tier-premium',
    bgClass: 'bg-sun-soft/50',
    borderActive: 'border-sun',
    btnClass: 'bg-sun hover:bg-sun-hover',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
}

export function RentalFlow({ stationId, stationName, onClose }) {
  const { user } = useUserStore()
  const { activeSubscription, fetchActiveSubscription } = useSubscriptionStore()
  const { pickup, loading } = useRentalStore()
  const { selectedStation } = useStationStore()
  const { addToast } = useUIStore()

  useEffect(() => {
    if (user && !activeSubscription) fetchActiveSubscription(user.id)
  }, [user, activeSubscription, fetchActiveSubscription])

  const [selectedType, setSelectedType] = useState(null)
  const [completedRental, setCompletedRental] = useState(null)

  const station = selectedStation

  // Si ya se completo el retiro, mostrar QR
  if (completedRental) {
    return (
      <DialogShell title="Tu codigo QR" onClose={onClose}>
        <QRDisplay rental={completedRental} onClose={onClose} />
      </DialogShell>
    )
  }

  // Sin usuario logueado
  if (!user) {
    return (
      <DialogShell title="Alquilar equipamiento" onClose={onClose}>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-error-soft flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-error" />
          </div>
          <h3 className="font-display text-base font-semibold text-text mb-1">
            Inicio de sesion requerido
          </h3>
          <p className="text-sm text-text-muted max-w-xs">
            Inicia sesion para poder retirar equipamiento
          </p>
        </div>
      </DialogShell>
    )
  }

  // Sin suscripcion activa
  if (!activeSubscription) {
    return (
      <DialogShell title="Alquilar equipamiento" onClose={onClose}>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-warning-soft flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-warning" />
          </div>
          <h3 className="font-display text-base font-semibold text-text mb-1">
            Necesitas una suscripcion
          </h3>
          <p className="text-sm text-text-muted max-w-xs mb-4">
            Para retirar equipamiento necesitas un plan activo. Elegí tu plan desde la seccion Planes.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            Entendido
          </button>
        </div>
      </DialogShell>
    )
  }

  const basicAvailable = station?.available?.basic ?? 0
  const premiumAvailable = station?.available?.premium ?? 0

  const handlePickup = async () => {
    if (!selectedType) return
    try {
      const rental = await pickup({
        userId: user.id,
        subscriptionId: activeSubscription.id,
        stationId,
        type: selectedType,
      })
      addToast({ variant: 'success', message: 'Retiro confirmado. Mostra el QR en la estacion.' })
      setCompletedRental(rental)
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    }
  }

  return (
    <DialogShell title={`Retirar en ${stationName}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Instruccion */}
        <p className="text-sm text-text-muted">
          Elegí el tipo de equipamiento que queres retirar:
        </p>

        {/* Opciones de tipo */}
        <div className="space-y-3">
          {Object.entries(TIERS).map(([key, tier]) => {
            const cfg = TYPE_CONFIG[key]
            const Icon = cfg.icon
            const available = key === 'basic' ? basicAvailable : premiumAvailable
            const isDisabled = available === 0
            const isSelected = selectedType === key

            return (
              <button
                key={key}
                onClick={() => !isDisabled && setSelectedType(key)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? `${cfg.bgClass} ${cfg.borderActive}`
                    : isDisabled
                    ? 'bg-bg-card-hover border-border opacity-50 cursor-not-allowed'
                    : 'bg-bg-card border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bgClass} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={cfg.colorClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-display text-sm font-bold text-text">
                        {tier.name}
                      </span>
                      <span className={`text-xs font-medium ${
                        available > 0 ? 'text-success' : 'text-error'
                      }`}>
                        {available > 0 ? `${available} disponibles` : 'Sin stock'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{tier.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info de suscripcion activa */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success-soft/60 text-xs text-success">
          <span className="font-medium">
            Plan activo: {TIERS[activeSubscription.tier]?.name}
          </span>
        </div>

        {/* Boton de confirmar */}
        <button
          onClick={handlePickup}
          disabled={!selectedType || loading}
          className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedType ? TYPE_CONFIG[selectedType].btnClass : 'bg-accent hover:bg-accent-hover'
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
              Confirma retiro
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </DialogShell>
  )
}
