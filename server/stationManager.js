import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATIONS_PATH = join(__dirname, '..', 'data', 'stations.json')
const EQUIPMENT_PATH = join(__dirname, '..', 'data', 'equipment.json')

function readJSON(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

// Recalcular disponibilidad de una estacion basandose en el equipamiento
function recalcAvailability(station, allEquipment) {
  const stationEq = allEquipment.filter(e => e.stationId === station.id)
  station.available = {
    basic: stationEq.filter(e => e.type === 'basic' && e.status === 'available').length,
    premium: stationEq.filter(e => e.type === 'premium' && e.status === 'available').length,
  }
  return station
}

export function listStations(query = {}) {
  let stations = readJSON(STATIONS_PATH)
  const equipment = readJSON(EQUIPMENT_PATH)

  // Recalcular disponibilidad real
  stations = stations.map(s => recalcAvailability(s, equipment))

  if (query.city) {
    stations = stations.filter(s => s.city === query.city)
  }
  if (query.status) {
    stations = stations.filter(s => s.status === query.status)
  }

  return stations
}

export function getStation(id) {
  const stations = readJSON(STATIONS_PATH)
  const equipment = readJSON(EQUIPMENT_PATH)
  const station = stations.find(s => s.id === id)
  if (!station) return null
  return recalcAvailability(station, equipment)
}

export function getStationAvailability(id) {
  const equipment = readJSON(EQUIPMENT_PATH)
  const stationEq = equipment.filter(e => e.stationId === id)
  return {
    basic: {
      available: stationEq.filter(e => e.type === 'basic' && e.status === 'available').length,
      rented: stationEq.filter(e => e.type === 'basic' && e.status === 'rented').length,
      reserved: stationEq.filter(e => e.type === 'basic' && e.status === 'reserved').length,
      maintenance: stationEq.filter(e => e.type === 'basic' && e.status === 'maintenance').length,
      total: stationEq.filter(e => e.type === 'basic').length,
    },
    premium: {
      available: stationEq.filter(e => e.type === 'premium' && e.status === 'available').length,
      rented: stationEq.filter(e => e.type === 'premium' && e.status === 'rented').length,
      reserved: stationEq.filter(e => e.type === 'premium' && e.status === 'reserved').length,
      maintenance: stationEq.filter(e => e.type === 'premium' && e.status === 'maintenance').length,
      total: stationEq.filter(e => e.type === 'premium').length,
    },
  }
}

export function createStation(data) {
  const stations = readJSON(STATIONS_PATH)
  const id = `st-${data.city?.slice(0, 3) || 'xxx'}-${String(stations.length + 1).padStart(3, '0')}`
  const station = {
    id,
    name: data.name,
    city: data.city,
    zone: data.zone || '',
    lat: data.lat,
    lng: data.lng,
    address: data.address || '',
    capacity: data.capacity || { basic: 10, premium: 5 },
    available: { basic: 0, premium: 0 },
    status: 'active',
    openHours: data.openHours || '08:00–20:00',
    amenities: data.amenities || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  stations.push(station)
  writeJSON(STATIONS_PATH, stations)
  return station
}

export function updateStation(id, updates) {
  const stations = readJSON(STATIONS_PATH)
  const idx = stations.findIndex(s => s.id === id)
  if (idx === -1) return null
  const allowed = ['name', 'zone', 'lat', 'lng', 'address', 'capacity', 'status', 'openHours', 'amenities']
  for (const key of allowed) {
    if (updates[key] !== undefined) stations[idx][key] = updates[key]
  }
  stations[idx].updatedAt = new Date().toISOString()
  writeJSON(STATIONS_PATH, stations)
  return stations[idx]
}

export function deleteStation(id) {
  let stations = readJSON(STATIONS_PATH)
  const before = stations.length
  stations = stations.filter(s => s.id !== id)
  if (stations.length === before) return false
  writeJSON(STATIONS_PATH, stations)
  return true
}
