import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { useUIStore } from '../../store/uiStore'
import { useStationStore } from '../../store/stationStore'
import { TILE_URL, TILE_ATTRIBUTION } from '../../lib/mapUtils'
import { StationMarker } from './StationMarker'
import { CitySelector } from './CitySelector'
import { UserLocationBtn } from './UserLocationBtn'
import { StationDetail } from '../stations/StationDetail'
import { ActiveRental } from '../rentals/ActiveRental'
import { ActiveReservation } from '../reservations/ActiveReservation'

function MapController() {
  const map = useMap()
  const { mapCenter, mapZoom } = useUIStore()

  useEffect(() => {
    map.flyTo(mapCenter, mapZoom, { duration: 1 })
  }, [mapCenter, mapZoom, map])

  return null
}

export function MapView() {
  const mapRef = useRef(null)
  const { selectedCity, selectedStationId } = useUIStore()
  const { stations, loading, fetchStations } = useStationStore()
  const { mapCenter, mapZoom } = useUIStore()

  useEffect(() => {
    fetchStations(selectedCity)
  }, [selectedCity, fetchStations])

  const activeStations = useMemo(
    () => stations.filter((s) => s.city === selectedCity),
    [stations, selectedCity]
  )

  return (
    <div className="relative flex-1 overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        ref={mapRef}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapController />

        {!loading &&
          activeStations.map((station) => (
            <StationMarker key={station.id} station={station} />
          ))}
      </MapContainer>

      {/* Floating controls */}
      <CitySelector />
      <UserLocationBtn mapRef={mapRef} />

      {/* Active rental floating card — repositioned for mobile */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:top-16 z-[1000] max-w-[300px]">
        <ActiveRental />
      </div>

      {/* Active reservation floating card */}
      <ActiveReservation />

      {/* Station count pill — above bottom nav on mobile */}
      <div
        className="absolute bottom-16 md:bottom-6 left-4 z-[1000] px-3.5 py-2 rounded-xl text-xs font-semibold text-text"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <span className="text-accent">{activeStations.length}</span>{' '}
        estaciones
      </div>

      {/* Detail panel */}
      {selectedStationId && <StationDetail />}
    </div>
  )
}
