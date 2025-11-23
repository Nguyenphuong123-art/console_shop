<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const auth = useAuthStore()
const loggedIn = computed(() => auth.isAuthenticated())
const router = useRouter()
const showUserModal = ref(false)

const backendBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : ''
function avatarSrc() {
  const a = auth.user && auth.user.avatar ? auth.user.avatar : null
  if (!a) return backendBase + '/placeholder.svg'
  if (a.startsWith('http://') || a.startsWith('https://')) return a
  if (a.startsWith('/')) return backendBase + a
  return backendBase + '/' + a
}

function doLogout() {
  auth.logout()
  router.push('/login')
}

function openProfile() {
  router.push({ name: 'Profile' })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark gaming-nav">
    <div class="container-fluid">
      <a class="navbar-brand" href="/products">Shop</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><router-link class="nav-link" to="/products">Sản phẩm</router-link></li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <div v-if="!loggedIn">
            <router-link class="btn btn-outline-primary me-2" to="/login">Đăng nhập</router-link>
          </div>
          <div v-else class="d-flex align-items-center">
            <img :src="avatarSrc()" alt="avatar" class="nav-avatar me-2" @click="openProfile" tabindex="0" @keydown.enter.prevent="openProfile" />
            <button class="btn btn-icon" @click="doLogout" aria-label="Đăng xuất">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v10" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M5.05 6.05a8 8 0 1013.9 0" stroke="#ff4e00" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<style scoped>
body { padding-top: 70px; }
.gaming-nav { background: linear-gradient(90deg,#0b0f1a,#1b1338); padding: .45rem 1rem; }
.gaming-nav .navbar-brand { color: #ffcc00; font-weight:700; font-size:1.05rem; }
.gaming-nav .nav-link { color: rgba(255,255,255,0.92); }
.gaming-nav .nav-link.router-link-active { color: #ffd66b; }
.gaming-nav .btn-outline-primary { border-color: rgba(255,204,0,0.12); color: #ffd66b }
.gaming-nav .btn-outline-primary:hover { background: rgba(255,78,0,0.06); color:#fff }
.nav-avatar { width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,204,0,0.12);cursor:pointer }
.btn-icon { background:transparent;border:0;color:#fff;padding:6px;border-radius:6px }
</style>
