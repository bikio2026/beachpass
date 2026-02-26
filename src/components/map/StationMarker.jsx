import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import { createStationIcon } from '../../lib/mapUtils'
import { useUIStore } from '../../store/uiStore'
import { StationPopup } from './StationPopup'

export function StationMarker({ station }) {
  const selectedStationId = useUIStore((s) => s.selectedStationId)
  const isSelected = selectedStationId === station.id

  const icon = useMemo(
    () => createStationIcon(station, isSelected),
    [station.available?.basic, station.available?.premium, station.status, isSelected]
  )

  return (
    <Marker position={[station.lat, station.lng]} icon={icon}>
      <StationPopup station={station} />
    </Marker>
  )
}
