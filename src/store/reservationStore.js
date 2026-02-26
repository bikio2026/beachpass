import { create } from 'zustand'
import { api } from '../lib/api'

export const useReservationStore = create((set, get) => ({
  activeReservation: null,
  loading: false,

  reserve: async ({ userId, stationId, type }) => {
    set({ loading: true })
    try {
      const reservation = await api.post('/reservations', {
        userId,
        stationId,
        type,
      })
      set({ activeReservation: reservation, loading: false })
      return reservation
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  claim: async (reservationId, subscriptionId) => {
    set({ loading: true })
    try {
      const rental = await api.put(`/reservations/${reservationId}/claim`, {
        subscriptionId,
      })
      set({ activeReservation: null, loading: false })
      return rental
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  cancel: async (reservationId) => {
    set({ loading: true })
    try {
      await api.put(`/reservations/${reservationId}/cancel`)
      set({ activeReservation: null, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  fetchActiveReservation: async (userId) => {
    try {
      const data = await api.get(`/reservations/active/${userId}`)
      set({ activeReservation: data })
    } catch {
      set({ activeReservation: null })
    }
  },

  clearReservation: () => set({ activeReservation: null }),
}))
