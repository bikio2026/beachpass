import { create } from 'zustand'
import { CITIES } from '../lib/constants'

let toastId = 0

export const useUIStore = create((set, get) => ({
  activeView: 'map',
  selectedCity: 'barcelona',
  dialog: null,
  toasts: [],
  mapCenter: CITIES.barcelona.center,
  mapZoom: CITIES.barcelona.zoom,
  selectedStationId: null,

  setActiveView: (view) => set({ activeView: view }),

  setCity: (city) => {
    const c = CITIES[city]
    if (!c) return
    set({
      selectedCity: city,
      mapCenter: c.center,
      mapZoom: c.zoom,
      selectedStationId: null,
    })
  },

  openDialog: (type, data = null) => set({ dialog: { type, data } }),
  closeDialog: () => set({ dialog: null }),

  selectStation: (id) => set({ selectedStationId: id }),
  clearStation: () => set({ selectedStationId: null }),

  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),

  addToast: ({ variant = 'info', message, duration = 4000 }) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, variant, message, duration }] }))
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration)
    }
    return id
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
