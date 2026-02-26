import { useEffect, useState } from 'react'
import {
  X, MapPin, Clock, Umbrella, Crown,
  Wifi, ShowerHead, Car, Shield, ChevronRight,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useStationStore } from '../../store/stationStore'
import { StatusBadge } from '../ui/StatusBadge'
import { AvailabilityBar } from './AvailabilityBar'
import { RentalFlow } from '../rentals/RentalFlow'
import { ReservationForm } from '../reservations/ReservationForm'

const AMENITY_ICONS = {
  wifi: Wifi,
  showers: ShowerHead,
  parking: Car,
  lifeguard: Shield,
  lockers: Shield,
  toilets: Shield,
}

const AMENITY_LABELS = {
  wifi: 'WiFi',
  showers: 'Duchas',
  parking: 'Parking',
  lifeguard: 'Socorrista',
  lockers: 'Taquillas',
  toilets: 'Baños',
}

export function StationDetail() {
  const { selectedStationId, clearStation } = useUIStore()
  const { selectedStation, fetchStation } = useStationStore()
  const [showRental, setShowRental] = useState(false)
  const [showReservation, setShowReservation] = useState(false)

  useEffect(() => {
    if (selectedStationId) fetchStation(selectedStationId)
  }, [selectedStationId, fetchStation])

  const station = selectedStation

  if (!station) {
    return (
      <div className="absolute inset-x-0 bottom-0 md:inset-x-auto md:top-0 md:right-0 md:bottom-0 md:w-full md:max-w-sm z-[1000] animate-slide-up md:animate-slide-in-right">
        <div
          className="h-[55vh] md:h-full m-3 rounded-2xl p-6 flex items-center justify-center"
          style={{
            background: '#ffffff',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          }}
        >
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-0 bottom-0 md:inset-x-auto md:top-0 md:right-0 md:bottom-0 md:w-full md:max-w-sm z-[1000] animate-slide-up md:animate-slide-in-right">
      <div
        className="max-h-[75vh] md:max-h-none md:h-full m-3 rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={station.status} />
            </div>
            <button
              onClick={clearStation}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-card-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="font-display text-lg font-bold text-text leading-tight mb-1">
            {station.name}
          </h2>
          <div className="flex items-center gap-1.5 text-text-muted">
            <MapPin size={13} />
            <span className="text-xs">{station.zone} — {station.address}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
          {/* Availability */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-dim mb-3">
              Disponibilidad
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-accent-soft/50">
                <div className="flex items-center gap-2 mb-2">
                  <Umbrella size={15} className="text-tier-basic" />
                  <span className="text-xs font-semibold text-text">Basic</span>
                  <span className="text-[10px] text-text-dim ml-auto">Sombrilla compacta</span>
                </div>
                <AvailabilityBar
                  available={station.available?.basic || 0}
                  total={station.capacity?.basic || 0}
                />
              </div>

              <div className="p-3 rounded-xl bg-sun-soft/50">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={15} className="text-tier-premium" />
                  <span className="text-xs font-semibold text-text">Premium</span>
                  <span className="text-[10px] text-text-dim ml-auto">Sombrilla UV + hamacas</span>
                </div>
                <AvailabilityBar
                  available={station.available?.premium || 0}
                  total={station.capacity?.premium || 0}
                />
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">
              Horario
            </h3>
            <div className="flex items-center gap-2 text-sm text-text">
              <Clock size={15} className="text-accent" />
              <span>{station.openHours}</span>
            </div>
          </div>

          {/* Amenities */}
          {station.amenities?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-dim mb-2">
                Servicios
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] || Shield
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-card-hover text-xs text-text-muted"
                    >
                      <Icon size={13} />
                      <span>{AMENITY_LABELS[a] || a}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowRental(true)}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' }}
          >
            Alquilar aquí
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setShowReservation(true)}
            className="w-full py-2.5 rounded-xl bg-bg-card-hover text-text-muted font-medium text-sm hover:text-text transition-colors"
          >
            Reservar (30 min)
          </button>
        </div>
      </div>

      {/* Rental Flow Dialog */}
      {showRental && (
        <RentalFlow
          stationId={station.id}
          stationName={station.name}
          onClose={() => setShowRental(false)}
        />
      )}

      {/* Reservation Dialog */}
      {showReservation && (
        <ReservationForm
          stationId={station.id}
          stationName={station.name}
          onClose={() => setShowReservation(false)}
        />
      )}
    </div>
  )
}
