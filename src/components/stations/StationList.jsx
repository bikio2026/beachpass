import { useEffect, useState, useMemo } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useStationStore } from '../../store/stationStore'
import { Header } from '../layout/Header'
import { StationCard } from './StationCard'
import { EmptyState } from '../ui/EmptyState'

export function StationList() {
  const { selectedCity } = useUIStore()
  const { stations, loading, fetchStations } = useStationStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStations(selectedCity)
  }, [selectedCity, fetchStations])

  const filtered = useMemo(() => {
    let list = stations.filter((s) => s.city === selectedCity)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.zone.toLowerCase().includes(q)
      )
    }
    return list
  }, [stations, selectedCity, search])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />
      <div className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            placeholder="Buscar estación o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Summary */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={14} className="text-accent" />
          <span className="text-sm text-text-muted">
            <span className="font-semibold text-text">{filtered.length}</span> estaciones en{' '}
            {selectedCity === 'barcelona' ? 'Barcelona' : 'Mallorca'}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((station, i) => (
              <div key={station.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                <StationCard station={station} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="MapPin"
            title="Sin resultados"
            message="No se encontraron estaciones con esos criterios"
          />
        )}
      </div>
    </div>
  )
}
