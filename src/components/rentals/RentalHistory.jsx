import { useEffect } from 'react'
import {
  Umbrella, Crown, MapPin, ArrowRight, Clock, History,
} from 'lucide-react'
import { useRentalStore } from '../../store/rentalStore'
import { useUserStore } from '../../store/userStore'
import { EmptyState } from '../ui/EmptyState'
import { formatDateTime } from '../../lib/formatters'
import { TIERS } from '../../lib/constants'

function durationText(pickupAt, returnedAt) {
  if (!pickupAt || !returnedAt) return '—'
  const diff = new Date(returnedAt).getTime() - new Date(pickupAt).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  if (hours > 0) return `${hours}h ${remainMins}m`
  return `${mins}m`
}

export function RentalHistory() {
  const { user } = useUserStore()
  const { history, fetchUserRentals } = useRentalStore()

  useEffect(() => {
    if (user) fetchUserRentals(user.id)
  }, [user, fetchUserRentals])

  if (!user) return null

  if (history.length === 0) {
    return (
      <EmptyState
        icon="History"
        title="Sin alquileres"
        message="Todavia no tenés alquileres completados"
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <History size={16} className="text-accent" />
        <h3 className="font-display text-sm font-bold text-text uppercase tracking-wider">
          Historial de alquileres
        </h3>
      </div>

      {history.map((rental) => {
        const isPremium = rental.type === 'premium'
        const Icon = isPremium ? Crown : Umbrella
        const tier = TIERS[rental.type]

        return (
          <div
            key={rental.id}
            className="bg-bg-card rounded-2xl border border-border p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {/* Header con tipo */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPremium ? 'bg-sun-soft' : 'bg-accent-soft'
              }`}>
                <Icon size={18} className={isPremium ? 'text-tier-premium' : 'text-tier-basic'} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-text">
                  {tier?.name || rental.type}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={11} />
                  <span>Duracion: {durationText(rental.pickupAt, rental.returnedAt)}</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${
                rental.status === 'returned'
                  ? 'bg-success-soft text-success'
                  : 'bg-warning-soft text-warning'
              }`}>
                {rental.status === 'returned' ? 'Devuelto' : 'Activo'}
              </span>
            </div>

            {/* Ruta: estacion retiro -> devolucion */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-text-muted flex-1 min-w-0">
                <MapPin size={12} className="text-accent shrink-0" />
                <span className="truncate">{rental.stationName || rental.stationId}</span>
              </div>

              <ArrowRight size={12} className="text-text-dim shrink-0" />

              <div className="flex items-center gap-1.5 text-text-muted flex-1 min-w-0">
                <MapPin size={12} className="text-success shrink-0" />
                <span className="truncate">
                  {rental.returnStationName || rental.returnStationId || '—'}
                </span>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-text-dim">
              <span>Retiro: {formatDateTime(rental.pickupAt)}</span>
              <span>Devolucion: {formatDateTime(rental.returnedAt)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
