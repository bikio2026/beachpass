import { create } from 'zustand'
import { api } from '../lib/api'

export const useRentalStore = create((set, get) => ({
  activeRentals: [],
  history: [],
  loading: false,

  pickup: async ({ userId, subscriptionId, stationId, type }) => {
    set({ loading: true })
    try {
      const rental = await api.post('/rentals/pickup', {
        userId,
        subscriptionId,
        stationId,
        type,
      })
      set((s) => ({
        activeRentals: [...s.activeRentals, rental],
        loading: false,
      }))
      return rental
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  returnRental: async (rentalId, returnStationId) => {
    set({ loading: true })
    try {
      const rental = await api.put(`/rentals/${rentalId}/return`, {
        returnStationId,
      })
      set((s) => ({
        activeRentals: s.activeRentals.filter((r) => r.id !== rentalId),
        history: [rental, ...s.history],
        loading: false,
      }))
      return rental
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  fetchActiveRentals: async (userId) => {
    set({ loading: true })
    try {
      const data = await api.get(`/rentals/active/${userId}`)
      set({ activeRentals: data, loading: false })
    } catch {
      set({ activeRentals: [], loading: false })
    }
  },

  fetchUserRentals: async (userId) => {
    try {
      const data = await api.get(`/rentals/user/${userId}`)
      set({ history: data })
    } catch { /* ignore */ }
  },
}))
