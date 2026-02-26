import { useState, useEffect } from 'react'
import { Umbrella, Crown, MapPin, Clock, QrCode, ArrowRight } from 'lucide-react'
import { useRentalStore } from '../../store/rentalStore'
import { useUserStore } from '../../store/userStore'
import { useUIStore } from '../../store/uiStore'
import { formatTime } from '../../lib/formatters'
import { TIERS } from '../../lib/constants'
import { DialogShell } from '../ui/DialogShell'
import { QRDisplay } from './QRDisplay'
import { ReturnFlow } from './ReturnFlow'

function ElapsedTime({ since }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(since).getTime()
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const remainMins = mins % 60
      if (hours > 0) {
        setElapsed(`${hours}h ${remainMins}m`)
      } else {
        setElapsed(`${remainMins}m`)
      }
    }
    update()
    const interval = setInterval(update, 30000) // cada 30s
    return () => clearInterval(interval)
  }, [since])

  return <span>{elapsed}</span>
}

export function ActiveRental() {
  const { user } = useUserStore()
  const { activeRentals, fetchActiveRentals } = useRentalStore()
  const { addToast } = useUIStore()
  const [showQR, setShowQR] = useState(null)
  const [showReturn, setShowReturn] = useState(null)

  useEffect(() => {
    if (user) fetchActiveRentals(user.id)
  }, [user, fetchActiveRentals])

  if (!user || activeRentals.length === 0) return null

  return (
    <>
      <div className="space-y-3">
        {activeRentals.map((rental) => {
          const isPremium = rental.type === 'premium'
          const Icon = isPremium ? Crown : Umbrella
          const tier = TIERS[rental.type]

          return (
            <div
              key={rental.id}
              className="bg-bg-card rounded-2xl border border-border p-4"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isPremium ? 'bg-sun-soft' : 'bg-accent-soft'
                }`}>
                  <Icon size={20} className={isPremium ? 'text-tier-premium' : 'text-tier-basic'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-bold text-text">
                    {tier?.name || rental.type} en uso
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPin size={11} />
                    <span>{rental.stationName || rental.stationId}</span>
                  </div>
                </div>
                {/* Boton QR */}
                <button
                  onClick={() => setShowQR(rental)}
                  className="p-2 rounded-xl bg-accent-soft text-accent hover:bg-accent hover:text-white transition-colors"
                  title="Ver QR"
                >
                  <QrCode size={18} />
                </button>
              </div>

              {/* Tiempo */}
              <div className="flex items-center gap-4 mb-4 px-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={12} className="text-accent" />
                  <span>Retiro: {formatTime(rental.pickupTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                  <Clock size={12} />
                  <ElapsedTime since={rental.pickupTime} />
                </div>
              </div>

              {/* Boton Devolver */}
              <button
                onClick={() => setShowReturn(rental)}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' }}
              >
                Devolver
                <ArrowRight size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Dialog QR */}
      {showQR && (
        <DialogShell title="Tu codigo QR" onClose={() => setShowQR(null)}>
          <QRDisplay rental={showQR} onClose={() => setShowQR(null)} />
        </DialogShell>
      )}

      {/* Dialog Devolucion */}
      {showReturn && (
        <ReturnFlow rental={showReturn} onClose={() => setShowReturn(null)} />
      )}
    </>
  )
}
