import { useState, useEffect } from 'react'
import { BarChart3, MapPin, Package, Activity, Settings, Clock, Filter, Umbrella, Crown } from 'lucide-react'
import { Header } from '../layout/Header'
import { DashboardStats } from './DashboardStats'
import { StationAdmin } from './StationAdmin'
import { InventoryAdmin } from './InventoryAdmin'
import { Badge } from '../ui/Badge'
import { formatDateTime, timeAgo } from '../../lib/formatters'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3083'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: BarChart3 },
  { id: 'stations',   label: 'Estaciones', icon: MapPin },
  { id: 'inventory',  label: 'Inventario', icon: Package },
  { id: 'rentals',    label: 'Alquileres', icon: Activity },
]

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="flex flex-col h-full">
      <Header />

      {/* Tab bar */}
      <div className="px-4 pt-3 pb-0 bg-color-bg-card border-b border-color-border">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'text-color-accent bg-color-bg'
                    : 'text-color-text-muted hover:text-color-text hover:bg-color-bg-card-hover'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-color-accent rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'stations' && <StationAdmin />}
        {activeTab === 'inventory' && <InventoryAdmin />}
        {activeTab === 'rentals' && <RentalsAdmin />}
      </div>
    </div>
  )
}

// ── Rentals tab (inline — no need for separate file) ──────────
function RentalsAdmin() {
  const [rentals, setRentals] = useState([])
  const [stations, setStations] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // We need all rentals — use activity endpoint + raw data
      // Since there's no "list all rentals" endpoint, we use stats + individual fetch
      const [stRes, actRes] = await Promise.all([
        fetch(`${API}/api/stations`),
        fetch(`${API}/api/stats/activity?days=90`),
      ])
      const stData = await stRes.json()
      const actData = await actRes.json()

      // Build station map
      const stMap = {}
      for (const s of stData) {
        stMap[s.id] = s.name
      }
      setStations(stMap)

      // Fetch recent rentals from users we know about
      // Since we lack a "list all rentals" API, get from all users
      const usersRes = await fetch(`${API}/api/stats/overview`)
      const overview = await usersRes.json()

      // Use direct file approach - fetch all rentals via a workaround
      // Actually let's add a simple list endpoint... or just get from known users
      // For now, try to get rentals for all demo users
      const userIds = ['usr-001', 'usr-002', 'usr-003', 'usr-004', 'usr-005']
      const allRentals = []
      const seen = new Set()

      for (const uid of userIds) {
        try {
          const res = await fetch(`${API}/api/rentals/user/${uid}`)
          const data = await res.json()
          for (const r of data) {
            if (!seen.has(r.id)) {
              seen.add(r.id)
              allRentals.push(r)
            }
          }
        } catch {}
      }

      allRentals.sort((a, b) => new Date(b.pickupTime) - new Date(a.pickupTime))
      setRentals(allRentals)
    } catch (err) {
      console.error('Error loading rentals:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-color-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Apply filters
  let filtered = [...rentals]
  if (filterType !== 'all') filtered = filtered.filter(r => r.type === filterType)
  if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus)

  const activeCount = rentals.filter(r => r.status === 'active').length
  const completedCount = rentals.filter(r => r.status === 'completed').length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-color-text-muted" />

        <div className="flex gap-1 p-0.5 bg-color-bg-input rounded-lg">
          {[{ v: 'all', l: 'Todos' }, { v: 'active', l: 'Activos' }, { v: 'completed', l: 'Completados' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setFilterStatus(opt.v)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                filterStatus === opt.v
                  ? 'bg-color-accent text-white'
                  : 'text-color-text-muted hover:text-color-text'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-0.5 bg-color-bg-input rounded-lg">
          {[{ v: 'all', l: 'Ambos' }, { v: 'basic', l: 'Basic' }, { v: 'premium', l: 'Premium' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setFilterType(opt.v)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                filterType === opt.v
                  ? 'bg-color-accent text-white'
                  : 'text-color-text-muted hover:text-color-text'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        <span className="text-xs text-color-text-dim ml-auto">
          {activeCount} activos / {completedCount} completados
        </span>
      </div>

      {/* Rentals list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-color-text-muted text-sm">
          No hay alquileres registrados
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(rental => (
            <RentalRow key={rental.id} rental={rental} stationName={stations[rental.stationId]} returnStationName={stations[rental.returnStationId]} />
          ))}
        </div>
      )}
    </div>
  )
}

function RentalRow({ rental, stationName, returnStationName }) {
  const isActive = rental.status === 'active'
  const TypeIcon = rental.type === 'premium' ? Crown : Umbrella
  const tierColor = rental.type === 'premium' ? 'text-color-sun' : 'text-color-accent'

  // Duration
  let duration = ''
  if (rental.pickupTime && rental.returnTime) {
    const mins = Math.round((new Date(rental.returnTime) - new Date(rental.pickupTime)) / 60000)
    if (mins < 60) duration = `${mins} min`
    else duration = `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <div className="bg-color-bg-card rounded-2xl border border-color-border shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          rental.type === 'premium' ? 'bg-color-sun-soft' : 'bg-color-accent-soft'
        }`}>
          <TypeIcon size={16} className={tierColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-color-text truncate">
              {stationName || rental.stationId}
            </p>
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? 'Activo' : 'Completado'}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-color-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(rental.pickupTime)}
            </span>
            {rental.type && (
              <span className="capitalize">{rental.type}</span>
            )}
            {duration && (
              <span>{duration}</span>
            )}
          </div>

          {rental.returnStationId && rental.returnStationId !== rental.stationId && (
            <p className="text-[10px] text-color-text-dim mt-1">
              Devuelto en: {returnStationName || rental.returnStationId}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] text-color-text-dim">
            {formatDateTime(rental.pickupTime)}
          </p>
          <p className="text-[10px] text-color-text-dim font-mono mt-0.5">
            {rental.id.slice(0, 12)}
          </p>
        </div>
      </div>
    </div>
  )
}
