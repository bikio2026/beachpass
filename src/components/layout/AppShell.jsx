import { Sidebar } from './Sidebar'
import { ToastContainer } from './ToastContainer'

export function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}
