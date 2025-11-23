import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  function setUser(u) {
    user.value = u
    if (u) localStorage.setItem('user', JSON.stringify(u))
    else localStorage.removeItem('user')
  }

  async function login(email, password) {
    try {
      const res = await api.post('/login', { email, password })
      if (res.status === 200) {
        // backend may return { ok: true, user }
        let u = res.data && res.data.user ? res.data.user : null
        // If login response didn't include full user, call /api/me to fetch profile using session cookie
        if (!u) {
          try {
            const me = await api.get('/api/me')
            if (me.status === 200 && me.data && me.data.user) u = me.data.user
          } catch (err) {
            // ignore
          }
        }
        setUser(u || { email })
        return true
      }
    } catch (err) {
      // ignore
    }
    return false
  }

  async function logout() {
    try {
      await api.get('/logout')
    } catch (err) {}
    setUser(null)
  }

  function isAuthenticated() {
    return !!user.value
  }

  return { user, setUser, login, logout, isAuthenticated }
})
