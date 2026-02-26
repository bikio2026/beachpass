import { useUIStore } from '../../store/uiStore'
import { CITIES } from '../../lib/constants'

const VIEW_TITLES = {
  map: 'Mapa',
  stations: 'Estaciones',
  subscription: 'Planes',
  account: 'Mi Cuenta',
  admin: 'Admin',
}

export function Header() {
  const { activeView, selectedCity, setCity } = useUIStore()

  // Don't show header on map view — map is full-bleed
  if (activeView === 'map') return null

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-color-border bg-color-bg-card">
      <h2 className="font-display text-xl font-bold text-color-text">
        {VIEW_TITLES[activeView] || 'BeachPass'}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex gap-1 p-0.5 bg-color-bg-input rounded-lg">
          {Object.entries(CITIES).map(([key, city]) => (
            <button
              key={key}
              onClick={() => setCity(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedCity === key
                  ? 'bg-color-accent text-white'
                  : 'text-color-text-muted hover:text-color-text'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
