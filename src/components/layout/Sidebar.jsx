import { Map, MapPin, CreditCard, User, Settings, Umbrella } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { NAV_ITEMS, CITIES } from '../../lib/constants'

const ICON_MAP = { Map, MapPin, CreditCard, User, Settings }

export function Sidebar() {
  const { activeView, setActiveView, selectedCity, setCity } = useUIStore()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] h-screen bg-bg-sidebar border-r border-border shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Umbrella size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-text leading-tight tracking-tight">
                BeachPass
              </h1>
              <p className="text-[10px] text-text-dim font-medium uppercase tracking-widest">
                Tu pase a la playa
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || Map
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-accent text-white shadow-md'
                    : 'text-text-muted hover:text-text hover:bg-bg-card-hover'
                }`}
                style={active ? { boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' } : {}}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* City selector */}
        <div className="px-3 py-3 border-t border-border">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
            Ciudad
          </p>
          <div className="flex gap-1 p-1 bg-bg-card rounded-xl">
            {Object.entries(CITIES).map(([key, city]) => (
              <button
                key={key}
                onClick={() => setCity(key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  selectedCity === key
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1100] border-t border-border px-2 pb-[env(safe-area-inset-bottom)]"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-around">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const Icon = ICON_MAP[item.icon] || Map
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${
                  active ? 'text-accent' : 'text-text-dim'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
