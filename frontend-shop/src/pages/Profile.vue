<template>
  <div class="container py-4">
    <div class="card p-4" style="max-width:720px;margin:0 auto;">
        <div class="d-flex gap-3 align-items-center">
          <img :src="avatarSrc" alt="avatar" style="width:96px;height:96px;object-fit:cover;border-radius:12px;cursor:pointer;" @click="openImage" tabindex="0" @keydown.enter.prevent="openImage" />
        <div>
          <h4 class="mb-1">{{ user?.name || user?.email || 'Người dùng' }}</h4>
          <div class="text-muted">Role: {{ user?.role || 'user' }}</div>
          <div class="mt-2">ID: {{ user?.id || '—' }}</div>
        </div>
      </div>

      <hr />
      <div>
        <h6>Thông tin</h6>
        <p><strong>Email:</strong> {{ user?.email }}</p>
        <p><strong>Địa chỉ:</strong> {{ user?.address || '—' }}</p>
        <p><strong>Số điện thoại:</strong> {{ user?.phone || '—' }}</p>
      </div>
    </div>
  </div>
    <!-- Fullscreen modal for avatar -->
    <div v-if="modalVisible" class="lightbox" @click.self="closeImage">
      <button class="close-x" @click="closeImage" aria-label="Đóng">×</button>
      <img :src="modalImage" alt="avatar large" class="lightbox-img" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const auth = useAuthStore()
const user = computed(() => auth.user)

const backendBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : ''
const avatarSrc = computed(() => {
  if (!user.value || !user.value.avatar) return backendBase + '/placeholder.svg'
  const a = user.value.avatar
  if (a.startsWith('http')) return a
  if (a.startsWith('/')) return backendBase + a
  return backendBase + '/' + a
})

const modalVisible = ref(false)
const modalImage = ref('')

function openImage() {
  modalImage.value = avatarSrc.value
  modalVisible.value = true
  document.body.style.overflow = 'hidden'
}

function closeImage() {
  modalVisible.value = false
  modalImage.value = ''
  document.body.style.overflow = ''
}
</script>

<style scoped>
.card { background: linear-gradient(180deg,#0b1020,#121028); color:#fff; border-radius:12px }
.lightbox { position:fixed; inset:0; display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:2000 }
.lightbox-img { max-width:90vw; max-height:90vh; border-radius:8px }
.close-x { position:absolute; top:18px; right:20px; background:transparent;border:0;color:#fff;font-size:28px }
</style>
