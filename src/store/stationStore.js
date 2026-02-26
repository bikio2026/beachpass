import { create } from 'zustand'
import { api } from '../lib/api'

export const useStationStore = create((set, get) => ({
  stations: [],
  loading: true,
  error: null,
  selectedStation: null,

  fetchStations: async (city) => {
    set({ loading: true, error: null })
    try {
      const query = city ? `?city=${city}` : ''
      const data = await api.get(`/stations${query}`)
      set({ stations: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchStation: async (id) => {
    try {
      const data = await api.get(`/stations/${id}`)
      set({ selectedStation: data })
      return data
    } catch (err) {
      set({ error: err.message })
      return null
    }
  },

  clearSelectedStation: () => set({ selectedStation: null }),

  getStationById: (id) => {
    return get().stations.find((s) => s.id === id) || null
  },
}))
