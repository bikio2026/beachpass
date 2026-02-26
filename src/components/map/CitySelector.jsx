import { useUIStore } from '../../store/uiStore'
import { CITIES } from '../../lib/constants'

export function CitySelector() {
  const { selectedCity, setCity } = useUIStore()

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex p-1 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {Object.entries(CITIES).map(([key, city]) => (
        <button
          key={key}
          onClick={() => setCity(key)}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            selectedCity === key
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {city.name}
        </button>
      ))}
    </div>
  )
}
