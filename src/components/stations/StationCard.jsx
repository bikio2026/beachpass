import { MapPin, Umbrella, Crown, ChevronRight } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { AvailabilityBar } from './AvailabilityBar'
import { useUIStore } from '../../store/uiStore'
import { useStationStore } from '../../store/stationStore'

export function StationCard({ station }) {
  const selectStation = useUIStore((s) => s.selectStation)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const setMapView = useUIStore((s) => s.setMapView)
  const fetchStation = useStationStore((s) => s.fetchStation)

  const handleClick = () => {
    selectStation(station.id)
    fetchStation(station.id)
    setMapView([station.lat, station.lng], 16)
    setActiveView('map')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 bg-color-bg-card rounded-xl border border-color-border hover:border-color-accent transition-all group"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-color-accent-soft flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-color-accent" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-color-text leading-tight">
              {station.name}
            </h3>
            <p className="text-xs text-color-text-muted mt-0.5">{station.zone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={station.status} />
          <ChevronRight size={16} className="text-color-text-dim group-hover:text-color-accent transition-colors" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Umbrella size={14} className="text-color-tier-basic shrink-0" />
          <AvailabilityBar
            available={station.available?.basic || 0}
            total={station.capacity?.basic || 0}
            type="basic"
          />
        </div>
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-color-tier-premium shrink-0" />
          <AvailabilityBar
            available={station.available?.premium || 0}
            total={station.capacity?.premium || 0}
            type="premium"
          />
        </div>
      </div>
    </button>
  )
}
