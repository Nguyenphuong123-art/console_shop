<template>
  <div class="products-page">
    <div class="container py-4">
      <h2 class="mb-3 page-title">Sản phẩm</h2>
    <div class="row">
      <div class="col-md-4 mb-4" v-for="p in products" :key="p.id">
        <div class="card product-card h-100 shadow-sm">
          <div class="card-top"></div>
          <div class="card-image-wrapper">
            <img v-if="p.image" :src="p.image" class="card-img-top main-image"
              :alt="p.name || 'Sản phẩm'"
              role="button"
              tabindex="0"
              @click="openModal(p.image, p.name)"
              @keydown.enter.prevent="openModal(p.image, p.name)"
              @keydown.space.prevent="openModal(p.image, p.name)"
              @error="onImgError($event)"
            />
            <div v-else class="placeholder-image" role="img" :aria-label="`Ảnh ${p.name || 'sản phẩm'} chưa có`">
              <img :src="placeholder" alt="no image" style="width:64px;height:64px" />
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ p.name }}</h5>
            <p class="card-text text-muted">{{ p.brand }} • {{ p.origin }}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <div class="fw-bold price">{{ p.price }}₫</div>
              <router-link :to="`/products/${p.id}`" class="btn btn-sm btn-primary">Xem</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Fullscreen modal -->
    <div v-if="modalVisible" class="lightbox" @click.self="closeModal">
      <button class="close-x" @click="closeModal" aria-label="Đóng (Esc)">×</button>
      <img :src="modalImage" :alt="modalAlt" class="lightbox-img" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api/axios'

const products = ref([])
const modalVisible = ref(false)
const modalImage = ref('')
const modalAlt = ref('')
const placeholder = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/placeholder.svg' : ''

onMounted(async () => {
  try {
  const res = await api.get('/api/products')
  const list = Array.isArray(res.data) ? res.data : []

  // Normalize images and set first image as `image` for highlight
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : ''
  const normalized = list.map(p => {
    let imgs = []
    if (Array.isArray(p.images)) imgs = p.images
    else if (typeof p.images === 'string') {
      try { imgs = JSON.parse(p.images) } catch(e) { imgs = [] }
    } else if (p.image) imgs = [p.image]

    imgs = imgs.map(i => {
      if (!i) return i
      if (i.startsWith('http://') || i.startsWith('https://')) return i
      if (i.startsWith('/')) return base + i
      return base + '/' + i
    }).filter(Boolean)

    return { ...p, images: imgs, image: imgs.length ? imgs[0] : null }
  })

  products.value = normalized
  } catch (err) {
    console.error(err)
  }
})

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
.products-page { background: linear-gradient(180deg,#0b1020,#1b1340); min-height:100vh; padding-bottom:40px }
.page-title { background: linear-gradient(90deg,#ff4e00,#ffcc00); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight:700 }
.product-card { border: 0; overflow: hidden; border-radius: 12px; position: relative; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); color:#fff }
.product-card .card-top { height: 8px; background: linear-gradient(90deg,#ff4e00,#ffcc00); }
.card-image-wrapper { display:flex; align-items:center; justify-content:center; height:220px; background: linear-gradient(180deg, rgba(255,78,0,0.03), rgba(255,204,0,0.02)); }
.main-image { width:100%; height:220px; object-fit:cover; transition: transform .25s ease; cursor: pointer }
.main-image:hover { transform: scale(1.03); }
.placeholder-image { width:100%; height:220px; display:flex; align-items:center; justify-content:center; color:#999; background:#0f1530 }
.price { color:#ffb347 }
.product-card:hover { transform: translateY(-6px); transition: transform .18s ease; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

/* Lightbox */
.lightbox { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(3,6,14,0.85); z-index:2000 }
.lightbox-img { max-width:92vw; max-height:90vh; border-radius:8px; box-shadow: 0 20px 60px rgba(0,0,0,0.8) }
.close-x { position:absolute; top:18px; right:20px; background:transparent; border:0; color:#fff; font-size:32px; cursor:pointer }
</style>
