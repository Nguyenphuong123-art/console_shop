import { createRouter, createWebHistory } from 'vue-router'
import Products from '@/pages/Products.vue'
import ProductDetail from '@/pages/ProductDetail.vue'
import Login from '@/pages/Login.vue'
import Profile from '@/pages/Profile.vue'
// avoid importing Pinia store here because router is created before Pinia is installed

const routes = [
  { path: '/', name: 'Home', component: Products },
  { path: '/products', name: 'Products', component: Products },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/register-admin', name: 'RegisterAdmin', component: () => import('@/pages/RegisterAdmin.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.name === 'ProductDetail') {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  next()
})

export default router
