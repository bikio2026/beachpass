import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { setActiveSubscription } from './userManager.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUBS_PATH = join(__dirname, '..', 'data', 'subscriptions.json')

function readJSON(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function randId() { return 'sub-' + Math.random().toString(36).slice(2, 10) }

const PERIOD_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  annual: 365,
}

const PRICES = {
  'basic-daily': 5,
  'basic-weekly': 25,
  'basic-monthly': 50,
  'basic-annual': 120,
  'premium-daily': 12,
  'premium-weekly': 60,
  'premium-monthly': 100,
  'premium-annual': 300,
}

export function createSubscription({ userId, tier, period, city }) {
  const subs = readJSON(SUBS_PATH)

  if (!userId || !tier || !period) {
    throw new Error('userId, tier y period son requeridos')
  }

  // Verificar que no tenga una suscripcion activa
  const active = subs.find(s => s.userId === userId && s.status === 'active')
  if (active) throw new Error('Ya tenés una suscripción activa')

  const priceKey = `${tier}-${period}`
  const price = PRICES[priceKey]
  if (!price) throw new Error('Plan no válido')

  const days = PERIOD_DAYS[period]
  const now = new Date()
  const end = new Date(now.getTime() + days * 86400000)

  const sub = {
    id: randId(),
    userId,
    tier,
    period,
    price,
    status: 'active',
    city: city || 'barcelona',
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  subs.push(sub)
  writeJSON(SUBS_PATH, subs)

  // Actualizar usuario
  setActiveSubscription(userId, sub.id)

  return sub
}

export function getActiveSubscription(userId) {
  const subs = readJSON(SUBS_PATH)
  // También verificar expiración
  const active = subs.find(s => s.userId === userId && s.status === 'active')
  if (!active) return null

  // Auto-expirar si paso la fecha
  if (new Date(active.endDate) < new Date()) {
    active.status = 'expired'
    active.updatedAt = new Date().toISOString()
    writeJSON(SUBS_PATH, subs)
    setActiveSubscription(userId, null)
    return null
  }

  return active
}

export function cancelSubscription(id) {
  const subs = readJSON(SUBS_PATH)
  const idx = subs.findIndex(s => s.id === id)
  if (idx === -1) throw new Error('Suscripción no encontrada')

  subs[idx].status = 'cancelled'
  subs[idx].updatedAt = new Date().toISOString()
  writeJSON(SUBS_PATH, subs)

  setActiveSubscription(subs[idx].userId, null)

  return subs[idx]
}

export function getUserSubscriptions(userId) {
  const subs = readJSON(SUBS_PATH)
  return subs.filter(s => s.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function listSubscriptions(query = {}) {
  let subs = readJSON(SUBS_PATH)
  if (query.userId) subs = subs.filter(s => s.userId === query.userId)
  if (query.status) subs = subs.filter(s => s.status === query.status)
  return subs
}
