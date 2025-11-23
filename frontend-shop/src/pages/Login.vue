<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow-sm">
          <h3 class="mb-3">Đăng nhập</h3>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Mật khẩu</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-primary" type="submit">Đăng nhập</button>
              <router-link class="btn btn-link" to="/register-admin">Tạo admin</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const error = ref(null)
const router = useRouter()
const auth = useAuthStore()

async function submit() {
  error.value = null
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    router.push('/')
  } else {
    error.value = 'Đăng nhập thất bại'
  }
}
</script>
