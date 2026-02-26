import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

// ── Barcelona: 20 estaciones ──────────────────────────
const barcelonaStations = [
  { name: 'Barceloneta Central',   zone: 'Barceloneta',     lat: 41.3783, lng: 2.1893 },
  { name: 'Barceloneta Nord',      zone: 'Barceloneta',     lat: 41.3810, lng: 2.1920 },
  { name: 'Barceloneta Sud',       zone: 'Barceloneta',     lat: 41.3755, lng: 2.1870 },
  { name: 'Sant Sebastià',         zone: 'Sant Sebastià',   lat: 41.3745, lng: 2.1850 },
  { name: 'Sant Miquel',           zone: 'Sant Miquel',     lat: 41.3770, lng: 2.1885 },
  { name: 'Somorrostro',           zone: 'Somorrostro',     lat: 41.3835, lng: 2.1950 },
  { name: 'Nova Icària Platja',    zone: 'Nova Icària',     lat: 41.3870, lng: 2.1990 },
  { name: 'Nova Icària Est',       zone: 'Nova Icària',     lat: 41.3885, lng: 2.2010 },
  { name: 'Bogatell Oest',         zone: 'Bogatell',        lat: 41.3905, lng: 2.2040 },
  { name: 'Bogatell Central',      zone: 'Bogatell',        lat: 41.3920, lng: 2.2060 },
  { name: 'Mar Bella Platja',      zone: 'Mar Bella',       lat: 41.3945, lng: 2.2095 },
  { name: 'Mar Bella Nord',        zone: 'Mar Bella',       lat: 41.3960, lng: 2.2115 },
  { name: 'Nova Mar Bella',        zone: 'Nova Mar Bella',  lat: 41.3980, lng: 2.2140 },
  { name: 'Llevant Platja',        zone: 'Llevant',         lat: 41.4010, lng: 2.2175 },
  { name: 'Fòrum',                 zone: 'Fòrum',           lat: 41.4045, lng: 2.2215 },
  { name: 'W Hotel Platja',        zone: 'Barceloneta',     lat: 41.3690, lng: 2.1840 },
  { name: 'Passeig Marítim 1',     zone: 'Barceloneta',     lat: 41.3800, lng: 2.1910 },
  { name: 'Espigó del Gas',        zone: 'Bogatell',        lat: 41.3935, lng: 2.2075 },
  { name: 'Base Nàutica',          zone: 'Sant Sebastià',   lat: 41.3738, lng: 2.1835 },
  { name: 'Port Olímpic Platja',   zone: 'Nova Icària',     lat: 41.3855, lng: 2.1975 },
]

// ── Mallorca: 20 estaciones ──────────────────────────
const mallorcaStations = [
  { name: 'Platja de Palma Centre',  zone: 'Platja de Palma', lat: 39.5190, lng: 2.7400 },
  { name: 'Platja de Palma Est',     zone: 'Platja de Palma', lat: 39.5170, lng: 2.7450 },
  { name: 'Can Pastilla',            zone: 'Can Pastilla',    lat: 39.5230, lng: 2.7280 },
  { name: "S'Arenal Platja",         zone: "S'Arenal",        lat: 39.5100, lng: 2.7550 },
  { name: 'Cala Major',              zone: 'Cala Major',      lat: 39.5580, lng: 2.6080 },
  { name: 'Illetes Nord',            zone: 'Illetes',         lat: 39.5510, lng: 2.5890 },
  { name: 'Illetes Sud',             zone: 'Illetes',         lat: 39.5490, lng: 2.5870 },
  { name: 'Portals Nous',            zone: 'Portals Nous',    lat: 39.5400, lng: 2.5720 },
  { name: 'Magaluf Central',         zone: 'Magaluf',         lat: 39.5080, lng: 2.5370 },
  { name: 'Magaluf Sud',             zone: 'Magaluf',         lat: 39.5060, lng: 2.5350 },
  { name: 'Santa Ponça',             zone: 'Santa Ponça',     lat: 39.5070, lng: 2.4780 },
  { name: 'Peguera Platja',          zone: 'Peguera',         lat: 39.5280, lng: 2.4520 },
  { name: 'Camp de Mar',             zone: 'Camp de Mar',     lat: 39.5420, lng: 2.4300 },
  { name: 'Port de Sóller',          zone: 'Port de Sóller',  lat: 39.7940, lng: 2.6920 },
  { name: 'Cala Millor Nord',        zone: 'Cala Millor',     lat: 39.6020, lng: 3.3820 },
  { name: 'Cala Millor Centre',      zone: 'Cala Millor',     lat: 39.5980, lng: 3.3840 },
  { name: 'Alcúdia Platja',          zone: 'Alcúdia',         lat: 39.8430, lng: 3.1220 },
  { name: 'Alcúdia Port',            zone: 'Alcúdia',         lat: 39.8380, lng: 3.1300 },
  { name: "Cala d'Or",               zone: "Cala d'Or",       lat: 39.3720, lng: 3.2330 },
  { name: 'Porto Cristo',            zone: 'Porto Cristo',    lat: 39.5420, lng: 3.3310 },
]

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randId() { return Math.random().toString(36).slice(2, 10) }

// ── Generar estaciones ──────────────────────────
const stations = []
const equipment = []
let eqCounter = 1

function makeStation(raw, city, idx) {
  const id = `st-${city.slice(0, 3)}-${String(idx + 1).padStart(3, '0')}`
  const capBasic = randInt(8, 20)
  const capPremium = randInt(4, 12)

  const station = {
    id,
    name: raw.name,
    city,
    zone: raw.zone,
    lat: raw.lat,
    lng: raw.lng,
    address: `${raw.zone}, ${city === 'barcelona' ? 'Barcelona' : 'Mallorca'}`,
    capacity: { basic: capBasic, premium: capPremium },
    available: { basic: 0, premium: 0 },
    status: Math.random() < 0.9 ? 'active' : 'maintenance',
    openHours: '08:00–20:00',
    amenities: pickAmenities(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Crear equipamiento
  let availBasic = 0
  let availPremium = 0

  for (let i = 0; i < capBasic; i++) {
    const code = `${city.slice(0, 3).toUpperCase()}-B-${String(eqCounter++).padStart(4, '0')}`
    const isAvailable = Math.random() < 0.7
    if (isAvailable) availBasic++
    equipment.push({
      id: `eq-${randId()}`,
      stationId: id,
      type: 'basic',
      code,
      status: isAvailable ? 'available' : (Math.random() < 0.8 ? 'rented' : 'maintenance'),
      currentRentalId: null,
      currentReservationId: null,
      description: 'Sombrilla compacta UV',
      includes: ['small_umbrella'],
      createdAt: new Date().toISOString(),
    })
  }

  for (let i = 0; i < capPremium; i++) {
    const code = `${city.slice(0, 3).toUpperCase()}-P-${String(eqCounter++).padStart(4, '0')}`
    const isAvailable = Math.random() < 0.65
    if (isAvailable) availPremium++
    equipment.push({
      id: `eq-${randId()}`,
      stationId: id,
      type: 'premium',
      code,
      status: isAvailable ? 'available' : (Math.random() < 0.8 ? 'rented' : 'maintenance'),
      currentRentalId: null,
      currentReservationId: null,
      description: 'Sombrilla UV grande + 2 tumbonas',
      includes: ['large_uv_umbrella', 'lounger_x2'],
      createdAt: new Date().toISOString(),
    })
  }

  station.available = { basic: availBasic, premium: availPremium }
  stations.push(station)
}

function pickAmenities() {
  const all = ['showers', 'wifi', 'lockers', 'toilets', 'parking', 'lifeguard']
  return all.filter(() => Math.random() < 0.4)
}

barcelonaStations.forEach((s, i) => makeStation(s, 'barcelona', i))
mallorcaStations.forEach((s, i) => makeStation(s, 'mallorca', i))

// ── Usuarios demo ──────────────────────────
const users = [
  { id: 'usr-001', name: 'María García',   email: 'maria@demo.com',  phone: '+34 612 345 678', pin: '1234', activeSubscriptionId: 'sub-001', createdAt: new Date().toISOString() },
  { id: 'usr-002', name: 'Joan Martí',     email: 'joan@demo.com',   phone: '+34 623 456 789', pin: '5678', activeSubscriptionId: 'sub-002', createdAt: new Date().toISOString() },
  { id: 'usr-003', name: 'Laura Soler',    email: 'laura@demo.com',  phone: '+34 634 567 890', pin: '9012', activeSubscriptionId: null,      createdAt: new Date().toISOString() },
  { id: 'usr-004', name: 'Alex Fernández', email: 'alex@demo.com',   phone: '+34 645 678 901', pin: '3456', activeSubscriptionId: 'sub-003', createdAt: new Date().toISOString() },
  { id: 'usr-005', name: 'Demo User',      email: 'demo@beachpass.com', phone: '+34 600 000 000', pin: '0000', activeSubscriptionId: null,  createdAt: new Date().toISOString() },
]

// ── Suscripciones demo ──────────────────────────
const now = new Date()
const subscriptions = [
  { id: 'sub-001', userId: 'usr-001', tier: 'premium', period: 'monthly', price: 100, status: 'active',  city: 'barcelona', startDate: new Date(now - 15 * 86400000).toISOString(), endDate: new Date(now.getTime() + 15 * 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: 'sub-002', userId: 'usr-002', tier: 'basic',   period: 'weekly',  price: 25,  status: 'active',  city: 'barcelona', startDate: new Date(now - 3 * 86400000).toISOString(),  endDate: new Date(now.getTime() + 4 * 86400000).toISOString(),  createdAt: new Date().toISOString() },
  { id: 'sub-003', userId: 'usr-004', tier: 'premium', period: 'annual',  price: 300, status: 'active',  city: 'mallorca',  startDate: new Date(now - 60 * 86400000).toISOString(), endDate: new Date(now.getTime() + 305 * 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: 'sub-004', userId: 'usr-003', tier: 'basic',   period: 'daily',   price: 5,   status: 'expired', city: 'barcelona', startDate: new Date(now - 10 * 86400000).toISOString(), endDate: new Date(now - 9 * 86400000).toISOString(),            createdAt: new Date().toISOString() },
]

// ── Alquileres demo ──────────────────────────
const rentals = []
const reservations = []

// ── Escribir archivos ──────────────────────────
const files = { stations, equipment, users, subscriptions, rentals, reservations }

for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2))
  console.log(`✓ ${name}.json — ${data.length} registros`)
}

console.log(`\n✅ Seed completado: ${stations.length} estaciones, ${equipment.length} equipos`)
