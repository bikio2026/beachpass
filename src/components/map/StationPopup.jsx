import { Popup } from 'react-leaflet'
import { MapPin, ChevronRight, Umbrella, Crown } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useStationStore } from '../../store/stationStore'

export function StationPopup({ station }) {
  const selectStation = useUIStore((s) => s.selectStation)
  const fetchStation = useStationStore((s) => s.fetchStation)
  const totalAvail = (station.available?.basic || 0) + (station.available?.premium || 0)
  const totalCap = (station.capacity?.basic || 0) + (station.capacity?.premium || 0)

  const handleDetail = () => {
    selectStation(station.id)
    fetchStation(station.id)
  }

  return (
    <Popup>
      <div className="w-64 font-sans">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-text leading-tight">
                {station.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">{station.zone}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Umbrella size={13} className="text-tier-basic" />
              <span className="text-xs font-semibold text-text">
                {station.available?.basic || 0}
              </span>
              <span className="text-[10px] text-text-dim">
                /{station.capacity?.basic || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown size={13} className="text-tier-premium" />
              <span className="text-xs font-semibold text-text">
                {station.available?.premium || 0}
              </span>
              <span className="text-[10px] text-text-dim">
                /{station.capacity?.premium || 0}
              </span>
            </div>
          </div>

          {/* Mini availability bar */}
          <div className="w-full h-1.5 rounded-full bg-bg-input overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: totalCap > 0 ? `${(totalAvail / totalCap) * 100}%` : '0%',
                background: totalAvail / totalCap > 0.3
                  ? 'var(--color-available)'
                  : totalAvail > 0
                    ? 'var(--color-few-left)'
                    : 'var(--color-full)',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleDetail}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-accent bg-accent-soft hover:bg-accent hover:text-white transition-all border-t border-border"
        >
          Ver detalle
          <ChevronRight size={14} />
        </button>
      </div>
    </Popup>
  )
}
