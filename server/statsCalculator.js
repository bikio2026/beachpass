import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

function readJSON(name) {
  const path = join(DATA_DIR, `${name}.json`)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

// ── Occupancy: ratio rented/capacity per station ──────────
export function getOccupancyStats(city) {
  let stations = readJSON('stations')
  const equipment = readJSON('equipment')

  if (city) stations = stations.filter(s => s.city === city)

  return stations.map(s => {
    const stEq = equipment.filter(e => e.stationId === s.id)
    const totalCapacity = (s.capacity?.basic || 0) + (s.capacity?.premium || 0)
    const rented = stEq.filter(e => e.status === 'rented').length
    const available = stEq.filter(e => e.status === 'available').length
    const reserved = stEq.filter(e => e.status === 'reserved').length
    const maintenance = stEq.filter(e => e.status === 'maintenance').length

    return {
      stationId: s.id,
      name: s.name,
      city: s.city,
      zone: s.zone,
      status: s.status,
      capacity: totalCapacity,
      rented,
      available,
      reserved,
      maintenance,
      occupancyRate: totalCapacity > 0 ? +(rented / totalCapacity).toFixed(3) : 0,
    }
  }).sort((a, b) => b.occupancyRate - a.occupancyRate)
}

// ── Revenue: grouped by tier and period ──────────
export function getRevenueStats(period) {
  let subs = readJSON('subscriptions')

  if (period) subs = subs.filter(s => s.period === period)

  // Group by tier
  const byTier = { basic: 0, premium: 0 }
  const byPeriod = {}
  const byTierPeriod = {}
  let totalRevenue = 0

  for (const sub of subs) {
    const price = sub.price || 0
    totalRevenue += price

    byTier[sub.tier] = (byTier[sub.tier] || 0) + price

    byPeriod[sub.period] = (byPeriod[sub.period] || 0) + price

    const key = `${sub.tier}-${sub.period}`
    byTierPeriod[key] = (byTierPeriod[key] || 0) + price
  }

  return {
    totalRevenue,
    totalSubscriptions: subs.length,
    byTier,
    byPeriod,
    byTierPeriod,
  }
}

// ── Activity: rental count, avg duration, peak hours ──────────
export function getActivityStats(days = 30) {
  const rentals = readJSON('rentals')
  const cutoff = new Date(Date.now() - days * 86400000)

  const recent = rentals.filter(r => new Date(r.pickupTime) >= cutoff)
  const completed = recent.filter(r => r.status === 'completed' && r.returnTime)

  // Average duration in minutes
  let totalDuration = 0
  for (const r of completed) {
    const pickup = new Date(r.pickupTime).getTime()
    const ret = new Date(r.returnTime).getTime()
    totalDuration += (ret - pickup) / 60000
  }
  const avgDurationMin = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0

  // Peak hours
  const hourCounts = new Array(24).fill(0)
  for (const r of recent) {
    const hour = new Date(r.pickupTime).getHours()
    hourCounts[hour]++
  }

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

  // By type
  const byType = { basic: 0, premium: 0 }
  for (const r of recent) {
    byType[r.type] = (byType[r.type] || 0) + 1
  }

  // Daily breakdown
  const dailyCounts = {}
  for (const r of recent) {
    const day = r.pickupTime.slice(0, 10)
    dailyCounts[day] = (dailyCounts[day] || 0) + 1
  }

  return {
    totalRentals: recent.length,
    completedRentals: completed.length,
    activeRentals: recent.filter(r => r.status === 'active').length,
    avgDurationMin,
    peakHour,
    hourDistribution: hourCounts,
    byType,
    dailyCounts,
    days,
  }
}

// ── Overview: high-level stats ──────────
export function getOverviewStats() {
  const users = readJSON('users')
  const subs = readJSON('subscriptions')
  const rentals = readJSON('rentals')
  const stations = readJSON('stations')
  const equipment = readJSON('equipment')

  const activeSubs = subs.filter(s => s.status === 'active')
  const activeRentals = rentals.filter(r => r.status === 'active')

  // Total revenue
  const totalRevenue = subs.reduce((sum, s) => sum + (s.price || 0), 0)

  // Rentals today
  const todayStr = new Date().toISOString().slice(0, 10)
  const rentalsToday = rentals.filter(r => r.pickupTime?.startsWith(todayStr)).length

  // Most popular stations (by rental count)
  const stationRentalCount = {}
  for (const r of rentals) {
    stationRentalCount[r.stationId] = (stationRentalCount[r.stationId] || 0) + 1
  }

  const stationMap = Object.fromEntries(stations.map(s => [s.id, s]))
  const topStations = Object.entries(stationRentalCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      stationId: id,
      name: stationMap[id]?.name || id,
      city: stationMap[id]?.city || '',
      rentalCount: count,
    }))

  // Equipment totals
  const totalEquipment = equipment.length
  const equipmentByStatus = {
    available: equipment.filter(e => e.status === 'available').length,
    rented: equipment.filter(e => e.status === 'rented').length,
    reserved: equipment.filter(e => e.status === 'reserved').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
  }

  // Subs by tier
  const subsByTier = {
    basic: activeSubs.filter(s => s.tier === 'basic').length,
    premium: activeSubs.filter(s => s.tier === 'premium').length,
  }

  return {
    totalUsers: users.length,
    activeSubscriptions: activeSubs.length,
    activeRentals: activeRentals.length,
    rentalsToday,
    totalRentals: rentals.length,
    totalRevenue,
    totalStations: stations.length,
    activeStations: stations.filter(s => s.status === 'active').length,
    totalEquipment,
    equipmentByStatus,
    subsByTier,
    topStations,
  }
}
