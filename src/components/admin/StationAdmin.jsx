import { useState, useEffect } from 'react'
import { MapPin, Edit2, Save, ChevronDown, AlertCircle } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { STATION_STATUS } from '../../lib/constants'
import { useUIStore } from '../../store/uiStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3083'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'closed', label: 'Cerrada' },
]

export function StationAdmin() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const selectedCity = useUIStore(s => s.selectedCity)
  const addToast = useUIStore(s => s.addToast)

  useEffect(() => {
    loadStations()
  }, [selectedCity])

  async function loadStations() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/stations?city=${selectedCity}`)
      const data = await res.json()
      setStations(data)
    } catch (err) {
      console.error('Error loading stations:', err)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(station) {
    setEditingId(station.id)
    setEditData({
      status: station.status,
      capacityBasic: station.capacity?.basic || 0,
      capacityPremium: station.capacity?.premium || 0,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData({})
  }

  async function saveEdit(stationId) {
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/stations/${stationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editData.status,
          capacity: {
            basic: parseInt(editData.capacityBasic) || 0,
            premium: parseInt(editData.capacityPremium) || 0,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al actualizar')
      }

      addToast({ variant: 'success', message: 'Estacion actualizada' })
      setEditingId(null)
      setEditData({})
      loadStations()
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeCount = stations.filter(s => s.status === 'active').length
  const maintCount = stations.filter(s => s.status === 'maintenance').length
  const closedCount = stations.filter(s => s.status === 'closed').length

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="success">{activeCount} activas</Badge>
        <Badge variant="warning">{maintCount} mantenimiento</Badge>
        {closedCount > 0 && <Badge variant="error">{closedCount} cerradas</Badge>}
        <span className="text-xs text-text-dim ml-auto">{stations.length} estaciones</span>
      </div>

      {/* Station list */}
      <div className="space-y-2">
        {stations.map(station => {
          const isEditing = editingId === station.id
          const statusInfo = STATION_STATUS[station.status] || STATION_STATUS.active
          const totalCap = (station.capacity?.basic || 0) + (station.capacity?.premium || 0)
          const totalAvail = (station.available?.basic || 0) + (station.available?.premium || 0)

          return (
            <div
              key={station.id}
              className={`bg-bg-card rounded-2xl border transition-all ${
                isEditing ? 'border-accent shadow-md' : 'border-border shadow-sm'
              }`}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-accent" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{station.name}</p>
                  <p className="text-xs text-text-muted">{station.zone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-text">{totalAvail}/{totalCap}</p>
                    <p className="text-[10px] text-text-dim">disponibles</p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(station)}
                      className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} className="text-text-muted" />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveEdit(station.id)}
                        disabled={saving}
                        className="p-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                        title="Guardar"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors text-text-muted"
                        title="Cancelar"
                      >
                        <AlertCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {isEditing && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {/* Status dropdown */}
                    <div>
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                        Estado
                      </label>
                      <div className="relative mt-1">
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}
                          className="w-full appearance-none bg-bg-input text-sm text-text rounded-lg px-3 py-2 pr-8 border border-border focus:outline-none focus:border-accent"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                    </div>

                    {/* Basic capacity */}
                    <div>
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                        Cap. Basic
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={editData.capacityBasic}
                        onChange={(e) => setEditData(d => ({ ...d, capacityBasic: e.target.value }))}
                        className="w-full bg-bg-input text-sm text-text rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-accent mt-1"
                      />
                    </div>

                    {/* Premium capacity */}
                    <div>
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                        Cap. Premium
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={editData.capacityPremium}
                        onChange={(e) => setEditData(d => ({ ...d, capacityPremium: e.target.value }))}
                        className="w-full bg-bg-input text-sm text-text rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-accent mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
