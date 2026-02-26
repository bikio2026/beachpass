import { useState, useEffect } from 'react'
import { Package, Umbrella, Crown } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useUIStore } from '../../store/uiStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3083'

const STATUS_CONFIG = {
  available:   { label: 'Disponible',    variant: 'success' },
  rented:      { label: 'Alquilado',     variant: 'accent' },
  reserved:    { label: 'Reservado',     variant: 'sun' },
  maintenance: { label: 'Mantenimiento', variant: 'warning' },
}

function StatusBadge({ status, count }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={cfg.variant}>{count}</Badge>
      <span className="text-[10px] text-text-dim hidden sm:inline">{cfg.label}</span>
    </div>
  )
}

export function InventoryAdmin() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const selectedCity = useUIStore(s => s.selectedCity)

  useEffect(() => {
    loadData()
  }, [selectedCity])

  async function loadData() {
    setLoading(true)
    try {
      // Fetch stations and occupancy data
      const [stRes, occRes] = await Promise.all([
        fetch(`${API}/api/stations?city=${selectedCity}`),
        fetch(`${API}/api/stats/occupancy?city=${selectedCity}`),
      ])
      const stData = await stRes.json()
      const occData = await occRes.json()

      // Merge availability details from occupancy with station info
      // Also fetch per-station availability for detailed breakdown
      const enriched = await Promise.all(
        stData.map(async (station) => {
          try {
            const res = await fetch(`${API}/api/stations/${station.id}/availability`)
            const avail = await res.json()
            const occ = occData.find(o => o.stationId === station.id)
            return {
              ...station,
              availability: avail,
              occupancyRate: occ?.occupancyRate || 0,
            }
          } catch {
            return {
              ...station,
              availability: { basic: {}, premium: {} },
              occupancyRate: 0,
            }
          }
        })
      )

      setStations(enriched)
    } catch (err) {
      console.error('Error loading inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Global totals
  const totals = { basic: { available: 0, rented: 0, reserved: 0, maintenance: 0, total: 0 }, premium: { available: 0, rented: 0, reserved: 0, maintenance: 0, total: 0 } }
  for (const st of stations) {
    for (const tier of ['basic', 'premium']) {
      const a = st.availability?.[tier] || {}
      totals[tier].available += a.available || 0
      totals[tier].rented += a.rented || 0
      totals[tier].reserved += a.reserved || 0
      totals[tier].maintenance += a.maintenance || 0
      totals[tier].total += a.total || 0
    }
  }

  return (
    <div className="space-y-4">
      {/* Global summary */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={Umbrella}
          label="Basic"
          color="var(--color-tier-basic)"
          data={totals.basic}
        />
        <SummaryCard
          icon={Crown}
          label="Premium"
          color="var(--color-tier-premium)"
          data={totals.premium}
        />
      </div>

      {/* Per-station table */}
      <div className="bg-bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <Package size={16} className="text-accent" />
          <h3 className="font-display text-sm font-semibold text-text">
            Inventario por estacion
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-input">
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide">
                  Estacion
                </th>
                <th className="text-center px-2 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide" colSpan={4}>
                  <span className="flex items-center justify-center gap-1">
                    <Umbrella size={10} /> Basic
                  </span>
                </th>
                <th className="text-center px-2 py-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wide" colSpan={4}>
                  <span className="flex items-center justify-center gap-1">
                    <Crown size={10} /> Premium
                  </span>
                </th>
              </tr>
              <tr className="border-b border-border bg-bg-input">
                <th></th>
                {['Disp', 'Alq', 'Res', 'Mant'].map(h => (
                  <th key={`b-${h}`} className="px-1 py-1 text-[9px] text-text-dim text-center">{h}</th>
                ))}
                {['Disp', 'Alq', 'Res', 'Mant'].map(h => (
                  <th key={`p-${h}`} className="px-1 py-1 text-[9px] text-text-dim text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map(station => {
                const basic = station.availability?.basic || {}
                const premium = station.availability?.premium || {}

                return (
                  <tr key={station.id} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-text truncate max-w-[160px]">{station.name}</p>
                      <p className="text-[10px] text-text-dim">{station.zone}</p>
                    </td>
                    <CellVal value={basic.available} color="success" />
                    <CellVal value={basic.rented} color="accent" />
                    <CellVal value={basic.reserved} color="sun" />
                    <CellVal value={basic.maintenance} color="warning" />
                    <CellVal value={premium.available} color="success" />
                    <CellVal value={premium.rented} color="accent" />
                    <CellVal value={premium.reserved} color="sun" />
                    <CellVal value={premium.maintenance} color="warning" />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CellVal({ value, color }) {
  const v = value || 0
  if (v === 0) return <td className="text-center text-xs text-text-dim px-1 py-2.5">-</td>
  const colorClasses = {
    success: 'text-success',
    accent: 'text-accent',
    sun: 'text-sun',
    warning: 'text-warning',
  }
  return (
    <td className={`text-center text-xs font-semibold px-1 py-2.5 ${colorClasses[color] || ''}`}>
      {v}
    </td>
  )
}

function SummaryCard({ icon: Icon, label, color, data }) {
  const total = data.total || 0
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} style={{ color }} />
        <span className="text-sm font-semibold text-text">{label}</span>
        <span className="text-xs text-text-dim ml-auto">{total} total</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="available" count={data.available || 0} />
        <StatusBadge status="rented" count={data.rented || 0} />
        <StatusBadge status="reserved" count={data.reserved || 0} />
        <StatusBadge status="maintenance" count={data.maintenance || 0} />
      </div>
    </div>
  )
}
