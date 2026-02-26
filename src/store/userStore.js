import { create } from 'zustand'
import { api } from '../lib/api'

const STORAGE_KEY = 'beachpass_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveUser(user) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

export const useUserStore = create((set, get) => ({
  user: loadUser(),
  loading: false,
  error: null,

  login: async (email, pin) => {
    set({ loading: true, error: null })
    try {
      const user = await api.post('/auth/login', { email, pin })
      saveUser(user)
      set({ user, loading: false })
      return user
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  register: async ({ name, email, phone, pin }) => {
    set({ loading: true, error: null })
    try {
      const user = await api.post('/auth/register', { name, email, phone, pin })
      saveUser(user)
      set({ user, loading: false })
      return user
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  logout: () => {
    saveUser(null)
    set({ user: null, error: null })
  },

  refreshUser: async () => {
    const user = get().user
    if (!user) return
    try {
      const updated = await api.get(`/users/${user.id}`)
      saveUser(updated)
      set({ user: updated })
    } catch { /* ignore */ }
  },

  isLoggedIn: () => !!get().user,
}))
