export const CITIES = {
  barcelona: { name: 'Barcelona', center: [41.3874, 2.1970], zoom: 14 },
  mallorca: { name: 'Mallorca', center: [39.5696, 2.6502], zoom: 10 },
}

export const TIERS = {
  basic: {
    name: 'Basic',
    description: 'Sombrilla compacta',
    includes: ['Sombrilla compacta UV'],
    icon: 'Umbrella',
  },
  premium: {
    name: 'Premium',
    description: 'Sombrilla UV grande + 2 tumbonas',
    includes: ['Sombrilla UV grande', '2 tumbonas premium'],
    icon: 'Crown',
  },
}

export const PLANS = [
  { id: 'basic-daily',     tier: 'basic',   period: 'daily',   price: 5,   label: 'Día' },
  { id: 'basic-weekly',    tier: 'basic',   period: 'weekly',  price: 25,  label: 'Semana' },
  { id: 'basic-monthly',   tier: 'basic',   period: 'monthly', price: 50,  label: 'Mes' },
  { id: 'basic-annual',    tier: 'basic',   period: 'annual',  price: 120, label: 'Anual' },
  { id: 'premium-daily',   tier: 'premium', period: 'daily',   price: 12,  label: 'Día' },
  { id: 'premium-weekly',  tier: 'premium', period: 'weekly',  price: 60,  label: 'Semana' },
  { id: 'premium-monthly', tier: 'premium', period: 'monthly', price: 100, label: 'Mes' },
  { id: 'premium-annual',  tier: 'premium', period: 'annual',  price: 300, label: 'Anual' },
]

export const PERIODS = {
  daily:   { label: 'Día',    days: 1 },
  weekly:  { label: 'Semana', days: 7 },
  monthly: { label: 'Mes',    days: 30 },
  annual:  { label: 'Año',    days: 365 },
}

export const RESERVATION_TTL_MINUTES = 30

export const STATION_STATUS = {
  active:      { label: 'Activa',        color: 'success' },
  maintenance: { label: 'Mantenimiento', color: 'warning' },
  closed:      { label: 'Cerrada',       color: 'error' },
}

export const NAV_ITEMS = [
  { id: 'map',          label: 'Mapa',          icon: 'Map' },
  { id: 'stations',     label: 'Estaciones',    icon: 'MapPin' },
  { id: 'subscription', label: 'Planes',        icon: 'CreditCard' },
  { id: 'account',      label: 'Mi Cuenta',     icon: 'User' },
  { id: 'admin',        label: 'Admin',         icon: 'Settings' },
]
