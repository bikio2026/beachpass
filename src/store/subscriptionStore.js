import { create } from 'zustand'
import { api } from '../lib/api'

export const useSubscriptionStore = create((set, get) => ({
  activeSubscription: null,
  history: [],
  plans: [],
  loading: false,

  fetchPlans: async () => {
    try {
      const plans = await api.get('/plans')
      set({ plans })
    } catch { /* ignore */ }
  },

  fetchActiveSubscription: async (userId) => {
    set({ loading: true })
    try {
      const sub = await api.get(`/subscriptions/active/${userId}`)
      set({ activeSubscription: sub, loading: false })
    } catch {
      set({ activeSubscription: null, loading: false })
    }
  },

  fetchHistory: async (userId) => {
    try {
      const data = await api.get(`/subscriptions?userId=${userId}`)
      set({ history: data })
    } catch { /* ignore */ }
  },

  subscribe: async ({ userId, tier, period, city }) => {
    set({ loading: true })
    try {
      const sub = await api.post('/subscriptions', { userId, tier, period, city })
      set({ activeSubscription: sub, loading: false })
      return sub
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  cancelSubscription: async (id) => {
    set({ loading: true })
    try {
      await api.put(`/subscriptions/${id}/cancel`)
      set({ activeSubscription: null, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },
}))
