import { useState, useEffect } from 'react'
import {
  Umbrella, Crown, MapPin, Check, ChevronRight, Loader2, ArrowRight,
} from 'lucide-react'
import { DialogShell } from '../ui/DialogShell'
import { useRentalStore } from '../../store/rentalStore'
import { useStationStore } from '../../store/stationStore'
import { useUIStore } from '../../store/uiStore'
import { formatDateTime } from '../../lib/formatters'
import { TIERS } from '../../lib/constants'

export function ReturnFlow({ rental, onClose }) {
  const { returnRental, loading } = useRentalStore()
  const { stations, fetchStations } = useStationStore()
  const { addToast, selectedCity } = useUIStore()

  const [selectedStation, setSelectedStation] = useState(null)
  const [completed, setCompleted] = useState(null)

  useEffect(() => {
    if (stations.length === 0) fetchStations(selectedCity)
  }, [stations.length, fetchStations, selectedCity])

  const isPremium = rental.type === 'premium'
  const Icon = isPremium ? Crown : Umbrella
  const tier = TIERS[rental.type]

  // Filtrar estaciones activas
  const activeStations = stations.filter((s) => s.status === 'active')

  const handleReturn = async () => {
    if (!selectedStation) return
    try {
      const result = await returnRental(rental.id, selectedStation)
      addToast({ variant: 'success', message: 'Devolucion confirmada. Gracias por usar BeachPass.' })
      setCompleted(result)
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    }
  }

  // Pantalla de confirmacion post-devolucion
  if (completed) {
    return (
      <DialogShell title="Devolucion completada" onClose={onClose}>
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-color-success-soft flex items-center justify-center mb-4">
            <Check size={30} className="text-color-success" />
          </div>
          <h3 className="font-display text-lg font-bold text-color-text mb-1">
            Devolucion exitosa
          </h3>
          <p className="text-sm text-color-text-muted mb-6 text-center">
            Tu equipamiento fue devuelto correctamente
          </p>

          {/* Resumen */}
          <div className="w-full rounded-2xl border border-color-border bg-color-bg-card p-4 space-y-2.5 mb-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPremium ? 'bg-color-sun-soft' : 'bg-color-accent-soft'
              }`}>
                <Icon size={16} className={isPremium ? 'text-color-tier-premium' : 'text-color-tier-basic'} />
              </div>
              <span className="font-medium text-color-text">{tier?.name}</span>
            </div>

            <div className="h-px bg-color-border" />

            <div className="flex items-center gap-2 text-sm text-color-text-muted">
              <MapPin size={13} className="text-color-accent shrink-0" />
              <span>Retiro:</span>
              <span className="text-color-text font-medium">{rental.stationName || rental.stationId}</span>
            </div>

            <div className="flex items-center justify-center text-color-text-dim">
              <ArrowRight size={14} />
            </div>

            <div className="flex items-center gap-2 text-sm text-color-text-muted">
              <MapPin size={13} className="text-color-success shrink-0" />
              <span>Devolucion:</span>
              <span className="text-color-text font-medium">
                {completed.returnStationName || completed.returnStationId || selectedStation}
              </span>
            </div>

            {completed.returnTime && (
              <>
                <div className="h-px bg-color-border" />
                <div className="text-xs text-color-text-muted text-center">
                  {formatDateTime(completed.returnTime)}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' }}
          >
            Cerrar
          </button>
        </div>
      </DialogShell>
    )
  }

  return (
    <DialogShell title="Devolver equipamiento" onClose={onClose}>
      <div className="space-y-5">
        {/* Info del alquiler actual */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-color-bg-card-hover">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isPremium ? 'bg-color-sun-soft' : 'bg-color-accent-soft'
          }`}>
            <Icon size={18} className={isPremium ? 'text-color-tier-premium' : 'text-color-tier-basic'} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold text-color-text">{tier?.name}</span>
            <div className="flex items-center gap-1.5 text-xs text-color-text-muted">
              <MapPin size={11} />
              <span>Retirado en {rental.stationName || rental.stationId}</span>
            </div>
          </div>
        </div>

        {/* Seleccion de estacion de devolucion */}
        <div>
          <label className="block text-sm font-semibold text-color-text mb-2">
            Elegí la estacion de devolucion
          </label>
          <div className="space-y-2 max-h-48 overflow-auto pr-1">
            {activeStations.map((station) => (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                  selectedStation === station.id
                    ? 'border-color-accent bg-color-accent-soft/30'
                    : 'border-color-border hover:border-color-border-hover bg-color-bg-card'
                }`}
              >
                <MapPin size={16} className={
                  selectedStation === station.id ? 'text-color-accent' : 'text-color-text-dim'
                } />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-color-text block truncate">
                    {station.name}
                  </span>
                  <span className="text-[11px] text-color-text-muted">{station.zone}</span>
                </div>
                {selectedStation === station.id && (
                  <Check size={16} className="text-color-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
          {activeStations.length === 0 && (
            <p className="text-sm text-color-text-muted text-center py-4">
              Cargando estaciones...
            </p>
          )}
        </div>

        {/* Boton confirmar */}
        <button
          onClick={handleReturn}
          disabled={!selectedStation || loading}
          className="w-full py-3.5 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Confirma devolucion
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </DialogShell>
  )
}
