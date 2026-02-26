import { QRCodeSVG } from 'qrcode.react'
import { Umbrella, Crown, MapPin, Clock, Check } from 'lucide-react'
import { formatDateTime } from '../../lib/formatters'
import { TIERS } from '../../lib/constants'

export function QRDisplay({ rental, onClose }) {
  if (!rental) return null

  const tier = TIERS[rental.type]
  const isPremium = rental.type === 'premium'
  const Icon = isPremium ? Crown : Umbrella

  return (
    <div className="flex flex-col items-center">
      {/* Exito header */}
      <div className="w-14 h-14 rounded-2xl bg-color-success-soft flex items-center justify-center mb-3">
        <Check size={26} className="text-color-success" />
      </div>
      <h3 className="font-display text-base font-bold text-color-text mb-1">
        Retiro confirmado
      </h3>
      <p className="text-xs text-color-text-muted mb-5">
        Mostra este codigo en la estacion para retirar tu equipamiento
      </p>

      {/* QR Code */}
      <div
        className="p-5 rounded-2xl border border-color-border mb-5"
        style={{
          background: 'linear-gradient(135deg, #faf8f5 0%, #ffffff 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <QRCodeSVG
          value={rental.qrToken || rental.id}
          size={200}
          level="H"
          fgColor="#1a1a2e"
          bgColor="transparent"
          includeMargin={false}
        />
      </div>

      {/* Rental info card */}
      <div className="w-full rounded-2xl border border-color-border bg-color-bg-card p-4 space-y-3 mb-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Tipo */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isPremium ? 'bg-color-sun-soft' : 'bg-color-accent-soft'
          }`}>
            <Icon size={18} className={isPremium ? 'text-color-tier-premium' : 'text-color-tier-basic'} />
          </div>
          <div>
            <span className="text-sm font-semibold text-color-text">{tier?.name || rental.type}</span>
            <p className="text-[11px] text-color-text-muted">{tier?.description}</p>
          </div>
        </div>

        <div className="h-px bg-color-border" />

        {/* Estacion */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-color-accent shrink-0" />
          <span className="text-color-text-muted">Estacion:</span>
          <span className="font-medium text-color-text">{rental.stationName || rental.stationId}</span>
        </div>

        {/* Hora de retiro */}
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-color-accent shrink-0" />
          <span className="text-color-text-muted">Retiro:</span>
          <span className="font-medium text-color-text">{formatDateTime(rental.pickupTime)}</span>
        </div>
      </div>

      {/* Cerrar */}
      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-colors"
        style={{ boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)' }}
      >
        Cerrar
      </button>
    </div>
  )
}
