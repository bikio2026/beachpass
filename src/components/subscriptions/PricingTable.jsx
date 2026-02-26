import { useState, useEffect } from 'react'
import { Umbrella, Crown, Check, Zap } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useSubscriptionStore } from '../../store/subscriptionStore'
import { useUIStore } from '../../store/uiStore'
import { Header } from '../layout/Header'
import { LoginForm } from '../account/LoginForm'
import { PLANS, TIERS, PERIODS } from '../../lib/constants'
import { formatCurrency } from '../../lib/formatters'

const PERIOD_ORDER = ['daily', 'weekly', 'monthly', 'annual']

export function PricingTable() {
  const { user } = useUserStore()
  const { subscribe, activeSubscription, loading, fetchActiveSubscription } = useSubscriptionStore()
  const { addToast, selectedCity, setActiveView } = useUIStore()
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')

  useEffect(() => {
    if (user) fetchActiveSubscription(user.id)
  }, [user, fetchActiveSubscription])

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-sm text-color-text-muted mb-4">Iniciá sesión para suscribirte</p>
          <LoginForm />
        </div>
      </div>
    )
  }

  if (activeSubscription) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-color-success-soft flex items-center justify-center mb-4">
            <Check size={28} className="text-color-success" />
          </div>
          <h2 className="font-display text-xl font-bold text-color-text mb-1">
            Ya tenés el plan {TIERS[activeSubscription.tier]?.name}
          </h2>
          <p className="text-sm text-color-text-muted mb-4">
            Podés alquilar equipamiento en cualquier estación
          </p>
          <button
            onClick={() => setActiveView('map')}
            className="px-6 py-3 rounded-xl bg-color-accent text-white font-semibold text-sm hover:bg-color-accent-hover transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(8,145,178,0.3)' }}
          >
            Ir al mapa
          </button>
        </div>
      </div>
    )
  }

  const basicPlan = PLANS.find(p => p.tier === 'basic' && p.period === selectedPeriod)
  const premiumPlan = PLANS.find(p => p.tier === 'premium' && p.period === selectedPeriod)

  const handleSubscribe = async (tier) => {
    try {
      await subscribe({ userId: user.id, tier, period: selectedPeriod, city: selectedCity })
      addToast({ variant: 'success', message: `¡Suscripción ${TIERS[tier].name} activada!` })
    } catch (err) {
      addToast({ variant: 'error', message: err.message })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-color-text mb-2">
              Elegí tu plan
            </h2>
            <p className="text-sm text-color-text-muted">
              Alquilá sombrillas y equipamiento en todas las estaciones
            </p>
          </div>

          {/* Period selector */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-1 p-1 bg-color-bg-input rounded-xl">
              {PERIOD_ORDER.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    selectedPeriod === p
                      ? 'bg-color-accent text-white shadow-sm'
                      : 'text-color-text-muted hover:text-color-text'
                  }`}
                >
                  {PERIODS[p].label}
                  {p === 'annual' && (
                    <span className="ml-1 text-[10px] opacity-80">-60%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic */}
            <div className="bg-color-bg-card rounded-2xl border border-color-border p-6 flex flex-col"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-color-accent-soft flex items-center justify-center">
                  <Umbrella size={20} className="text-color-tier-basic" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-color-text">Basic</h3>
                  <p className="text-xs text-color-text-muted">Sombrilla compacta</p>
                </div>
              </div>

              <div className="mb-5">
                <span className="font-display text-3xl font-bold text-color-text">
                  {formatCurrency(basicPlan?.price || 0)}
                </span>
                <span className="text-sm text-color-text-dim ml-1">
                  / {PERIODS[selectedPeriod].label.toLowerCase()}
                </span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Sombrilla compacta UV
                </li>
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Retiro y devolución flexible
                </li>
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Todas las estaciones
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('basic')}
                disabled={loading}
                className="w-full py-3 rounded-xl border-2 border-color-accent text-color-accent font-semibold text-sm hover:bg-color-accent hover:text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Elegir Basic'}
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-color-sun text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <Zap size={10} /> Popular
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-color-sun-soft flex items-center justify-center">
                  <Crown size={20} className="text-color-tier-premium" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-color-text">Premium</h3>
                  <p className="text-xs text-color-text-muted">Sombrilla UV + tumbonas</p>
                </div>
              </div>

              <div className="mb-5">
                <span className="font-display text-3xl font-bold text-color-text">
                  {formatCurrency(premiumPlan?.price || 0)}
                </span>
                <span className="text-sm text-color-text-dim ml-1">
                  / {PERIODS[selectedPeriod].label.toLowerCase()}
                </span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Sombrilla UV grande premium
                </li>
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  2 tumbonas incluidas
                </li>
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Retiro y devolución flexible
                </li>
                <li className="flex items-center gap-2 text-sm text-color-text">
                  <Check size={15} className="text-color-success shrink-0" />
                  Reserva anticipada 30 min
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-color-sun text-white font-semibold text-sm hover:bg-color-sun-hover transition-all disabled:opacity-50"
                style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
              >
                {loading ? 'Procesando...' : 'Elegir Premium'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
