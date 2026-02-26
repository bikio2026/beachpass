import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pickupRental } from './rentalManager.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RESERVATIONS_PATH = join(__dirname, '..', 'data', 'reservations.json')
const EQUIPMENT_PATH = join(__dirname, '..', 'data', 'equipment.json')
const STATIONS_PATH = join(__dirname, '..', 'data', 'stations.json')

const TTL_MINUTES = 30

// Buscar nombre de estacion por ID
function getStationName(stationId) {
  const stations = readJSON(STATIONS_PATH)
  const st = stations.find(s => s.id === stationId)
  return st ? st.name : stationId
}

function enrichReservation(rsv) {
  if (!rsv) return null
  return { ...rsv, stationName: getStationName(rsv.stationId) }
}

function readJSON(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function randId() { return 'rsv-' + Math.random().toString(36).slice(2, 10) }

// Recalcular disponibilidad de una estacion
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

// Expirar reservas vencidas antes de cualquier operacion
export function expireReservations() {
  const reservations = readJSON(RESERVATIONS_PATH)
  const now = new Date()
  let changed = false

  for (const rsv of reservations) {
    if (rsv.status === 'active' && new Date(rsv.expiresAt) <= now) {
      rsv.status = 'expired'
      changed = true

      // Liberar equipamiento reservado
      const equipment = readJSON(EQUIPMENT_PATH)
      const eqIdx = equipment.findIndex(e => e.id === rsv.equipmentId)
      if (eqIdx !== -1 && equipment[eqIdx].status === 'reserved') {
        equipment[eqIdx].status = 'available'
        writeJSON(EQUIPMENT_PATH, equipment)
        recalcAvailability(rsv.stationId)
      }
    }
  }

  if (changed) {
    writeJSON(RESERVATIONS_PATH, reservations)
  }

  return reservations.filter(r => r.status === 'expired' && new Date(r.expiresAt) > new Date(now.getTime() - 60000))
}

export function createReservation({ userId, stationId, type }) {
  if (!userId || !stationId || !type) {
    throw new Error('userId, stationId y type son requeridos')
  }
  if (type !== 'basic' && type !== 'premium') {
    throw new Error('type debe ser "basic" o "premium"')
  }

  // Expirar reservas vencidas primero
  expireReservations()

  // Verificar que el usuario no tenga una reserva activa
  const reservations = readJSON(RESERVATIONS_PATH)
  const existing = reservations.find(r => r.userId === userId && r.status === 'active')
  if (existing) {
    throw new Error('Ya tenes una reserva activa. Cancelala o esperá a que expire.')
  }

  // Buscar equipamiento disponible
  const equipment = readJSON(EQUIPMENT_PATH)
  const eqIdx = equipment.findIndex(
    e => e.stationId === stationId && e.type === type && e.status === 'available'
  )

  if (eqIdx === -1) {
    throw new Error('No hay equipamiento disponible de ese tipo en esta estacion')
  }

  // Marcar equipamiento como reservado
  equipment[eqIdx].status = 'reserved'
  writeJSON(EQUIPMENT_PATH, equipment)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60 * 1000)

  const reservation = {
    id: randId(),
    userId,
    stationId,
    type,
    equipmentId: equipment[eqIdx].id,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  reservations.push(reservation)
  writeJSON(RESERVATIONS_PATH, reservations)

  // Recalcular disponibilidad
  recalcAvailability(stationId)

  return enrichReservation(reservation)
}

export function claimReservation(reservationId, subscriptionId) {
  if (!reservationId || !subscriptionId) {
    throw new Error('reservationId y subscriptionId son requeridos')
  }

  // Expirar reservas vencidas primero
  expireReservations()

  const reservations = readJSON(RESERVATIONS_PATH)
  const idx = reservations.findIndex(r => r.id === reservationId)

  if (idx === -1) throw new Error('Reserva no encontrada')
  if (reservations[idx].status !== 'active') {
    throw new Error('La reserva ya no esta activa (fue cancelada o expiro)')
  }

  const rsv = reservations[idx]

  // Verificar que no haya expirado
  if (new Date(rsv.expiresAt) <= new Date()) {
    rsv.status = 'expired'
    writeJSON(RESERVATIONS_PATH, reservations)
    throw new Error('La reserva expiró')
  }

  // Liberar el equipamiento reservado para que pickupRental lo tome
  const equipment = readJSON(EQUIPMENT_PATH)
  const eqIdx = equipment.findIndex(e => e.id === rsv.equipmentId)
  if (eqIdx !== -1) {
    equipment[eqIdx].status = 'available'
    writeJSON(EQUIPMENT_PATH, equipment)
  }

  // Convertir en rental usando pickupRental
  const rental = pickupRental({
    userId: rsv.userId,
    subscriptionId,
    stationId: rsv.stationId,
    type: rsv.type,
  })

  // Marcar reserva como reclamada
  reservations[idx].status = 'claimed'
  reservations[idx].rentalId = rental.id
  writeJSON(RESERVATIONS_PATH, reservations)

  return rental
}

export function cancelReservation(reservationId) {
  const reservations = readJSON(RESERVATIONS_PATH)
  const idx = reservations.findIndex(r => r.id === reservationId)

  if (idx === -1) throw new Error('Reserva no encontrada')
  if (reservations[idx].status !== 'active') {
    throw new Error('La reserva ya no esta activa')
  }

  const rsv = reservations[idx]

  // Liberar equipamiento
  const equipment = readJSON(EQUIPMENT_PATH)
  const eqIdx = equipment.findIndex(e => e.id === rsv.equipmentId)
  if (eqIdx !== -1 && equipment[eqIdx].status === 'reserved') {
    equipment[eqIdx].status = 'available'
    writeJSON(EQUIPMENT_PATH, equipment)
  }

  // Marcar como cancelada
  reservations[idx].status = 'cancelled'
  writeJSON(RESERVATIONS_PATH, reservations)

  // Recalcular disponibilidad
  recalcAvailability(rsv.stationId)

  return reservations[idx]
}

export function getActiveReservation(userId) {
  // Expirar reservas vencidas primero
  expireReservations()

  const reservations = readJSON(RESERVATIONS_PATH)
  const active = reservations.find(r => r.userId === userId && r.status === 'active') || null
  return enrichReservation(active)
}

export function getReservation(id) {
  const reservations = readJSON(RESERVATIONS_PATH)
  return reservations.find(r => r.id === id) || null
}

export function getUserReservations(userId) {
  const reservations = readJSON(RESERVATIONS_PATH)
  return reservations
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
