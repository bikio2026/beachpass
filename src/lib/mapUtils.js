import L from 'leaflet'

const COLORS = {
  available: '#10b981',
  'few-left': '#f59e0b',
  full: '#ef4444',
  closed: '#9ca3af',
}

function getStationStatus(station) {
  if (station.status !== 'active') return 'closed'
  const total = (station.available?.basic || 0) + (station.available?.premium || 0)
  const cap = (station.capacity?.basic || 0) + (station.capacity?.premium || 0)
  if (cap === 0) return 'closed'
  const ratio = total / cap
  if (ratio > 0.3) return 'available'
  if (ratio > 0) return 'few-left'
  return 'full'
}

export function createStationIcon(station, isSelected = false) {
  const status = getStationStatus(station)
  const color = COLORS[status]
  const total = (station.available?.basic || 0) + (station.available?.premium || 0)
  const size = isSelected ? 44 : 36
  const ring = isSelected ? `<circle cx="20" cy="20" r="19" fill="none" stroke="${color}" stroke-width="2" opacity="0.4"/>` : ''

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      <circle cx="20" cy="20" r="15" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="20" y="20" text-anchor="middle" dominant-baseline="central"
            fill="white" font-family="Inter,system-ui" font-size="11" font-weight="700">
        ${station.status !== 'active' ? '✕' : total}
      </text>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'station-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export function getUserLocationIcon() {
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" opacity="0.2"/>
      <circle cx="12" cy="12" r="5" fill="#3b82f6" stroke="white" stroke-width="2"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
