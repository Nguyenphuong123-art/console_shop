<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow-sm">
          <h3 class="mb-3">Tạo tài khoản Admin</h3>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Mật khẩu</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Tên</label>
              <input v-model="name" type="text" class="form-control" required />
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-primary" type="submit">Tạo admin</button>
              <router-link class="btn btn-link" to="/login">Quay lại</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref(null)
const success = ref(null)
const router = useRouter()

async function submit() {
  error.value = null
  success.value = null
  try {
    // create user via backend users route; we set role=admin
    const res = await api.post('/users', { name: name.value, email: email.value, password: password.value, role: 'admin' })
    success.value = 'Tạo admin thành công. Bạn có thể đăng nhập bây giờ.'
    setTimeout(() => router.push('/login'), 1200)
  } catch (err) {
    error.value = 'Không thể tạo admin (email có thể đã tồn tại).'
  }
}
</script>
