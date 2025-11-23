<template>
  <div class="product-detail-page">
    <div class="container py-4">
    <div v-if="product">
        <h2>{{ product.name }}</h2>
        <div class="row">
          <div class="col-md-6">
            <div v-if="images.length">
              <img :src="selectedImage" class="img-fluid mb-2 main-image" :alt="product.name || 'Ảnh sản phẩm'" @click="openModal(selectedImage, product.name)" tabindex="0" @keydown.enter.prevent="openModal(selectedImage, product.name)" @error="onImgError($event)" style="object-fit:cover;max-height:500px;width:100%" />
              <div class="d-flex flex-wrap gap-2">
                <img v-for="(img, i) in images" :key="i" :src="img" @click="selectedImage = img" @keydown.enter.prevent="selectedImage = img" tabindex="0" role="button" :alt="product.name + ' - ảnh ' + (i+1)" style="width:90px;height:90px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent" :class="{'border-primary': selectedImage===img}" @error="onImgError($event)" />
              </div>
            </div>
            <div v-else>
              <div class="text-muted">Chưa có hình ảnh</div>
            </div>
          </div>
          <div class="col-md-6">
            <h4 class="text-primary">{{ product.price }}₫</h4>
            <p>{{ product.description }}</p>
            <p><strong>Thương hiệu:</strong> {{ product.brand }}</p>
            <p><strong>Xuất xứ:</strong> {{ product.origin }}</p>
          </div>
        </div>
      </div>
    <div v-else>
      <p>Loading...</p>
    </div>
    <!-- Fullscreen modal -->
    <div v-if="modalVisible" class="lightbox" @click.self="closeModal">
      <button class="close-x" @click="closeModal" aria-label="Đóng (Esc)">×</button>
      <img :src="modalImage" :alt="modalAlt" class="lightbox-img" />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const product = ref(null)
const images = ref([])
const selectedImage = ref('')
const modalVisible = ref(false)
const modalImage = ref('')
const modalAlt = ref('')
const placeholder = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/placeholder.svg' : ''

onMounted(async () => {
  if (!auth.isAuthenticated()) {
    // redirect to login
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  try {
    const res = await api.get('/api/products/' + route.params.id)
    product.value = res.data || null
    // normalize images: backend may store `images` as JSON string or array, or a single `image` field
    const p = product.value
    let imgs = []
    if (p) {
      if (Array.isArray(p.images)) imgs = p.images
      else if (typeof p.images === 'string') {
        try { imgs = JSON.parse(p.images) } catch(e) { imgs = [] }
      } else if (p.image) {
        imgs = [p.image]
      }
    }
    // Ensure each image path is an absolute URL pointing to backend static files.
    // Backend stores paths like '/uploads/filename'. Frontend origin is different,
    // so prefix with backend base URL (from axios instance).
    const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : ''
    imgs = imgs.map(i => {
      if (!i) return i
      if (i.startsWith('http://') || i.startsWith('https://')) return i
      if (i.startsWith('/')) return base + i
      return base + '/' + i
    })

    images.value = imgs
    selectedImage.value = imgs.length ? imgs[0] : ''
  } catch (err) {
    console.error(err)
  }
})

// expose to template (script setup bindings are automatic)
function openModal(img, alt) {
  modalImage.value = img
  modalAlt.value = alt || 'Ảnh sản phẩm'
  modalVisible.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modalVisible.value = false
  modalImage.value = ''
  document.body.style.overflow = ''
}

function onImgError(e) {
  e.target.src = placeholder || ''
}

function handleKey(e) {
  if (e.key === 'Escape' && modalVisible.value) closeModal()
}

onMounted(() => document.addEventListener('keydown', handleKey))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKey))

</script>

<style scoped>
.main-image { cursor: pointer }
.lightbox { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(3,6,14,0.85); z-index:2000 }
.lightbox-img { max-width:92vw; max-height:90vh; border-radius:8px; box-shadow: 0 20px 60px rgba(0,0,0,0.8) }
.close-x { position:absolute; top:18px; right:20px; background:transparent; border:0; color:#fff; font-size:32px; cursor:pointer }
.border-primary { border-color: #ffcc00 !important }
</style>
 
