import { useState } from 'react'
import { Umbrella, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useUIStore } from '../../store/uiStore'

export function LoginForm() {
  const { login, register, loading } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', pin: '' })
  const [error, setError] = useState('')

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.pin)
        addToast({ variant: 'success', message: '¡Bienvenido de vuelta!' })
      } else {
        if (!form.name.trim()) { setError('Ingresá tu nombre'); return }
        await register(form)
        addToast({ variant: 'success', message: '¡Cuenta creada! Bienvenido a BeachPass' })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4"
            style={{ boxShadow: '0 8px 24px rgba(8,145,178,0.25)' }}>
            <Umbrella size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text">BeachPass</h1>
          <p className="text-sm text-text-muted mt-1">
            {mode === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-input rounded-xl mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-bg-card text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-bg-card text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="password"
              placeholder="PIN (4 dígitos)"
              value={form.pin}
              onChange={(e) => update('pin', e.target.value.slice(0, 4))}
              maxLength={4}
              pattern="[0-9]{4}"
              required
              className="w-full pl-10 pr-4 py-3 bg-bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-error bg-error-soft px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ boxShadow: '0 4px 12px rgba(8,145,178,0.3)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 p-3 rounded-xl bg-sun-soft text-center">
          <p className="text-xs text-text-muted">
            <span className="font-semibold text-sun">Demo:</span>{' '}
            demo@beachpass.com / PIN: 0000
          </p>
        </div>
      </div>
    </div>
  )
}
