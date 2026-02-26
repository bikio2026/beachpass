import express from 'express'
import cors from 'cors'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import * as stations from './stationManager.js'
import * as users from './userManager.js'
import * as subs from './subscriptionManager.js'
import * as rentals from './rentalManager.js'
import * as reservations from './reservationManager.js'
import * as stats from './statsCalculator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

// Auto-seed si no hay datos
if (!existsSync(join(DATA_DIR, 'stations.json'))) {
  console.log('⏳ Datos no encontrados, ejecutando seed...')
  execSync('node server/seed.js', { cwd: join(__dirname, '..'), stdio: 'inherit' })
}

const app = express()
app.use(cors())
app.use(express.json())

// ── Estaciones ────────────────────────────────
app.get('/api/stations', (req, res) => {
  try {
    const data = stations.listStations(req.query)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stations/:id', (req, res) => {
  try {
    const station = stations.getStation(req.params.id)
    if (!station) return res.status(404).json({ error: 'Estación no encontrada' })
    res.json(station)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stations/:id/availability', (req, res) => {
  try {
    const avail = stations.getStationAvailability(req.params.id)
    res.json(avail)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/stations', (req, res) => {
  try {
    const station = stations.createStation(req.body)
    res.status(201).json(station)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/stations/:id', (req, res) => {
  try {
    const station = stations.updateStation(req.params.id, req.body)
    if (!station) return res.status(404).json({ error: 'Estación no encontrada' })
    res.json(station)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/stations/:id', (req, res) => {
  try {
    const ok = stations.deleteStation(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Estación no encontrada' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Planes (estáticos) ────────────────────────
app.get('/api/plans', (req, res) => {
  const plans = [
    { id: 'basic-daily',     tier: 'basic',   period: 'daily',   price: 5,   label: 'Día' },
    { id: 'basic-weekly',    tier: 'basic',   period: 'weekly',  price: 25,  label: 'Semana' },
    { id: 'basic-monthly',   tier: 'basic',   period: 'monthly', price: 50,  label: 'Mes' },
    { id: 'basic-annual',    tier: 'basic',   period: 'annual',  price: 120, label: 'Anual' },
    { id: 'premium-daily',   tier: 'premium', period: 'daily',   price: 12,  label: 'Día' },
    { id: 'premium-weekly',  tier: 'premium', period: 'weekly',  price: 60,  label: 'Semana' },
    { id: 'premium-monthly', tier: 'premium', period: 'monthly', price: 100, label: 'Mes' },
    { id: 'premium-annual',  tier: 'premium', period: 'annual',  price: 300, label: 'Anual' },
  ]
  res.json(plans)
})

// ── Auth / Usuarios ──────────────────────────
app.post('/api/auth/register', (req, res) => {
  try {
    const user = users.register(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/auth/login', (req, res) => {
  try {
    const user = users.login(req.body)
    res.json(user)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

app.get('/api/users/:id', (req, res) => {
  try {
    const user = users.getUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/users/:id', (req, res) => {
  try {
    const user = users.updateUser(req.params.id, req.body)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Suscripciones ────────────────────────────
app.get('/api/subscriptions', (req, res) => {
  try {
    const data = subs.listSubscriptions(req.query)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/subscriptions/active/:userId', (req, res) => {
  try {
    const sub = subs.getActiveSubscription(req.params.userId)
    res.json(sub)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/subscriptions', (req, res) => {
  try {
    const sub = subs.createSubscription(req.body)
    res.status(201).json(sub)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/subscriptions/:id/cancel', (req, res) => {
  try {
    const sub = subs.cancelSubscription(req.params.id)
    res.json(sub)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Alquileres ──────────────────────────────
app.post('/api/rentals/pickup', (req, res) => {
  try {
    const rental = rentals.pickupRental(req.body)
    res.status(201).json(rental)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/rentals/:id/return', (req, res) => {
  try {
    const rental = rentals.returnRental(req.params.id, req.body.returnStationId)
    res.json(rental)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/rentals/active/:userId', (req, res) => {
  try {
    const data = rentals.getActiveRentals(req.params.userId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/rentals/user/:userId', (req, res) => {
  try {
    const data = rentals.getUserRentals(req.params.userId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/rentals/qr/:token', (req, res) => {
  try {
    const rental = rentals.getRentalByQR(req.params.token)
    if (!rental) return res.status(404).json({ error: 'Rental no encontrado' })
    res.json(rental)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/rentals/:id', (req, res) => {
  try {
    const rental = rentals.getRental(req.params.id)
    if (!rental) return res.status(404).json({ error: 'Rental no encontrado' })
    res.json(rental)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Reservas ──────────────────────────────────
app.post('/api/reservations', (req, res) => {
  try {
    const reservation = reservations.createReservation(req.body)
    res.status(201).json(reservation)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/reservations/active/:userId', (req, res) => {
  try {
    const data = reservations.getActiveReservation(req.params.userId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/reservations/:id/claim', (req, res) => {
  try {
    const rental = reservations.claimReservation(req.params.id, req.body.subscriptionId)
    res.json(rental)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/reservations/:id/cancel', (req, res) => {
  try {
    const data = reservations.cancelReservation(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/reservations/:id', (req, res) => {
  try {
    const data = reservations.getReservation(req.params.id)
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Stats ───────────────────────────────────────
app.get('/api/stats/overview', (req, res) => {
  try {
    res.json(stats.getOverviewStats())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats/occupancy', (req, res) => {
  try {
    res.json(stats.getOccupancyStats(req.query.city))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats/revenue', (req, res) => {
  try {
    res.json(stats.getRevenueStats(req.query.period))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats/activity', (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30
    res.json(stats.getActivityStats(days))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Seed reset ────────────────────────────────
app.post('/api/seed/reset', (req, res) => {
  try {
    execSync('node server/seed.js', { cwd: join(__dirname, '..'), stdio: 'inherit' })
    res.json({ success: true, message: 'Datos regenerados' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Servir frontend en producción ─────────────
const DIST_DIR = join(__dirname, '..', 'dist')
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  // SPA fallback: todas las rutas no-API devuelven index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(DIST_DIR, 'index.html'))
    }
  })
}

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 3083
app.listen(PORT, () => {
  console.log(`🏖️  BeachPass API → http://localhost:${PORT}`)
})
