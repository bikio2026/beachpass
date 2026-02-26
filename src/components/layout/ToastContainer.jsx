import { useUIStore } from '../../store/uiStore'
import { Toast } from '../ui/Toast'

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-16 right-4 z-[9999] flex flex-col gap-2 md:bottom-6 md:right-6">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
