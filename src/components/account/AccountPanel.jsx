import { useEffect } from 'react'
import { LogOut, Crown, Umbrella, Calendar, Clock } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useSubscriptionStore } from '../../store/subscriptionStore'
import { useUIStore } from '../../store/uiStore'
import { Header } from '../layout/Header'
import { LoginForm } from './LoginForm'
import { Badge } from '../ui/Badge'
import { formatDate, formatCurrency } from '../../lib/formatters'
import { TIERS } from '../../lib/constants'

export function AccountPanel() {
  const { user, logout } = useUserStore()
  const { activeSubscription, fetchActiveSubscription } = useSubscriptionStore()
  const { addToast, setActiveView } = useUIStore()

  useEffect(() => {
    if (user) fetchActiveSubscription(user.id)
  }, [user, fetchActiveSubscription])

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <LoginForm />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    addToast({ variant: 'info', message: 'Sesión cerrada' })
  }

  const sub = activeSubscription
  const tier = sub ? TIERS[sub.tier] : null
  const TierIcon = sub?.tier === 'premium' ? Crown : Umbrella

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-auto p-6 pb-20 md:pb-6 max-w-lg mx-auto w-full">
        {/* User info */}
        <div className="bg-bg-card rounded-2xl border border-border p-5 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white font-display text-xl font-bold"
              style={{ boxShadow: '0 4px 12px rgba(8,145,178,0.25)' }}>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-text">{user.name}</h2>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-error transition-colors"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>

        {/* Subscription */}
        {sub ? (
          <div
            className={`rounded-2xl border p-5 mb-4 ${
              sub.tier === 'premium'
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                : 'bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <TierIcon size={18} className={sub.tier === 'premium' ? 'text-tier-premium' : 'text-tier-basic'} />
              <span className="font-display text-base font-bold text-text">
                Plan {tier?.name}
              </span>
              <Badge variant={sub.tier === 'premium' ? 'sun' : 'accent'}>Activo</Badge>
            </div>
            <p className="text-sm text-text-muted mb-3">{tier?.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={14} />
                <span>Desde {formatDate(sub.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={14} />
                <span>Vence {formatDate(sub.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-text">
                <span className="font-semibold">{formatCurrency(sub.price)}</span>
                <span className="text-text-dim">/ {sub.period === 'daily' ? 'día' : sub.period === 'weekly' ? 'semana' : sub.period === 'monthly' ? 'mes' : 'año'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-bg-card rounded-2xl border border-border p-5 mb-4 text-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Umbrella size={32} className="text-text-dim mx-auto mb-3" />
            <h3 className="font-display text-base font-semibold text-text mb-1">Sin suscripción activa</h3>
            <p className="text-sm text-text-muted mb-4">Elegí un plan para empezar a alquilar</p>
            <button
              onClick={() => setActiveView('subscription')}
              className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              style={{ boxShadow: '0 4px 12px rgba(8,145,178,0.3)' }}
            >
              Ver planes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
