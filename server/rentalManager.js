import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RENTALS_PATH = join(__dirname, '..', 'data', 'rentals.json')
const EQUIPMENT_PATH = join(__dirname, '..', 'data', 'equipment.json')
const STATIONS_PATH = join(__dirname, '..', 'data', 'stations.json')

function readJSON(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function randId() { return 'rental-' + Math.random().toString(36).slice(2, 10) }

// Recalcular disponibilidad de una estacion (misma logica que stationManager)
function recalcAvailability(stationId) {
  const stations = readJSON(STATIONS_PATH)
  const equipment = readJSON(EQUIPMENT_PATH)
  const idx = stations.findIndex(s => s.id === stationId)
  if (idx === -1) return

  const stationEq = equipment.filter(e => e.stationId === stationId)
  stations[idx].available = {
    basic: stationEq.filter(e => e.type === 'basic' && e.status === 'available').length,
    premium: stationEq.filter(e => e.type === 'premium' && e.status === 'available').length,
  }
  stations[idx].updatedAt = new Date().toISOString()
  writeJSON(STATIONS_PATH, stations)
}

// Buscar nombre de estacion por ID
function getStationName(stationId) {
  const stations = readJSON(STATIONS_PATH)
  const st = stations.find(s => s.id === stationId)
  return st ? st.name : stationId
}

// Enriquecer rental con nombres de estacion
function enrichRental(rental) {
  return {
    ...rental,
    stationName: getStationName(rental.stationId),
    returnStationName: rental.returnStationId ? getStationName(rental.returnStationId) : null,
  }
}

export function pickupRental({ userId, subscriptionId, stationId, type }) {
  if (!userId || !subscriptionId || !stationId || !type) {
    throw new Error('userId, subscriptionId, stationId y type son requeridos')
  }
  if (type !== 'basic' && type !== 'premium') {
    throw new Error('type debe ser "basic" o "premium"')
  }

  const equipment = readJSON(EQUIPMENT_PATH)
  const eqIdx = equipment.findIndex(
    e => e.stationId === stationId && e.type === type && e.status === 'available'
  )

  if (eqIdx === -1) {
    throw new Error('No hay equipamiento disponible de ese tipo')
  }

  // Marcar equipamiento como rentado
  equipment[eqIdx].status = 'rented'
  writeJSON(EQUIPMENT_PATH, equipment)

  const now = new Date().toISOString()
  const qrToken = 'qr-' + Math.random().toString(36).slice(2, 10)

  const rental = {
    id: randId(),
    userId,
    subscriptionId,
    stationId,
    stationName: getStationName(stationId),
    equipmentId: equipment[eqIdx].id,
    type,
    status: 'active',
    pickupTime: now,
    returnTime: null,
    returnStationId: null,
    returnStationName: null,
    qrToken,
  }

  const rentals = readJSON(RENTALS_PATH)
  rentals.push(rental)
  writeJSON(RENTALS_PATH, rentals)

  // Recalcular disponibilidad de la estacion de pickup
  recalcAvailability(stationId)

  return rental
}

export function returnRental(rentalId, returnStationId) {
  const rentals = readJSON(RENTALS_PATH)
  const idx = rentals.findIndex(r => r.id === rentalId)

  if (idx === -1) throw new Error('Rental no encontrado')
  if (rentals[idx].status !== 'active') throw new Error('El rental no esta activo')

  const now = new Date().toISOString()
  const pickupStationId = rentals[idx].stationId

  // Completar rental
  rentals[idx].status = 'completed'
  rentals[idx].returnTime = now
  rentals[idx].returnStationId = returnStationId
  writeJSON(RENTALS_PATH, rentals)

  // Devolver equipamiento: disponible en la estacion de devolucion
  const equipment = readJSON(EQUIPMENT_PATH)
  const eqIdx = equipment.findIndex(e => e.id === rentals[idx].equipmentId)
  if (eqIdx !== -1) {
    equipment[eqIdx].status = 'available'
    equipment[eqIdx].stationId = returnStationId
    writeJSON(EQUIPMENT_PATH, equipment)
  }

  // Agregar nombre de estacion de devolucion
  rentals[idx].returnStationName = getStationName(returnStationId)
  writeJSON(RENTALS_PATH, rentals)

  // Recalcular disponibilidad de ambas estaciones
  recalcAvailability(pickupStationId)
  if (returnStationId !== pickupStationId) {
    recalcAvailability(returnStationId)
  }

  return enrichRental(rentals[idx])
}

export function getActiveRentals(userId) {
  const rentals = readJSON(RENTALS_PATH)
  return rentals.filter(r => r.userId === userId && r.status === 'active').map(enrichRental)
}

export function getRentalByQR(qrToken) {
  const rentals = readJSON(RENTALS_PATH)
  const r = rentals.find(r => r.qrToken === qrToken) || null
  return r ? enrichRental(r) : null
}

export function getUserRentals(userId) {
  const rentals = readJSON(RENTALS_PATH)
  return rentals
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.pickupTime) - new Date(a.pickupTime))
    .map(enrichRental)
}

export function getRental(id) {
  const rentals = readJSON(RENTALS_PATH)
  const r = rentals.find(r => r.id === id) || null
  return r ? enrichRental(r) : null
}
