import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export function UserLocationBtn({ mapRef }) {
  const [locating, setLocating] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const handleClick = () => {
    if (!navigator.geolocation) {
      addToast({ variant: 'error', message: 'Geolocalización no disponible' })
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (mapRef?.current) {
          mapRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 })
        }
        setLocating(false)
      },
      () => {
        addToast({ variant: 'warning', message: 'No se pudo obtener la ubicación' })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={locating}
      className="absolute bottom-6 right-4 z-[1000] w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
      title="Mi ubicación"
    >
      <Navigation
        size={18}
        className={`text-accent transition-transform ${locating ? 'animate-pulse' : ''}`}
      />
    </button>
  )
}
