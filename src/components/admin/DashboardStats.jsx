import { useState, useEffect } from 'react'
import { Users, CreditCard, Activity, DollarSign, TrendingUp, Umbrella, Crown } from 'lucide-react'
import { formatCurrency } from '../../lib/formatters'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3083'

function StatCard({ icon: Icon, label, value, sub, color = 'accent' }) {
  const colorMap = {
    accent: { bg: 'bg-accent-soft', text: 'text-accent' },
    sun: { bg: 'bg-sun-soft', text: 'text-sun' },
    success: { bg: 'bg-success-soft', text: 'text-success' },
    error: { bg: 'bg-error-soft', text: 'text-error' },
  }
  const c = colorMap[color] || colorMap.accent

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={c.text} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted font-medium">{label}</p>
        <p className="font-display text-2xl font-bold text-text leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-dim mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function HorizontalBarChart({ data, maxValue, label = 'alquileres' }) {
  if (!data || data.length === 0) return null
  const max = maxValue || Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-text truncate pr-2">{item.name}</span>
            <span className="text-xs text-text-muted whitespace-nowrap">
              {item.value} {label}
            </span>
          </div>
          <div className="w-full h-3 bg-bg-input rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: item.color || 'var(--color-accent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RevenueByTier({ revenue }) {
  if (!revenue) return null

  const tiers = [
    { key: 'basic', label: 'Basic', icon: Umbrella, color: 'var(--color-tier-basic)', amount: revenue.byTier?.basic || 0 },
    { key: 'premium', label: 'Premium', icon: Crown, color: 'var(--color-tier-premium)', amount: revenue.byTier?.premium || 0 },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiers.map(t => {
        const Icon = t.icon
        return (
          <div
            key={t.key}
            className="rounded-xl border border-border p-4 text-center"
            style={{ borderLeftWidth: 3, borderLeftColor: t.color }}
          >
            <Icon size={18} className="mx-auto mb-1" style={{ color: t.color }} />
            <p className="text-xs text-text-muted">{t.label}</p>
            <p className="font-display text-lg font-bold text-text">{formatCurrency(t.amount)}</p>
          </div>
        )
      })}
    </div>
  )
}

export function DashboardStats() {
  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ov, rev] = await Promise.all([
          fetch(`${API}/api/stats/overview`).then(r => r.json()),
          fetch(`${API}/api/stats/revenue`).then(r => r.json()),
        ])
        setOverview(ov)
        setRevenue(rev)
      } catch (err) {
        console.error('Error loading stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="text-center py-12 text-text-muted">
        No se pudieron cargar las estadisticas
      </div>
    )
  }

  const topStationsData = (overview.topStations || []).map((s, i) => ({
    name: s.name,
    value: s.rentalCount,
    color: i < 2 ? 'var(--color-accent)' : 'var(--color-sun)',
  }))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Users}
          label="Usuarios totales"
          value={overview.totalUsers}
          sub={`${overview.activeSubscriptions} con suscripcion`}
          color="accent"
        />
        <StatCard
          icon={CreditCard}
          label="Suscripciones activas"
          value={overview.activeSubscriptions}
          sub={`${overview.subsByTier?.basic || 0} basic / ${overview.subsByTier?.premium || 0} premium`}
          color="sun"
        />
        <StatCard
          icon={Activity}
          label="Alquileres hoy"
          value={overview.rentalsToday}
          sub={`${overview.totalRentals} totales`}
          color="success"
        />
        <StatCard
          icon={DollarSign}
          label="Ingresos totales"
          value={formatCurrency(overview.totalRevenue)}
          sub={`${overview.totalStations} estaciones`}
          color="accent"
        />
      </div>

      {/* Top stations */}
      <div className="bg-bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="font-display text-sm font-semibold text-text">
            Estaciones mas populares
          </h3>
        </div>
        {topStationsData.length > 0 ? (
          <HorizontalBarChart data={topStationsData} />
        ) : (
          <p className="text-sm text-text-muted text-center py-4">Sin datos de alquileres aun</p>
        )}
      </div>

      {/* Revenue by tier */}
      <div className="bg-bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-sun" />
          <h3 className="font-display text-sm font-semibold text-text">
            Ingresos por tier
          </h3>
        </div>
        <RevenueByTier revenue={revenue} />
      </div>

      {/* Equipment summary */}
      <div className="bg-bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Umbrella size={18} className="text-accent" />
          <h3 className="font-display text-sm font-semibold text-text">
            Estado del equipamiento
          </h3>
        </div>
        <EquipmentSummaryBar data={overview.equipmentByStatus} total={overview.totalEquipment} />
      </div>
    </div>
  )
}

function EquipmentSummaryBar({ data, total }) {
  if (!data || total === 0) return <p className="text-sm text-text-muted">Sin datos</p>

  const segments = [
    { key: 'available', label: 'Disponible', color: 'var(--color-success)', count: data.available || 0 },
    { key: 'rented', label: 'Alquilado', color: 'var(--color-accent)', count: data.rented || 0 },
    { key: 'reserved', label: 'Reservado', color: 'var(--color-sun)', count: data.reserved || 0 },
    { key: 'maintenance', label: 'Mantenimiento', color: 'var(--color-error)', count: data.maintenance || 0 },
  ]

  return (
    <div>
      {/* Stacked bar */}
      <div className="w-full h-5 rounded-full overflow-hidden flex bg-bg-input">
        {segments.map(seg => {
          const pct = (seg.count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={seg.key}
              style={{ width: `${pct}%`, background: seg.color }}
              className="h-full transition-all duration-500"
              title={`${seg.label}: ${seg.count}`}
            />
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-xs text-text-muted">{seg.label}: {seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
