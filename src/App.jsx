import { AppShell } from './components/layout/AppShell'
import { useUIStore } from './store/uiStore'
import { MapView } from './components/map/MapView'
import { StationList } from './components/stations/StationList'
import { PricingTable } from './components/subscriptions/PricingTable'
import { AccountPanel } from './components/account/AccountPanel'
import { AdminPanel } from './components/admin/AdminPanel'
import { Header } from './components/layout/Header'

function ViewRouter() {
  const activeView = useUIStore((s) => s.activeView)

  switch (activeView) {
    case 'map':
      return <MapView />
    case 'stations':
      return <StationList />
    case 'subscription':
      return <PricingTable />
    case 'account':
      return <AccountPanel />
    case 'admin':
      return <AdminPanel />
    default:
      return <MapView />
  }
}

export default function App() {
  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}
