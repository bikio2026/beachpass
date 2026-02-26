import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_PATH = join(__dirname, '..', 'data', 'users.json')

function readJSON(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function randId() { return 'usr-' + Math.random().toString(36).slice(2, 10) }

export function register({ name, email, phone, pin }) {
  const users = readJSON(USERS_PATH)

  if (!email || !pin || pin.length !== 4) {
    throw new Error('Email y PIN de 4 dígitos son requeridos')
  }

  const existing = users.find(u => u.email === email)
  if (existing) throw new Error('Ya existe un usuario con ese email')

  const user = {
    id: randId(),
    name: name || '',
    email,
    phone: phone || '',
    pin,
    activeSubscriptionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.push(user)
  writeJSON(USERS_PATH, users)

  const { pin: _, ...safe } = user
  return safe
}

export function login({ email, pin }) {
  const users = readJSON(USERS_PATH)
  const user = users.find(u => u.email === email)

  if (!user) throw new Error('Usuario no encontrado')
  if (user.pin !== pin) throw new Error('PIN incorrecto')

  const { pin: _, ...safe } = user
  return safe
}

export function getUser(id) {
  const users = readJSON(USERS_PATH)
  const user = users.find(u => u.id === id)
  if (!user) return null
  const { pin: _, ...safe } = user
  return safe
}

export function updateUser(id, updates) {
  const users = readJSON(USERS_PATH)
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return null

  const allowed = ['name', 'phone', 'pin']
  for (const key of allowed) {
    if (updates[key] !== undefined) users[idx][key] = updates[key]
  }
  users[idx].updatedAt = new Date().toISOString()
  writeJSON(USERS_PATH, users)

  const { pin: _, ...safe } = users[idx]
  return safe
}

export function setActiveSubscription(userId, subscriptionId) {
  const users = readJSON(USERS_PATH)
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return
  users[idx].activeSubscriptionId = subscriptionId
  users[idx].updatedAt = new Date().toISOString()
  writeJSON(USERS_PATH, users)
}
